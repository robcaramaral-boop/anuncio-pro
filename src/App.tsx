import Login from "./pages/Login";
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from "./lib/supabaseClient";
import { motion, AnimatePresence } from 'motion/react';
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
  History,
  LogOut
} from 'lucide-react';

enum Type {
  STRING = "STRING",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT",
}

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

const Header = ({ handleLogout, credits }: { handleLogout: () => void, credits: number | null }) => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-orange-500 p-2 rounded-lg">
          <Package className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">Anúncio<span className="text-orange-500">Pro</span></span>
      </div>
      <div className="flex items-center gap-4">
        {credits !== null && (
          <div className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 border border-orange-200">
            <Sparkles className="w-4 h-4" />
            {credits} {credits === 1 ? 'Crédito' : 'Créditos'}
          </div>
        )}
        <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
          title="Sair da conta"
        >
          <span className="hidden sm:block">Sair</span>
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
);

const PlansModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const handleSubscribe = (plano: string) => {
    const periodo = billingCycle === 'monthly' ? 'Mensal' : 'Anual';
    const msg = encodeURIComponent(`Olá! Gostaria de assinar o plano ${plano} (${periodo}) do AnúncioPro.`);
    window.open(`https://wa.me/5511999999999?text=${msg}`, '_blank');
  };

  const prices = {
    lite: billingCycle === 'monthly' ? '49,90' : '497,00',
    pro: billingCycle === 'monthly' ? '97,00' : '967,00'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[24px] shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200"
      >
        <div className="p-8 sm:p-12 text-center">
          <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-[800] text-slate-900 mb-2">Aumente suas vendas agora</h2>
          <p className="text-slate-500 mb-8">Escolha o plano ideal para o seu volume de anúncios.</p>

          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Mensal</span>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-14 h-7 bg-slate-200 rounded-full relative p-1 transition-colors"
            >
              <div className={`w-5 h-5 bg-orange-500 rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>Anual</span>
              <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase italic">2 Meses Grátis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="border-2 border-slate-100 rounded-[20px] p-6 hover:border-orange-200 transition-all group">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Vendedor Lite</span>
              <div className="flex items-baseline gap-1 mt-2 mb-4">
                <span className="text-4xl font-black text-slate-900 text-nowrap">R$ {prices.lite}</span>
                <span className="text-slate-400 font-medium">{billingCycle === 'monthly' ? '/mês' : '/ano'}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500" /> 15 anúncios profissionais</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500" /> SEO Shopee e Mercado Livre</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500" /> Imagens em alta definição</li>
              </ul>
              <button 
                onClick={() => handleSubscribe('Vendedor Lite')}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                Assinar Agora
              </button>
            </div>

            <div className="border-2 border-orange-500 rounded-[20px] p-6 bg-orange-50/30 relative">
              <div className="absolute -top-3 right-6 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Mais Vendido</div>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Plano Pro</span>
              <div className="flex items-baseline gap-1 mt-2 mb-4">
                <span className="text-4xl font-black text-slate-900 text-nowrap">R$ {prices.pro}</span>
                <span className="text-slate-400 font-medium">{billingCycle === 'monthly' ? '/mês' : '/ano'}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-700 font-semibold"><Check className="w-4 h-4 text-emerald-500" /> 60 anúncios profissionais</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500" /> SEO Premium com IA</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500" /> Suporte prioritário</li>
              </ul>
              <button 
                onClick={() => handleSubscribe('Pro')}
                className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
              >
                Assinar Agora
              </button>
            </div>
          </div>
          <button onClick={onClose} className="mt-8 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors">
            Talvez mais tarde
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() { 
  const [session, setSession] = useState<any>(null); 
  const [isInitializing, setIsInitializing] = useState(true); 
  const [credits, setCredits] = useState<number | null>(null);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [formData, setFormData] = useState<FormData>({ productName: '', marketplace: 'shopee', image: null });
  const [adProject, setAdProject] = useState<AdProject>({ productName: '', originalImage: null, generatedImages: [], shopeeText: null, mlText: null });
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasLastListing, setHasLastListing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsInitializing(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsInitializing(false);
    });
    return () => { listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const loadCredits = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase.from("profiles").select("credits").eq("id", session.user.id).single();
      if (data) {
        setCredits(data.credits);
        if (data.credits <= 0) setShowPlansModal(true);
      }
    };
    loadCredits();
  }, [session]);

  useEffect(() => {
    const checkLastListing = async () => {
      try {
        const listing = await get<LastListing>('last_listing');
        if (listing && (Date.now() - listing.timestamp < 7 * 24 * 60 * 60 * 1000)) {
          setHasLastListing(true);
        } else {
          await del('last_listing');
        }
      } catch (e) { console.error(e); }
    };
    checkLastListing();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const loadLastListing = async () => {
    const listing = await get<LastListing>('last_listing');
    if (listing) {
      setFormData(listing.formData);
      setAdProject(listing.adProject);
      setGeneratedData(listing.generatedData);
      setStep('result');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setFormData({ ...formData, image: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => { setFormData({ ...formData, image: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  const callSupabaseFunction = async (bodyData: any) => {
    const { data, error } = await supabase.functions.invoke('gerar-anuncio', { body: bodyData });
    if (error) throw new Error(error.message);
    if (data.error) throw new Error(data.error);
    return data;
  }

  const generateAIContent = async () => {
    if (credits === null || credits <= 0) {
      setShowPlansModal(true);
      return;
    }

    try {
      setError(null);
      setStep('processing');

      const safeGenerateTextJSON = async (prompt: string, schema: any) => {
         const data = await callSupabaseFunction({ action: 'generateText', prompt, schema });
         let text = data.text || '{}';
         const start = text.indexOf('{'), end = text.lastIndexOf('}');
         let jsonStr = text.substring(start, end + 1).replace(/[\u0000-\u001F]+/g, " ");
         return JSON.parse(jsonStr);
      };

      let isNewProject = (formData.productName !== adProject.productName || formData.image !== adProject.originalImage);
      let currentImages = isNewProject ? [] : adProject.generatedImages;
      let currentTextData = formData.marketplace === 'shopee' ? adProject.shopeeText : adProject.mlText;

      if (!currentTextData) {
        if (formData.marketplace === 'shopee') {
          setLoadingMessage('Criando SEO para Shopee...');
          const seoSchema = {
            type: Type.OBJECT,
            properties: { title: { type: Type.STRING }, keywords: { type: Type.ARRAY, items: { type: Type.STRING } }, coverSuggestion: { type: Type.STRING }, description: { type: Type.STRING }, hashtags: { type: Type.ARRAY, items: { type: Type.STRING } } },
            required: ["title", "keywords", "coverSuggestion", "description", "hashtags"]
          };
          currentTextData = await safeGenerateTextJSON(`Especialista SEO Shopee para: ${formData.productName}`, seoSchema);
        } else {
          setLoadingMessage('Criando SEO para Mercado Livre...');
          const mlSchema = {
            type: Type.OBJECT,
            properties: { title: { type: Type.STRING }, bullets: { type: Type.ARRAY, items: { type: Type.STRING } }, tags: { type: Type.ARRAY, items: { type: Type.STRING } }, description: { type: Type.STRING } },
            required: ["title", "bullets", "tags", "description"]
          };
          currentTextData = await safeGenerateTextJSON(`Especialista SEO ML para: ${formData.productName}`, mlSchema);
        }
      }

      if (!currentImages || currentImages.length === 0) {
        setLoadingMessage('Gerando imagens profissionais...');
        const promptsData = await safeGenerateTextJSON(`Create 5 image prompts for: ${formData.productName}`, { type: Type.OBJECT, properties: { imagePrompts: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["imagePrompts"] });
        
        const base64Data = formData.image!.split(',')[1];
        const mimeType = formData.image!.match(/data:(.*?);/)?.[1] || 'image/jpeg';

        currentImages = await Promise.all(promptsData.imagePrompts.slice(0, 5).map(async (prompt: string) => {
          const data = await callSupabaseFunction({ action: 'generateImage', prompt, imageBase64: base64Data, mimeType });
          return data.candidates?.[0]?.content?.parts[0]?.inlineData ? `data:image/png;base64,${data.candidates[0].content.parts[0].inlineData.data}` : null;
        }));
      }

      // --- SALVANDO NO HISTÓRICO DO SUPABASE ---
      try {
        await supabase.from('anuncios').insert([{
          user_id: session.user.id,
          product_name: formData.productName,
          marketplace: formData.marketplace,
          shopee_text: formData.marketplace === 'shopee' ? currentTextData : null,
          ml_text: formData.marketplace === 'ml' ? currentTextData : null,
          images: currentImages.filter(img => img !== null)
        }]);
      } catch (dbError) { console.error("Erro ao salvar no banco:", dbError); }

      const newAdProject = { ...adProject, productName: formData.productName, originalImage: formData.image, generatedImages: currentImages, shopeeText: formData.marketplace === 'shopee' ? currentTextData : adProject.shopeeText, mlText: formData.marketplace === 'ml' ? currentTextData : adProject.mlText };
      const newGeneratedData = { marketplace: formData.marketplace, images: currentImages, textData: currentTextData! };

      setAdProject(newAdProject);
      setGeneratedData(newGeneratedData);
      
      const compressedImages = await Promise.all(currentImages.map(async (img) => img ? await compressImageToWebP(img, 0.8) : null));
      const compressedOriginal = formData.image ? await compressImageToWebP(formData.image, 0.8) : null;
      await set('last_listing', { timestamp: Date.now(), formData: { ...formData, image: compressedOriginal }, adProject: { ...newAdProject, originalImage: compressedOriginal, generatedImages: compressedImages }, generatedData: { ...newGeneratedData, images: compressedImages } });
      setHasLastListing(true);

      const newCredits = credits - 1;
      await supabase.from("profiles").update({ credits: newCredits }).eq("id", session.user.id);
      setCredits(newCredits);
      setStep('result');
    } catch (err: any) { setError(err.message); setStep('input'); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.image) return alert('Preencha os campos obrigatórios.');
    generateAIContent();
  };

  const resetApp = () => { setStep('input'); setFormData({ productName: '', marketplace: 'shopee', image: null }); setGeneratedData(null); };

  const downloadZip = async () => {
    if (!generatedData) return;
    const zip = new JSZip();
    const data = generatedData.textData as any;
    zip.file(`SEO.txt`, `TÍTULO: ${data.title}\nDESCRIÇÃO: ${data.description}`);
    generatedData.images.forEach((img, i) => img && zip.file(`imagem_${i+1}.png`, img.split(',')[1], { base64: true }));
    saveAs(await zip.generateAsync({ type: 'blob' }), `AnuncioPro_${formData.productName}.zip`);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans text-slate-900">
      <Header handleLogout={handleLogout} credits={credits} />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-slate-900 mb-4">Crie anúncios que vendem</h1>
                <p className="text-slate-500">SEO + Imagens otimizadas em segundos.</p>
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <label className="block text-sm font-bold">Nome do Produto *</label>
                      <input type="text" className="w-full p-3 rounded-xl border" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
                      <label className="block text-sm font-bold">Marketplace</label>
                      <div className="flex gap-4">
                        {['shopee', 'ml'].map(m => (
                          <button key={m} type="button" onClick={() => setFormData({...formData, marketplace: m as Marketplace})} className={`flex-1 p-3 rounded-xl border ${formData.marketplace === m ? 'bg-orange-500 text-white' : ''}`}>
                            {m === 'shopee' ? 'Shopee' : 'Mercado Livre'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center relative min-h-[250px]" onClick={() => !formData.image && fileInputRef.current?.click()}>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                      {formData.image ? <img src={formData.image} className="h-full object-contain" /> : <div className="text-center"><UploadCloud className="mx-auto mb-2" /> Carregar Foto</div>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    {hasLastListing && <button type="button" onClick={loadLastListing} className="p-3 rounded-xl border flex gap-2"><History /> Último</button>}
                    <button type="submit" className="bg-orange-500 text-white p-3 px-8 rounded-xl font-bold">Gerar Anúncio</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
          {step === 'processing' && (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-orange-500 mb-4" />
              <h2 className="text-xl font-bold">{loadingMessage}</h2>
            </div>
          )}
          {step === 'result' && generatedData && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">Anúncio Pronto!</h2>
                <div className="flex gap-4">
                  <button onClick={resetApp} className="p-3 rounded-xl border">Novo</button>
                  <button onClick={downloadZip} className="bg-orange-500 text-white p-3 px-8 rounded-xl flex gap-2"><Download /> Baixar ZIP</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-3xl border space-y-4">
                  <h3 className="font-bold border-b pb-2">Imagens Geradas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {generatedData.images.map((img, i) => img && <img key={i} src={img} className="rounded-xl border" />)}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border">
                  <h3 className="font-bold border-b pb-2">SEO Otimizado</h3>
                  <pre className="text-sm whitespace-pre-wrap mt-4">{JSON.stringify(generatedData.textData, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
      <PlansModal isOpen={showPlansModal} onClose={() => setShowPlansModal(false)} />
    </div>
  );
}