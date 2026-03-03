export default async function handler(req, res) {
  const tokenRecebido = req.query.token || "";
  const tokenEnv = process.env.KIWIFY_WEBHOOK_TOKEN || "";

  return res.status(200).json({
    ok: true,
    metodo: req.method,
    tokenRecebidoInicio: tokenRecebido.slice(0, 6),
    tokenEnvExiste: !!tokenEnv,
    tokenEnvInicio: tokenEnv ? tokenEnv.slice(0, 6) : null,
  });
}