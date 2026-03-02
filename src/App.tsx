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
  History,
  LogOut,
  User,
  ChevronDown,
  Crown
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

interface UserProfile {
  credits: number;
  plan_name: string;
  expires_at: string | null;
}

// ... [Manter interfaces ShopeeData, MLData, GeneratedData, AdProject, LastListing] ...
interface ShopeeData { title: string; keywords: string[]; coverSuggestion: string; description: string; hashtags: string[]; }
interface MLData { title: string; bullets: string[]; tags: string[]; description: string; }
interface GeneratedData { marketplace: Marketplace; images: (string | null)[]; textData: ShopeeData | MLData; }
interface AdProject { productName: string; originalImage: string | null; generatedImages: (string | null)[]; shopeeText: ShopeeData | null; mlText: MLData | null; }
interface LastListing { timestamp: number; formData: FormData; adProject: AdProject; generatedData: GeneratedData; }

const compressImageToWebP = (base64: string, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(base64);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/webp', quality));
    };
    img.src = base64;
  });
};

const calculateDaysLeft = (expiresAt: string | null) => {
  if (!expiresAt) return 0;
  const diff = new Date(expiresAt).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
};

// --- Components ---

const Header = ({ handleLogout, profile, session, openPlans }: { handleLogout: () => void, profile: UserProfile | null, session: any, openPlans: () => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const daysLeft = calculateDaysLeft(profile?.expires_at);
  const isPremium = profile?.plan_name && profile.plan_name !== 'Gratuito';

  return (
    <header className="bg-[#0F172A] border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight hidden sm:block">Anúncio<span className="text-orange-500">Pro</span></span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mostrador de Créditos (Só para plano Gratuito) */}
          {!isPremium && profile?.credits !== undefined && (
            <div className="bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 border border-orange-500/20">
              <Sparkles className="w-4 h-4" />
              {profile.credits} Créditos
            </div>
          )}

          {/* Menu de Perfil Premium */}
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full transition-colors"
            >
              <div className={`p-1 rounded-full ${isPremium ? 'bg-gradient-to-tr from-orange-500 to-yellow-400' : 'bg-slate-600'}`}>
                {isPremium ? <Crown className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
              </div>
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-bold text-white leading-none capitalize">{profile?.plan_name || 'Gratuito'}</span>
                {isPremium ? (
                   <span className={`text-[10px] font-bold leading-none mt-0.5 ${daysLeft <= 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                     {daysLeft} dias restantes
                   </span>
                ) : (
                   <span className="text-[10px] text-slate-400 leading-none mt-0.5">Fazer Upgrade</span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Aberto */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#1E293B] border border-slate-700 rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-700/50 mb-2">
                  <p className="text-xs text-slate-400 font-medium">Conectado como</p>
                  <p className="text-sm font-bold text-white truncate">{session?.user?.email}</p>
                </div>
                
                <button onClick={() => { openPlans(); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 flex items-center gap-2 transition-colors">
                  <Sparkles className="w-4 h-4 text-orange-500" /> Mudar de Plano
                </button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-slate-800 flex items-center gap-2 transition-colors mt-1 border-t border-slate-700/50">
                  <LogOut className="w-4 h-4" /> Sair do Sistema
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const PlansModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  if (!isOpen) return null;

  const handleSubscribe = (plano: string) => {
    const periodo = billingCycle === 'monthly' ? 'Mensal' : 'Anual';
    const msg = encodeURIComponent(`Olá! Gostaria de assinar o plano ${plano} (${periodo}) do AnúncioPro.`);
    window.open(`https://wa.me/5511999999999?text=${msg}`, '_blank');
  };

  const content = {
    lite: { price: billingCycle === 'monthly' ? '49,90' : '497,00', ads: billingCycle === 'monthly' ? '15 anúncios profissionais' : '180 anúncios profissionais' },
    pro: { price: billingCycle === 'monthly' ? '97,00' : '967,00', ads: billingCycle === 'monthly' ? '60 anúncios profissionais' : '720 anúncios profissionais' }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[24px] shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200">
        <div className="p-8 sm:p-12 text-center">
          <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"><Sparkles className="w-8 h-8" /></div>
          <h2 className="text-3xl font-[800] text-slate-900 mb-2">Aumente suas vendas agora</h2>
          <p className="text-slate-500 mb-8 font-medium">Escolha o plano ideal para o seu volume de anúncios.</p>

          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Mensal</span>
            <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')} className="w-14 h-7 bg-slate-200 rounded-full relative p-1 transition-colors">
              <div className={`w-5 h-5 bg-orange-500 rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>Anual</span>
              <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase italic">2 Meses Grátis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="border-2 border-slate-100 rounded-[20px] p-6 hover:border-orange-200 transition-all">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Vendedor Lite</span>
              <div className="flex items-baseline gap-1 mt-2 mb-4"><span className="text-4xl font-black text-slate-900">R$ {content.lite.price}</span><span className="text-slate-400 font-medium">/{billingCycle === 'monthly' ? 'mês' : 'ano'}</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-orange-600 font-bold"><Check className="w-4 h-4" /> {content.lite.ads}</li>
                <li className="flex items-center gap-2 text-sm text-slate-600 font-medium"><Check className="w-4 h-4 text-emerald-500" /> SEO Shopee e Mercado Livre</li>
              </ul>
              <button onClick={() => handleSubscribe('Vendedor Lite')} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg">Assinar Agora</button>
            </div>
            <div className="border-2 border-orange-500 rounded-[20px] p-6 bg-orange-50/30 relative">
              <div className="absolute -top-3 right-6 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Mais Vendido</div>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Plano Pro</span>
              <div className="flex items-baseline gap-1 mt-2 mb-4"><span className="text-4xl font-black text-slate-900">R$ {content.pro.price}</span><span className="text-slate-400 font-medium">/{billingCycle === 'monthly' ? 'mês' : 'ano'}</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-orange-600 font-bold"><Check className="w-4 h-4" /> {content.pro.ads}</li>
                <li className="flex items-center gap-2 text-sm text-slate-800 font-bold"><Check className="w-4 h-4 text-emerald-500" /> SEO Premium e Imagens HD</li>
              </ul>
              <button onClick={() => handleSubscribe('Pro')} className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100">Assinar Agora</button>
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
    const loadProfile = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase.from("profiles").select("credits, plan_name, expires_at").eq("id", session.user.id).single();
      if (data) {
        setProfile(data);
        const daysLeft = calculateDaysLeft(data.expires_at);
        
        // Regra de Bloqueio do App
        if (data.plan_name !== 'Gratuito' && daysLeft <= 0) {
          setShowPlansModal(true);
        } else if ((!data.plan_name || data.plan_name === 'Gratuito') && data.credits <= 0) {
          setShowPlansModal(true);
        }
      }
    };
    loadProfile();
  }, [session]);

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    setSession(null);
  };

  const generateAIContent = async () => {
    // Validação de segurança no momento do clique
    const daysLeft = calculateDaysLeft(profile?.expires_at || null);
    if (profile?.plan_name && profile.plan_name !== 'Gratuito' && daysLeft <= 0) {
      alert("Seu plano expirou! Renove para continuar gerando.");
      setShowPlansModal(true);
      return;
    }
    if ((!profile?.plan_name || profile?.plan_name === 'Gratuito') && (profile?.credits === null || profile?.credits <= 0)) {
      setShowPlansModal(true); 
      return; 
    }

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

      let isNewProject = (formData.productName !== adProject.productName || formData.image !== adProject.originalImage);
      let currentImages = isNewProject ? [] : adProject.generatedImages;
      let currentTextData = formData.marketplace === 'shopee' ? adProject.shopeeText : adProject.mlText;

      if (!currentTextData) {
        if (formData.marketplace === 'shopee') {
          setLoadingMessage('Criando SEO para Shopee...');
          const seoSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, keywords: { type: Type.ARRAY, items: { type: Type.STRING } }, coverSuggestion: { type: Type.STRING }, description: { type: Type.STRING }, hashtags: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title", "keywords", "coverSuggestion", "description", "hashtags"] };
          currentTextData = await safeGenerateTextJSON(`Especialista SEO Shopee para: ${formData.productName}`, seoSchema);
        } else {
          setLoadingMessage('Criando SEO para Mercado Livre...');
          const mlSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, bullets: { type: Type.ARRAY, items: { type: Type.STRING } }, tags: { type: Type.ARRAY, items: { type: Type.STRING } }, description: { type: Type.STRING } }, required: ["title", "bullets", "tags", "description"] };
          currentTextData = await safeGenerateTextJSON(`Especialista SEO ML para: ${formData.productName}`, mlSchema);
        }
      }

      if (!currentImages || currentImages.length === 0) {
        setLoadingMessage('Gerando imagens profissionais...');
        const promptsData = await safeGenerateTextJSON(`Create 5 image prompts for: ${formData.productName}`, { type: Type.OBJECT, properties: { imagePrompts: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["imagePrompts"] });
        const base64Data = formData.image!.split(',')[1];
        const mimeType = formData.image!.match(/data:(.*?);/)?.[1] || 'image/jpeg';

        currentImages = await Promise.all(promptsData.imagePrompts.slice(0, 5).map(async (prompt: string) => {
          const { data } = await supabase.functions.invoke('gerar-anuncio', { body: { action: 'generateImage', prompt, imageBase64: base64Data, mimeType } });
          return data.candidates?.[0]?.content?.parts[0]?.inlineData ? `data:image/png;base64,${data.candidates[0].content.parts[0].inlineData.data}` : null;
        }));
      }

      try {
        await supabase.from('anuncios').insert([{ user_id: session.user.id, product_name: formData.productName, marketplace: formData.marketplace, shopee_text: formData.marketplace === 'shopee' ? currentTextData : null, ml_text: formData.marketplace === 'ml' ? currentTextData : null, images: currentImages.filter(img => img !== null) }]);
      } catch (dbError) { console.error("Erro ao salvar no banco:", dbError); }

      const newAdProject = { ...adProject, productName: formData.productName, originalImage: formData.image, generatedImages: currentImages, shopeeText: formData.marketplace === 'shopee' ? currentTextData : adProject.shopeeText, mlText: formData.marketplace === 'ml' ? currentTextData : adProject.mlText };
      const newGeneratedData = { marketplace: formData.marketplace, images: currentImages, textData: currentTextData! };
      setAdProject(newAdProject);
      setGeneratedData(newGeneratedData);
      
      const compressedImages = await Promise.all(currentImages.map(async (img) => img ? await compressImageToWebP(img, 0.8) : null));
      const compressedOriginal = formData.image ? await compressImageToWebP(formData.image, 0.8) : null;
      await set('last_listing', { timestamp: Date.now(), formData: { ...formData, image: compressedOriginal }, adProject: { ...newAdProject, originalImage: compressedOriginal, generatedImages: compressedImages }, generatedData: { ...newGeneratedData, images: compressedImages } });
      setHasLastListing(true);

      // Desconta crédito só se for plano gratuito
      if (!profile?.plan_name || profile.plan_name === 'Gratuito') {
        const newCredits = (profile?.credits || 0) - 1;
        await supabase.from("profiles").update({ credits: newCredits }).eq("id", session.user.id);
        setProfile(prev => prev ? {...prev, credits: newCredits} : null);
      }
      
      setStep('result');
    } catch (err: any) { setError(err.message); setStep('input'); }
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

  const loadLastListing = async () => {
    const listing = await get<LastListing>('last_listing');
    if (listing) {
      setFormData(listing.formData);
      setAdProject(listing.adProject);
      setGeneratedData(listing.generatedData);
      setStep('result');
    }
  };

  if (!session) return <Login />;

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans text-slate-900">
      <Header handleLogout={handleLogout} profile={profile} session={session} openPlans={() => setShowPlansModal(true)} />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Crie anúncios que vendem</h1>
                <p className="text-slate-400 text-lg font-medium">SEO + Imagens otimizadas para Marketplaces.</p>
              </div>
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-10">
                <form onSubmit={(e) => { e.preventDefault(); generateAIContent(); }} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <label className="block text-sm font-bold text-slate-700">Nome do Produto *</label>
                      <input type="text" required className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 text-slate-900" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
                      <label className="block text-sm font-bold text-slate-700">Marketplace</label>
                      <div className="flex gap-4">
                        {['shopee', 'ml'].map(m => (
                          <button key={m} type="button" onClick={() => setFormData({...formData, marketplace: m as Marketplace})} className={`flex-1 p-4 rounded-xl border font-bold transition-all ${formData.marketplace === m ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                            {m === 'shopee' ? 'Shopee' : 'Mercado Livre'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-[32px] p-8 flex flex-col items-center justify-center relative min-h-[280px] hover:border-orange-300 transition-colors cursor-pointer group" onClick={() => !formData.image && fileInputRef.current?.click()}>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                      {formData.image ? <img src={formData.image} className="h-full object-contain rounded-xl" /> : <div className="text-center text-slate-400 font-bold leading-tight group-hover:text-orange-500 transition-colors"><UploadCloud className="mx-auto mb-3 w-10 h-10 text-orange-400" /> Clique ou arraste a foto aqui</div>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                    {hasLastListing && <button type="button" onClick={loadLastListing} className="p-4 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-2 text-slate-700"><History className="w-5 h-5"/> Último Anúncio</button>}
                    <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white p-4 px-10 rounded-xl font-black shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> Gerar Anúncio com IA
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <div className="text-center py-32">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">{loadingMessage}</h2>
              <p className="text-slate-400 font-medium">Isso leva cerca de 20 segundos...</p>
            </div>
          )}

          {step === 'result' && generatedData && (
            <div className="max-w-6xl mx-auto space-y-10">
               <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h2 className="text-3xl font-black text-white">Anúncio Pronto!</h2>
                  <p className="text-slate-400 font-medium">SEO e Imagens geradas para {generatedData.marketplace === 'ml' ? 'Mercado Livre' : 'Shopee'}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={resetApp} className="p-4 px-8 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors border border-slate-700">Novo Produto</button>
                  <button onClick={downloadZip} className="bg-orange-500 text-white p-4 px-8 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-colors"><Download className="w-5 h-5" /> Baixar Pacote</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-5 bg-white p-8 rounded-[32px] border border-slate-200 space-y-6 shadow-2xl">
                  <h3 className="font-black text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-orange-500" /> Imagens Geradas</h3>
                  <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                    <img src={generatedData.images[0]!} className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {generatedData.images.slice(1).map((img, i) => img && <img key={i} src={img} className="rounded-xl border border-slate-100 shadow-sm" />)}
                  </div>
                </div>
                <div className="lg:col-span-7 bg-white p-8 rounded-[32px] border border-slate-200 shadow-2xl">
                  {generatedData.marketplace === 'shopee' ? (
                    <ShopeeResultCard data={generatedData.textData as ShopeeData} />
                  ) : (
                    <MLResultCard data={generatedData.textData as MLData} />
                  )}
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

// --- Cards Bonitos ---
const ShopeeResultCard = ({ data }: { data: ShopeeData }) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    const text = `TÍTULO:\n${data.title}\n\nDESCRIÇÃO:\n${data.description}\n\nHASHTAGS:\n${data.hashtags?.join(' ')}\n\nPALAVRAS-CHAVE:\n${data.keywords?.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
         <h3 className="font-black text-slate-900 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-orange-500" /> SEO Especialista - Shopee</h3>
         <button onClick={copyToClipboard} className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
           {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} {copied ? 'Copiado!' : 'Copiar Tudo'}
         </button>
      </div>
      <div><span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 block">Título Otimizado</span><div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-slate-900">{data.title}</div></div>
      <div><span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 block">Descrição</span><div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">{data.description}</div></div>
      <div><span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 block">Hashtags</span><div className="flex flex-wrap gap-2">{data.hashtags?.map((h, i) => <span key={i} className="text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100 font-bold text-sm">#{h.replace('#','')}</span>)}</div></div>
    </div>
  );
};

const MLResultCard = ({ data }: { data: MLData }) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    const text = `TÍTULO:\n${data.title}\n\nBULLETS:\n${data.bullets?.map(b => `- ${b}`).join('\n')}\n\nDESCRIÇÃO:\n${data.description}\n\nPALAVRAS-CHAVE:\n${data.tags?.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
         <h3 className="font-black text-slate-900 flex items-center gap-2"><Store className="w-5 h-5 text-yellow-500" /> SEO Platinum - Mercado Livre</h3>
         <button onClick={copyToClipboard} className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-yellow-600 transition-colors bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
           {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} {copied ? 'Copiado!' : 'Copiar Tudo'}
         </button>
      </div>
      <div><span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 block">Título Otimizado</span><div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-slate-900">{data.title}</div></div>
      <div><span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 block">Bullet Points</span><ul className="space-y-2">{data.bullets?.map((b, i) => <li key={i} className="text-sm text-slate-700 bg-orange-50/50 p-3 rounded-lg border border-orange-100 flex items-start gap-2 font-medium"> <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" /> {b}</li>)}</ul></div>
      <div><span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 block">Descrição Persuasiva</span><div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{data.description}</div></div>
    </div>
  );
};