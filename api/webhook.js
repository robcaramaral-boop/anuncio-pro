import { createClient } from "@supabase/supabase-js";

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const token =
    ((req.headers.authorization || "").replace("Bearer ", "") ||
      (req.query.token || ""))
      .trim();

  const envToken = (process.env.KIWIFY_WEBHOOK_TOKEN || "").trim();
  if (!envToken) return res.status(500).send("Missing KIWIFY_WEBHOOK_TOKEN env");
  if (token !== envToken) return res.status(401).send("Unauthorized");

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const payload = req.body;

  const statusRaw = String(payload?.status ?? payload?.order_status ?? payload?.event ?? "").toLowerCase();
  const email =
    payload?.customer?.email ??
    payload?.buyer?.email ??
    payload?.email ??
    null;

  const productName =
    payload?.product?.name ??
    payload?.offer?.name ??
    payload?.product_name ??
    payload?.plan ??
    "";

  if (!email) return res.status(400).send("Missing email");

  const isPaid = ["paid", "approved", "active", "completed"].includes(statusRaw);
  const isBad = ["refunded", "chargeback", "disputed", "canceled", "cancelled", "reversed"].includes(statusRaw);

  // ✅ Seus valores
  let plan_name = "Gratuito";
  let credits = 3; // grátis padrão
  let expires_at = null;

  if (isPaid) {
    const p = String(productName || "").toLowerCase();
    const isYearly = p.includes("anual") || p.includes("year");
    const days = isYearly ? 365 : 30;

    if (p.includes("pro")) {
      plan_name = "Pro";
      credits = isYearly ? 600 : 50; // ajuste se quiser
      expires_at = addDays(days);
    } else {
      plan_name = "Lite";
      credits = isYearly ? 240 : 20; // Lite mensal = 20 (como você pediu)
      expires_at = addDays(days);
    }
  }

  if (isBad) {
    plan_name = "Gratuito";
    credits = 3;
    expires_at = null;
  }

  // Acha o usuário no Auth pelo email
  const { data: userData, error: userErr } = await supabase.auth.admin.getUserByEmail(email);
  if (userErr || !userData?.user) {
    return res.status(404).json({
      ok: false,
      message: "User not found in Supabase Auth for this email",
      email
    });
  }

  const userId = userData.user.id;

  // Atualiza profiles
  const { error: upErr } = await supabase
    .from("profiles")
    .update({ plan_name, credits, expires_at })
    .eq("id", userId);

  if (upErr) return res.status(500).send("DB error: " + upErr.message);

  return res.status(200).json({ ok: true, email, plan_name, credits, expires_at, statusRaw });
}