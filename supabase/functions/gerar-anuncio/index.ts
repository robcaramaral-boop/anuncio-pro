const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 1. Responde a checagem de segurança do navegador
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action, prompt, schema, imageBase64, mimeType } = body

    // 2. Pega a chave secreta
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error("Chave GEMINI_API_KEY não encontrada no servidor da nuvem.")
    }

    // ------------------------------------------------------------------
    // ROTA A: Gerar Textos (SEO, Descrições)
    // ------------------------------------------------------------------
    if (action === 'generateText') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`
      
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.7
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      
      // Se o Google recusar, capturamos o erro real
      if (!res.ok) {
        throw new Error(`Google (Texto) recusou: ${data.error?.message || JSON.stringify(data)}`)
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
      
      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ------------------------------------------------------------------
    // ROTA B: Gerar Imagens
    // ------------------------------------------------------------------
    if (action === 'generateImage') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`
      
      const payload = {
        contents: [
          {
            parts: [
              { inlineData: { mimeType: mimeType, data: imageBase64 } },
              { text: prompt }
            ]
          }
        ]
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      
      // Se o Google recusar a imagem, capturamos o erro real
      if (!res.ok) {
        throw new Error(`Google (Imagem) recusou: ${data.error?.message || JSON.stringify(data)}`)
      }

      return new Response(JSON.stringify({ candidates: data.candidates }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error("Ação inválida solicitada ao servidor.")

  } catch (error: any) {
    console.error("Erro no Backend:", error)
    // O TRUQUE: Retornamos status 200 para o React não esconder a mensagem!
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, 
    })
  }
})