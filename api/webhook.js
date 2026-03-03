// api/webhook.js
import { createClient } from "@supabase/supabase-js";

// Vercel Function (Node)
export default async function handler(req, res) {
  // Kiwify normalmente manda POST
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    // 1) Segurança: token (você define um token e configura na Kiwify também)
    // - Opção A: Header Authorization: Bearer SEU_TOKEN
    // - Opção B: Query ?token=SEU_TOKEN
    const token =
      (req.headers.authorization || "").replace("Bearer ", "") ||
      (req.query.token || "");
console.log("WEBHOOK HIT ✅");
console.log("TOKEN_RECEBIDO:", token);
console.log("TOKEN_ENV_EXISTE:", !!process.env.KIWIFY_WEBHOOK_TOKEN);
console.log(
  "TOKEN_ENV_PREFIXO:",
  process.env.KIWIFY_WEBHOOK_TOKEN
    ? process.env.KIWIFY_WEBHOOK_TOKEN.slice(0, 6) + "..."
    : null
);
    if (token !== process.env.KIWIFY_WEBHOOK_TOKEN) {
      return res.status(401).send("Unauthorized");
    }

    // 2) Supabase com Service Role (admin) — NUNCA expor no front
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const payload = req.body;

    // 3) Extração "flexível" (até você me mandar o JSON real da Kiwify)
    const statusRaw = String(
      payload?.status ?? payload?.order_status ?? payload?.event ?? ""
    ).toLowerCase();

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

    // 4) Regra de liberação (ajustamos conforme o padrão real da Kiwify)
    const isActive = ["paid", "approved", "active", "completed"].includes(statusRaw);
    const finalStatus = isActive ? "active" : "inactive";

    // 5) Grava no banco
    const { error } = await supabase
      .from("user_access")
      .upsert(
        {
          email,
          plan,
          status: finalStatus,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    if (error) return res.status(500).send("DB error: " + error.message);

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).send("Webhook error: " + (err?.message || String(err)));
  }
}