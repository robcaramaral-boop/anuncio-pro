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
          <div className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 border border-orange-200 shadow-sm">
            <Sparkles className="w-4 h-4" />
            {credits} {credits === 1 ? 'Crédito' : 'Créditos'}
          </div>
        )}
        <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
        >
          Sair <LogOut className="w-5 h-5" />
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

  const content = {
    lite: {
      price: billingCycle === 'monthly' ? '49,90' : '497,00',
      ads: billingCycle === 'monthly' ? '15 anúncios profissionais' : '180 anúncios profissionais'
    },
    pro: {
      price: billingCycle === 'monthly' ? '97,00' : '967,00',
      ads: billingCycle === 'monthly' ? '60 anúncios profissionais' : '720 anúncios profissionais'
    }
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
          <p className="text-slate-500 mb-8 font-medium">Escolha o plano ideal para o seu volume de anúncios.</p>

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
                <span className="text-4xl font-black text-slate-900">R$ {content.lite.price}</span>
                <span className="text-slate-400 font-medium">/{billingCycle === 'monthly' ? 'mês' : 'ano'}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-orange-600 font-bold"><Check className="w-4 h-4" /> {content.lite.ads}</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500" /> SEO Shopee e Mercado Livre</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500" /> Imagens em alta definição</li>
              </ul>
              <button onClick={() => handleSubscribe('Vendedor Lite')} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg">Assinar Agora</button>
            </div>

            <div className="border-2 border-orange-500 rounded-[20px] p-6 bg-orange-50/30 relative">
              <div className="absolute -top-3 right-6 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Mais Vendido</div>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Plano Pro</span>
              <div className="flex items-baseline gap-1 mt-2 mb-4">
                <span className="text-4xl font-black text-slate-900">R$ {content.pro.price}</span>
                <span className="text-slate-400 font-medium">/{billingCycle === 'monthly' ? 'mês' : 'ano'}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-orange-600 font-bold"><Check className="w-4 h-4" /> {content.pro.ads}</li>
                <li className="flex items-center gap-2 text-sm text-slate-800 font-bold"><Check className="w-4 h-4 text-emerald-500" /> SEO Shopee e Mercado Livre</li>
                <li className="flex items-center gap-2 text-sm text-slate-800 font-bold"><Check className="w-4 h-4 text-emerald-500" /> Imagens em alta definição</li>
              </ul>
              <button onClick={() => handleSubscribe('Pro')} className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all shadow-lg">Assinar Agora</button>
            </div>
          </div>
          <button onClick={onClose} className="mt-8 text-sm text-slate-400 hover:text-slate-600 font-bold">Talvez mais tarde</button>
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
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setIsInitializing(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); setIsInitializing(false); });
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

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const generateAIContent = async () => {
    if (credits === null || credits <= 0) { setShowPlansModal(true); return; }
    try {
      setError(null);
      setStep('processing');
      const safeGenerateTextJSON = async (prompt: string, schema: any) => {
         const { data } = await supabase.functions.invoke('gerar-anuncio', { body: { action: 'generateText', prompt, schema } });
         let text = data.text || '{}';
         const start = text.indexOf('{'), end = text.lastIndexOf('}');
         let jsonStr = text.substring(start, end + 1).replace(/[\u0000-\u001F]+/g, " ");
         return JSON.parse(jsonStr);
      };
      
      const promptsData = await safeGenerateTextJSON(`Create 5 image prompts for: ${formData.productName}`, { type: Type.OBJECT, properties: { imagePrompts: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["imagePrompts"] });
      const base64Data = formData.image!.split(',')[1];
      const mimeType = formData.image!.match(/data:(.*?);/)?.[1] || 'image/jpeg';
      
      setLoadingMessage('Gerando imagens profissionais...');
      const currentImages = await Promise.all(promptsData.imagePrompts.slice(0, 5).map(async (prompt: string) => {
        const { data } = await supabase.functions.invoke('gerar-anuncio', { body: { action: 'generateImage', prompt, imageBase64: base64Data, mimeType } });
        return data.candidates?.[0]?.content?.parts[0]?.inlineData ? `data:image/png;base64,${data.candidates[0].content.parts[0].inlineData.data}` : null;
      }));

      setLoadingMessage('Otimizando SEO...');
      let currentTextData;
      if (formData.marketplace === 'shopee') {
        currentTextData = await safeGenerateTextJSON(`Especialista SEO Shopee para: ${formData.productName}`, { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }, keywords: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "description", "hashtags", "keywords"] });
      } else {
        currentTextData = await safeGenerateTextJSON(`Especialista SEO ML para: ${formData.productName}`, { type: Type.OBJECT, properties: { title: { type: Type.STRING }, bullets: { type: Type.ARRAY, items: { type: Type.STRING } }, description: { type: Type.STRING }, tags: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "bullets", "description", "tags"] });
      }

      await supabase.from('anuncios').insert([{ user_id: session.user.id, product_name: formData.productName, marketplace: formData.marketplace, shopee_text: formData.marketplace === 'shopee' ? currentTextData : null, ml_text: formData.marketplace === 'ml' ? currentTextData : null, images: currentImages.filter(img => img !== null) }]);

      setGeneratedData({ marketplace: formData.marketplace, images: currentImages, textData: currentTextData });
      const newCredits = credits - 1;
      await supabase.from("profiles").update({ credits: newCredits }).eq("id", session.user.id);
      setCredits(newCredits);
      setStep('result');
    } catch (err: any) { setError(err.message); setStep('input'); }
  };

  if (!session) return <Login />;

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans text-slate-900">
      <Header handleLogout={handleLogout} credits={credits} />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Crie anúncios que vendem</h1>
                <p className="text-slate-500 text-lg font-medium">SEO + Imagens otimizadas em segundos.</p>
              </div>
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-10">
                <form onSubmit={(e) => { e.preventDefault(); generateAIContent(); }} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <label className="block text-sm font-bold">Nome do Produto *</label>
                      <input type="text" required className="w-full p-4 rounded-xl border" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
                      <label className="block text-sm font-bold">Marketplace</label>
                      <div className="flex gap-4">
                        {['shopee', 'ml'].map(m => (
                          <button key={m} type="button" onClick={() => setFormData({...formData, marketplace: m as Marketplace})} className={`flex-1 p-4 rounded-xl border font-bold ${formData.marketplace === m ? 'bg-orange-500 text-white' : ''}`}>{m === 'shopee' ? 'Shopee' : 'Mercado Livre'}</button>
                        ))}
                      </div>
                    </div>
                    <div className="border-2 border-dashed rounded-[32px] p-8 flex flex-col items-center justify-center relative min-h-[280px]" onClick={() => !formData.image && fileInputRef.current?.click()}>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                      {formData.image ? <img src={formData.image} className="h-full object-contain" /> : <div className="text-center font-bold text-slate-400"><UploadCloud className="mx-auto mb-2 w-10 h-10" /> Carregar Foto</div>}
                    </div>
                  </div>
                  <div className="flex justify-end pt-6 border-t">
                    <button type="submit" className="bg-orange-500 text-white p-4 px-10 rounded-xl font-black shadow-lg shadow-orange-100 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> Gerar Anúncio com IA
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <div className="text-center py-24">
              <Loader2 className="w-16 h-16 animate-spin mx-auto text-orange-500 mb-6" />
              <h2 className="text-2xl font-black">{loadingMessage}</h2>
            </div>
          )}

          {step === 'result' && generatedData && (
            <div className="max-w-6xl mx-auto space-y-10">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black">Anúncio Pronto!</h2>
                <div className="flex gap-4">
                  <button onClick={() => setStep('input')} className="p-4 px-8 rounded-xl border font-bold">Novo Produto</button>
                  <button onClick={() => {}} className="bg-orange-500 text-white p-4 px-8 rounded-xl font-black flex gap-2 shadow-lg shadow-orange-100"><Download /> Baixar ZIP</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Coluna de Imagens (Premium Look) */}
                <div className="lg:col-span-5 bg-white p-8 rounded-[32px] border border-slate-200 space-y-6 shadow-sm">
                  <h3 className="font-black text-slate-900 border-b pb-4">Imagens Geradas</h3>
                  <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border">
                    <img src={generatedData.images[0]!} className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {generatedData.images.slice(1, 5).map((img, i) => img && <img key={i} src={img} className="rounded-xl border shadow-sm" />)}
                  </div>
                </div>
                {/* Coluna de SEO */}
                <div className="lg:col-span-7 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                  <h3 className="font-black text-slate-900 border-b pb-4 mb-8">SEO Especialista</h3>
                  <pre className="text-sm whitespace-pre-wrap font-sans text-slate-600 leading-relaxed">
                    {JSON.stringify(generatedData.textData, null, 2)}
                  </pre>
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