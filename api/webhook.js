import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // A Kiwify envia POST
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  // Token (header ou query)
  const token =
    (req.headers.authorization || "").replace("Bearer ", "") ||
    (req.query.token || "");

  if (token !== process.env.KIWIFY_WEBHOOK_TOKEN) {
    return res.status(401).send("Unauthorized");
  }

  // Supabase (server)
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const payload = req.body;

  // Pegadores "flexíveis" (ajustamos depois conforme JSON real da Kiwify)
  const statusRaw = String(payload?.status ?? payload?.order_status ?? "").toLowerCase();
  const email =
    payload?.customer?.email ??
    payload?.buyer?.email ??
    payload?.email ??
    null;

  const plan =
    payload?.product?.name ??
    payload?.offer?.name ??
    payload?.plan ??
    payload?.product_name ??
    null;

  if (!email) return res.status(400).send("Missing email");

  // Regras básicas
  const isActive = ["paid", "approved", "active", "completed"].includes(statusRaw);
  const finalStatus = isActive ? "active" : "inactive";

  const { error } = await supabase
    .from("user_access")
    .upsert(
      { email, plan, status: finalStatus, updated_at: new Date().toISOString() },
      { onConflict: "email" }
    );

  if (error) return res.status(500).send("DB error: " + error.message);

  return res.status(200).json({ ok: true });
}