import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { get, set, del } from 'idb-keyval';
import {
  UploadCloud,
  CheckCircle2,
  Package,
  Image as ImageIcon,
  Download,
  Loader2,
  ShoppingBag,
  Store,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  History
} from 'lucide-react';

// --- Types ---
type Marketplace = 'shopee' | 'ml';

interface FormData {
  productName: string;
  marketplace: Marketplace;
  image: string | null;
}

interface ShopeeData {
  title: string;
  keywords: string[];
  coverSuggestion: string;
  description: string;
  hashtags: string[];
}

interface MLData {
  title: string;
  bullets: string[];
  tags: string[];
  description: string;
}

interface GeneratedData {
  marketplace: Marketplace;
  images: (string | null)[];
  textData: ShopeeData | MLData;
}

interface AdProject {
  productName: string;
  originalImage: string | null;
  generatedImages: (string | null)[];
  shopeeText: ShopeeData | null;
  mlText: MLData | null;
}

interface LastListing {
  timestamp: number;
  formData: FormData;
  adProject: AdProject;
  generatedData: GeneratedData;
}

// --- Helper: Compress Image to WebP ---
const compressImageToWebP = (base64: string, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(base64);
      ctx.drawImage(img, 0, 0);
      const webp = canvas.toDataURL('image/webp', quality);
      resolve(webp);
    };
    img.onerror = reject;
    img.src = base64;
  });
};

// --- Components ---

const Header = () => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-orange-500 p-2 rounded-lg">
          <Package className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">Anúncio<span className="text-orange-500">Pro</span></span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-500 hidden sm:block">Gerador com Nano Banana Pro</span>
        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
          <Store className="w-4 h-4 text-slate-600" />
        </div>
      </div>
    </div>
  </header>
);

export default function App() {
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    marketplace: 'shopee',
    image: null
  });
  const [adProject, setAdProject] = useState<AdProject>({
    productName: '',
    originalImage: null,
    generatedImages: [],
    shopeeText: null,
    mlText: null
  });
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasLastListing, setHasLastListing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkLastListing = async () => {
      try {
        const listing = await get<LastListing>('last_listing');
        if (listing) {
          const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
          if (Date.now() - listing.timestamp < SEVEN_DAYS) {
            setHasLastListing(true);
          } else {
            await del('last_listing');
          }
        }
      } catch (e) {
        console.error('Error checking last listing:', e);
      }
    };
    checkLastListing();
  }, []);

  const loadLastListing = async () => {
    try {
      const listing = await get<LastListing>('last_listing');
      if (listing) {
        setFormData(listing.formData);
        setAdProject(listing.adProject);
        setGeneratedData(listing.generatedData);
        setStep('result');
      }
    } catch (e) {
      console.error('Error loading last listing:', e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAIContent = async () => {
    try {
      setError(null);
      setStep('processing');
      
      // 1. Check API Key for Pro models
      if (typeof window !== 'undefined' && (window as any).aistudio?.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      }

      // Initialize AI with the latest key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });

      // Helper function to safely generate and parse JSON with retries
      const safeGenerateJSON = async (prompt: string, schema: any, retries = 2) => {
        for (let i = 0; i <= retries; i++) {
          try {
            const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
                temperature: 0.7
              }
            });
            let text = response.text || '{}';
            
            // Extract JSON from first { to last }
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start === -1 || end === -1) throw new Error("No JSON object found");
            
            let jsonStr = text.substring(start, end + 1);
            // Clean invalid characters
            jsonStr = jsonStr.replace(/[\u0000-\u001F]+/g, " ");
            
            return JSON.parse(jsonStr);
          } catch (err) {
            if (i === retries) throw err;
            console.warn(`JSON parse failed, retrying (${i + 1}/${retries})...`, err);
          }
        }
      };

      // Determine if this is a new project or if we can reuse data
      let isNewProject = false;
      if (formData.productName !== adProject.productName || formData.image !== adProject.originalImage) {
        isNewProject = true;
      }

      let currentImages = isNewProject ? [] : adProject.generatedImages;
      let currentShopeeText = isNewProject ? null : adProject.shopeeText;
      let currentMlText = isNewProject ? null : adProject.mlText;

      let currentTextData = formData.marketplace === 'shopee' ? currentShopeeText : currentMlText;

      // 2. Generate Text (SEO) if not already generated for this marketplace
      if (!currentTextData) {
        if (formData.marketplace === 'shopee') {
          setLoadingMessage('Criando copy e SEO otimizado para Shopee...');
          const seoPrompt = `Você é um Especialista em SEO para Shopee. Diferente do Mercado Livre (que é clean), a Shopee permite títulos mais longos, descrições com emojis e uso pesado de Hashtags.
ESTRUTURA DO TÍTULO: [Produto Principal] + [Características/Adjetivos] + [Benefício] + [Modelos Compatíveis] + [Tags Extras]. Use até 100 caracteres. Capitalize As Primeiras Letras.
O QUE VOCÊ DEVE ENTREGAR:
1. Título Otimizado
2. Palavras-Chave (Tags)
3. Sugestão de Capa (Estilo Shopee com selo ENVIO DO BRASIL ou PRONTA ENTREGA)
4. Texto da Descrição (Headline > Benefícios > Especificações > O que vem na caixa. Use Emojis)
5. Hashtags (15 a 20 hashtags)
Produto: ${formData.productName}
Retorne SOMENTE um JSON válido. Não inclua texto fora do JSON.`;

          const seoSchema = {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              coverSuggestion: { type: Type.STRING },
              description: { type: Type.STRING },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "keywords", "coverSuggestion", "description", "hashtags"]
          };
          currentTextData = await safeGenerateJSON(seoPrompt, seoSchema);
        } else {
          // Mercado Livre - 2 steps
          setLoadingMessage('Criando Meta Dados (Título, Bullets, Tags) para Mercado Livre...');
          const mlMetaPrompt = `Você é um Especialista Sênior em E-commerce, focado exclusivamente no algoritmo do Mercado Livre (Platinum).
ESTRUTURA DO TÍTULO: [Produto/Palavra-chave] + [Atributo Principal] + [Benefício] + [Modelo]. Máximo de 60 caracteres.
O QUE VOCÊ DEVE ENTREGAR:
1. Título Otimizado (Máx 60 chars)
2. 5 Bullet Points de benefícios
3. 10 a 15 Tags (Palavras-chave)
Produto: ${formData.productName}
Retorne SOMENTE um JSON válido. Não inclua texto fora do JSON.`;

          const mlMetaSchema = {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "bullets", "tags"]
          };
          const metaData = await safeGenerateJSON(mlMetaPrompt, mlMetaSchema);

          setLoadingMessage('Criando Descrição Otimizada para Mercado Livre...');
          const mlDescPrompt = `Você é um Especialista Sênior em E-commerce, focado exclusivamente no algoritmo do Mercado Livre (Platinum).
Crie uma descrição persuasiva para o produto: ${formData.productName}.
A descrição deve ter entre 900 e 1200 caracteres.
ESTRUTURA DA DESCRIÇÃO: Headline, Benefícios, O que vem na caixa, Ficha técnica, FAQ, SEO (palavra-chave 6x), Aviso em Negrito (ataque preventivo).
Retorne SOMENTE um JSON válido. Não inclua texto fora do JSON.`;

          const mlDescSchema = {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING }
            },
            required: ["description"]
          };
          const descData = await safeGenerateJSON(mlDescPrompt, mlDescSchema);

          currentTextData = {
            title: metaData.title,
            bullets: metaData.bullets,
            tags: metaData.tags,
            description: descData.description
          };
        }
      }

      // 3. Generate Images if not already generated for this project
      if (!currentImages || currentImages.length === 0) {
        setLoadingMessage('Criando prompts para geração de imagens...');
        
        let promptsPrompt = '';
        if (formData.marketplace === 'shopee') {
          promptsPrompt = `Crie 5 Prompts detalhados (em inglês) para geração de imagens do produto: ${formData.productName}. 
Os prompts devem instruir a manter o produto exato da imagem de referência. 
Inclua: 
1. Hero Cover (fundo branco/sólido, 45 graus, high key lighting, 8k)
2. Lifestyle/Uso
3. Detalhe/Macro
4. Unboxing/Acessórios
5. Instagramável.
Retorne APENAS um JSON válido com a chave "imagePrompts" contendo um array de 5 strings. Não inclua markdown ou texto extra.`;
        } else {
          promptsPrompt = `Crie 5 Prompts detalhados (em inglês) para geração de imagens do produto: ${formData.productName}. 
Os prompts devem instruir a manter o produto exato da imagem de referência. 
Inclua: 
1. Hero Cover (fundo branco, high key lighting, 8k)
2. Detalhe/Macro
3. Lifestyle/Uso
4. Dimensões/Escala
5. Argumento Visual/Benefício.
Retorne APENAS um JSON válido com a chave "imagePrompts" contendo um array de 5 strings. Não inclua markdown ou texto extra.`;
        }

        const promptsSchema = {
          type: Type.OBJECT,
          properties: {
            imagePrompts: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["imagePrompts"]
        };

        const promptsData = await safeGenerateJSON(promptsPrompt, promptsSchema);

        setLoadingMessage('Gerando 5 variações de imagens com Nano Banana Pro...');
        
        const base64Data = formData.image!.split(',')[1];
        const mimeType = formData.image!.match(/data:(.*?);/)?.[1] || 'image/jpeg';

        const imagePrompts = promptsData?.imagePrompts && promptsData.imagePrompts.length >= 5 
          ? promptsData.imagePrompts.slice(0, 5) 
          : [
            "Keep the exact same product from the reference image. The product on a white or vibrant solid color background, perfect studio lighting, soft shading, 45 degree angle. High key lighting, commercial photography, 8k.",
            "Keep the exact same product from the reference image. The product being used by a happy person in a real-life context. Lifestyle photography.",
            "Keep the exact same product from the reference image. Extreme close-up on the texture or technological differential of the product. Macro photography, depth of field.",
            "Keep the exact same product from the reference image. The product out of the box with all accessories next to it, organized (Knolling style).",
            "Keep the exact same product from the reference image. The product on a beautiful table, with a blurred background decoration, looking like an influencer post."
          ];

        const imagePromises = imagePrompts.map(async (prompt: string, index: number) => {
          try {
            const res = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                parts: [
                  { inlineData: { data: base64Data, mimeType } },
                  { text: prompt }
                ]
              }
            });
            
            for (const part of res.candidates?.[0]?.content?.parts || []) {
              if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
              }
            }
            return null;
          } catch (err) {
            console.error(`Error generating image ${index + 1}:`, err);
            return null;
          }
        });

        currentImages = await Promise.all(imagePromises);
      }

      // 4. Save to project state and display
      const newAdProject = {
        productName: formData.productName,
        originalImage: formData.image,
        generatedImages: currentImages,
        shopeeText: formData.marketplace === 'shopee' ? (currentTextData as ShopeeData) : currentShopeeText,
        mlText: formData.marketplace === 'ml' ? (currentTextData as MLData) : currentMlText,
      };

      const newGeneratedData = {
        marketplace: formData.marketplace,
        images: currentImages,
        textData: currentTextData!
      };

      setAdProject(newAdProject);
      setGeneratedData(newGeneratedData);
      
      // Save to IDB with WebP compression
      try {
        const compressedImages = await Promise.all(
          currentImages.map(async (img) => img ? await compressImageToWebP(img, 0.8) : null)
        );
        const compressedOriginal = formData.image ? await compressImageToWebP(formData.image, 0.8) : null;

        const listing: LastListing = {
          timestamp: Date.now(),
          formData: { ...formData, image: compressedOriginal },
          adProject: { ...newAdProject, originalImage: compressedOriginal, generatedImages: compressedImages },
          generatedData: { ...newGeneratedData, images: compressedImages }
        };

        await set('last_listing', listing);
        setHasLastListing(true);
      } catch (e) {
        console.error('Error saving last listing:', e);
      }

      setStep('result');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao gerar o anúncio.');
      setStep('input');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.image) {
      alert('Por favor, preencha o nome do produto e adicione uma imagem.');
      return;
    }
    generateAIContent();
  };

  const resetApp = () => {
    setStep('input');
    setFormData({
      productName: '',
      marketplace: 'shopee',
      image: null
    });
    setAdProject({
      productName: '',
      originalImage: null,
      generatedImages: [],
      shopeeText: null,
      mlText: null
    });
    setGeneratedData(null);
    setError(null);
  };

  const downloadZip = async () => {
    if (!generatedData) return;

    const zip = new JSZip();
    
    // 1. Add SEO Text
    let seoText = '';
    if (generatedData.marketplace === 'shopee') {
      const data = generatedData.textData as ShopeeData;
      seoText = `TÍTULO:\n${data.title}\n\nSUGESTÃO DE CAPA:\n${data.coverSuggestion}\n\nDESCRIÇÃO:\n${data.description}\n\nHASHTAGS:\n${data.hashtags.join(' ')}\n\nPALAVRAS-CHAVE:\n${data.keywords.join(', ')}`;
    } else {
      const data = generatedData.textData as MLData;
      seoText = `TÍTULO:\n${data.title}\n\nBULLETS:\n${data.bullets.map(b => `- ${b}`).join('\n')}\n\nDESCRIÇÃO:\n${data.description}\n\nPALAVRAS-CHAVE:\n${data.tags.join(', ')}`;
    }
    zip.file(`SEO_${generatedData.marketplace.toUpperCase()}.txt`, seoText);

    // 2. Add Images
    const imageNames = [
      '1_Capa_Hero.png',
      '2_Lifestyle.png',
      '3_Detalhe.png',
      '4_Unboxing.png',
      '5_Instagramavel.png'
    ];

    generatedData.images.forEach((imgData, index) => {
      if (imgData) {
        const base64Data = imgData.split(',')[1];
        if (base64Data) {
          zip.file(imageNames[index], base64Data, { base64: true });
        }
      }
    });

    // 3. Generate and Download
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `AnuncioPro_${formData.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <AnimatePresence mode="wait">
          
          {/* --- STEP 1: INPUT FORM --- */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <h1 className="text-[44px] sm:text-[48px] font-[800] text-[#0F172A] tracking-tight leading-tight mb-4">
                  Crie anúncios profissionais em anúncios que vendem
                </h1>
                <p className="text-[18px] text-[#64748B] font-light max-w-2xl mx-auto">
                  SEO + Imagens otimizadas para Shopee e Mercado Livre em segundos.
                </p>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="bg-white rounded-[16px] border border-[#E6E8EE] shadow-[0_6px_18px_rgba(15,23,42,0.06)] overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* Left Column: Text Inputs */}
                    <div className="space-y-8">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                          <Package className="w-4 h-4 text-slate-500" />
                          Nome do Produto *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Smartwatch D20 Pro"
                          className="w-full px-4 h-[50px] rounded-[12px] border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                          value={formData.productName}
                          onChange={e => setFormData({...formData, productName: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                          <Store className="w-4 h-4 text-slate-500" />
                          Marketplace selecionado
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          {(['shopee', 'ml'] as const).map((m) => {
                            const isActive = formData.marketplace === m;
                            return (
                              <label key={m} className={`flex-1 flex items-center justify-center px-4 h-[50px] rounded-[12px] border cursor-pointer transition-all ${isActive ? 'bg-orange-500 border-orange-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                <input
                                  type="radio"
                                  name="marketplace"
                                  value={m}
                                  checked={isActive}
                                  onChange={() => setFormData({...formData, marketplace: m})}
                                  className="sr-only"
                                />
                                <div className="flex items-center gap-2">
                                  {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                                  {isActive && <Check className="w-4 h-4" />}
                                  {!isActive && m === 'shopee' && <ShoppingBag className="w-4 h-4" />}
                                  {!isActive && m === 'ml' && <Store className="w-4 h-4" />}
                                  <span className="font-medium">{m === 'shopee' ? 'Shopee' : 'Mercado Livre'}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Image Upload */}
                    <div className="flex flex-col">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                        <ImageIcon className="w-4 h-4 text-slate-500" />
                        Foto Real do Produto *
                      </label>
                      <p className="text-xs text-slate-500 mb-3">Tire uma foto clara do produto. Usaremos como referência para gerar as 5 variações.</p>
                      
                      <div 
                        className={`flex-1 min-h-[240px] border-2 border-dashed rounded-[16px] flex flex-col items-center justify-center p-6 transition-all relative overflow-hidden ${formData.image ? 'border-orange-500 bg-orange-50/50' : 'border-slate-300 hover:border-orange-400 hover:bg-slate-50'}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => !formData.image && fileInputRef.current?.click()}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        
                        {formData.image ? (
                          <div className="absolute inset-0 w-full h-full group">
                            <img src={formData.image} alt="Preview" className="w-full h-full object-contain p-4" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setFormData({...formData, image: null}); }}
                                className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-100"
                              >
                                Trocar foto
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center cursor-pointer">
                            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                              <UploadCloud className="w-8 h-8" />
                            </div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Clique ou arraste a foto aqui</p>
                            <p className="text-xs text-slate-500">PNG, JPG até 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4">
                    {hasLastListing && (
                      <button
                        type="button"
                        onClick={loadLastListing}
                        className="w-full sm:w-auto bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-8 h-[50px] rounded-[12px] font-bold text-[16px] shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <History className="w-5 h-5" />
                        Último Anúncio
                      </button>
                    )}
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 h-[50px] rounded-[12px] font-bold text-[16px] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      {error ? 'Tentar novamente' : 'Gerar Anúncio com IA'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* --- STEP 2: PROCESSING --- */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-orange-500 animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">Trabalhando no seu anúncio...</h2>
              <p className="text-slate-600 font-medium flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                {loadingMessage}
              </p>
              <p className="text-xs text-slate-400 mt-4 max-w-xs text-center">Isso pode levar alguns segundos. Estamos gerando imagens em alta resolução.</p>
            </motion.div>
          )}

          {/* --- STEP 3: RESULT --- */}
          {step === 'result' && generatedData && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-[32px] font-[800] text-[#0F172A] flex items-center gap-3 tracking-tight">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    Anúncio Pronto!
                  </h2>
                  <p className="text-[#64748B] mt-2 text-[16px]">SEO e Imagens geradas com sucesso para {generatedData.marketplace === 'shopee' ? 'Shopee' : 'Mercado Livre'}.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto flex-wrap justify-end">
                  <button onClick={() => setStep('input')} className="px-6 h-[50px] rounded-[12px] border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-all text-center shadow-sm">
                    Voltar
                  </button>
                  <button onClick={resetApp} className="px-6 h-[50px] rounded-[12px] border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-all text-center shadow-sm">
                    Novo Produto
                  </button>
                  <button onClick={downloadZip} className="px-6 h-[50px] rounded-[12px] bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Baixar Pacote
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Visuals Column (Images) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white rounded-[16px] border border-[#E6E8EE] shadow-[0_6px_18px_rgba(15,23,42,0.06)] overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-slate-500" />
                      <h3 className="font-bold text-slate-800">Imagens Geradas (Nano Banana Pro)</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      
                      {/* Image 1: Capa Hero */}
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                        {generatedData.images[0] ? (
                          <img src={generatedData.images[0]} alt="Capa Hero" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Falha ao gerar</div>
                        )}
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-700 shadow-sm">
                          1. Capa Hero
                        </div>
                      </div>
                      
                      {/* Thumbnails Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { title: '2. Lifestyle', img: generatedData.images[1] },
                          { title: '3. Detalhe/Zoom', img: generatedData.images[2] },
                          { title: '4. Unboxing/Kit', img: generatedData.images[3] },
                          { title: '5. Instagramável', img: generatedData.images[4] }
                        ].map((item, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                            {item.img ? (
                              <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs text-center p-2">Falha</div>
                            )}
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-slate-700 shadow-sm">
                              {item.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Column (SEO) */}
                <div className="lg:col-span-7 space-y-6">
                  {generatedData.marketplace === 'shopee' ? (
                    <ShopeeResultCard data={generatedData.textData as ShopeeData} />
                  ) : (
                    <MLResultCard data={generatedData.textData as MLData} />
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Helper Components ---

const ShopeeResultCard = ({ data }: { data: ShopeeData }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `TÍTULO:\n${data.title}\n\nDESCRIÇÃO:\n${data.description}\n\nHASHTAGS:\n${data.hashtags.join(' ')}\n\nPALAVRAS-CHAVE:\n${data.keywords.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-[16px] border border-[#E6E8EE] shadow-[0_6px_18px_rgba(15,23,42,0.06)] overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold text-slate-800">SEO Especialista - Shopee</h3>
        </div>
        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado!' : 'Copiar Tudo'}
        </button>
      </div>
      
      <div className="p-6 space-y-8">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Título Otimizado ({data.title?.length || 0} chars)</span>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium text-slate-900">
            {data.title}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Sugestão de Capa</span>
          <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-orange-800 text-sm font-medium flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            {data.coverSuggestion}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Descrição Persuasiva</span>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
            {data.description}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Hashtags</span>
          <div className="flex flex-wrap gap-2">
            {data.hashtags?.map((h, i) => (
              <span key={i} className="text-blue-600 text-sm font-medium">{h.startsWith('#') ? h : `#${h}`}</span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Palavras-chave (Tags)</span>
          <div className="flex flex-wrap gap-2">
            {data.keywords?.map((k, i) => (
              <span key={i} className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium">
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MLResultCard = ({ data }: { data: MLData }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `TÍTULO:\n${data.title}\n\nBULLETS:\n${data.bullets.map(b => `- ${b}`).join('\n')}\n\nDESCRIÇÃO:\n${data.description}\n\nPALAVRAS-CHAVE:\n${data.tags.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-[16px] border border-[#E6E8EE] shadow-[0_6px_18px_rgba(15,23,42,0.06)] overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-slate-800">SEO Especialista Platinum - Mercado Livre</h3>
        </div>
        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-yellow-600 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado!' : 'Copiar Tudo'}
        </button>
      </div>
      
      <div className="p-6 space-y-8">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Título Otimizado ({data.title?.length || 0} chars)</span>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium text-slate-900">
            {data.title}
          </div>
          {(data.title?.length || 0) > 60 && (
            <p className="text-xs text-red-500 mt-1">Aviso: Título passou de 60 caracteres.</p>
          )}
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Bullet Points</span>
          <ul className="space-y-2">
            {data.bullets?.map((b, i) => (
              <li key={i} className="text-sm text-slate-700 bg-yellow-50/50 px-3 py-2 rounded-lg border border-yellow-100 flex items-start gap-2">
                <span className="font-bold text-yellow-600">•</span> {b}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Descrição Persuasiva</span>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
            {data.description}
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Palavras-chave (Tags)</span>
          <div className="flex flex-wrap gap-2">
            {data.tags?.map((k, i) => (
              <span key={i} className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium">
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

