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

  let plan_name = "Gratuito";
  let credits = 3; // Créditos para quem acabou de criar conta (se quiser dar)
  let expires_at = null;

  if (isPaid) {
    const p = String(productName || "").toLowerCase();
    const isYearly = p.includes("anual") || p.includes("year");
    const days = isYearly ? 365 : 30;

    // ✅ REGRAS EXATAS DOS SEUS PLANOS
    if (p.includes("pro")) {
      plan_name = "Pro";
      credits = isYearly ? 600 : 50; 
      expires_at = addDays(days);
    } else if (p.includes("lite")) {
      plan_name = "Lite";
      credits = isYearly ? 240 : 20; 
      expires_at = addDays(days);
    } else {
      // Caso a Kiwify mande um nome diferente, joga pro Lite por segurança
      plan_name = "Lite";
      credits = 20;
      expires_at = addDays(30);
    }
  }

  // ✅ TRAVA DE SEGURANÇA: Se pedir reembolso ou cancelar, zera tudo
  if (isBad) {
    plan_name = "Gratuito";
    credits = 0; 
    expires_at = null;
  }

  // Acha o usuário no Auth pelo email
  const { data: userData, error: userErr } = await supabase.auth.admin.getUserByEmail(email);
  if (userErr || !userData?.user) {
    return res.status(404).json({
      ok: false,
      message: "Usuário não encontrado no Supabase com este email",
      email
    });
  }

  const userId = userData.user.id;

  // Atualiza a tabela profiles com os créditos novos
  const { error: upErr } = await supabase
    .from("profiles")
    .update({ plan_name, credits, expires_at })
    .eq("id", userId);

  if (upErr) return res.status(500).send("DB error: " + upErr.message);

  return res.status(200).json({ ok: true, email, plan_name, credits, expires_at, statusRaw });
}