import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Package, Sparkles,
  CheckCircle2, XCircle, ChevronRight,
} from 'lucide-react';

interface LandingProps {
  onLoginClick: () => void;
}

export default function Landing({ onLoginClick }: LandingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // SEUS LINKS AUTOMÁTICOS DO MERCADO PAGO
  const links = {
    lite: {
      monthly: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=7ccc437ef0de4371a86214de9666ff33",
      yearly: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=d5a990d75b864cbdba6aa40291d87beb"
    },
    pro: {
      monthly: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=3b1349aedb414c32bea4e793b8055de0",
      yearly: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=12c250c9a5ae453fbd1a5ce0c4cc55bb"
    }
  };

  const content = {
    lite: {
      price: billingCycle === 'monthly' ? '49,90' : '497,00',
      ads: billingCycle === 'monthly' ? '15 anúncios/mês' : '180 anúncios/ano'
    },
    pro: {
      price: billingCycle === 'monthly' ? '97,00' : '967,00',
      ads: billingCycle === 'monthly' ? '60 anúncios/mês' : '720 anúncios/ano'
    }
  };

  const scrollToPlans = () => {
    document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans text-slate-50 selection:bg-orange-500 selection:text-white overflow-x-hidden">

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Anúncio<span className="text-orange-500">Pro</span>
            </span>
          </div>
          <button
            onClick={onLoginClick}
            className="text-sm font-bold text-slate-300 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 px-6 py-2.5 rounded-full"
          >
            Acessar Sistema
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-orange-400 font-bold text-sm mb-8">
            <Sparkles className="w-4 h-4" /> A revolução dos Marketplaces chegou
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            Venda muito mais na <span className="text-orange-500">Shopee</span> e <span className="text-yellow-500">Mercado Livre</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Nossa Inteligência Artificial cria o SEO perfeito e transforma fotos amadoras em imagens de estúdio em apenas 20 segundos.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            onClick={scrollToPlans}
            className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-orange-500/30 transition-all hover:scale-105 flex items-center gap-3 mx-auto"
          >
            COMECE A VENDER MAIS <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      </section>

      {/* COMPARAÇÃO */}
      <section className="py-24 px-4 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Por que usar o AnúncioPro?</h2>
            <p className="text-slate-400 text-lg">Pare de perder dinheiro e tempo fazendo tudo na mão.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 p-8 md:p-12 rounded-[32px] border border-slate-700/50">
              <h3 className="text-xl font-black text-slate-300 mb-8 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-500" /> Sem o AnúncioPro
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start"><span className="text-red-400 font-bold mt-1">✗</span> <span className="text-slate-400">Horas pesquisando palavras-chave para tentar rankear.</span></li>
                <li className="flex gap-4 items-start"><span className="text-red-400 font-bold mt-1">✗</span> <span className="text-slate-400">Fotos amadoras que não chamam a atenção do cliente.</span></li>
                <li className="flex gap-4 items-start"><span className="text-red-400 font-bold mt-1">✗</span> <span className="text-slate-400">Pagar caro para freelancers criarem imagens.</span></li>
                <li className="flex gap-4 items-start"><span className="text-red-400 font-bold mt-1">✗</span> <span className="text-slate-400">Descrições copiadas da internet que não geram desejo.</span></li>
              </ul>
            </div>

            <div className="bg-gradient-to-b from-orange-500/10 to-transparent p-8 md:p-12 rounded-[32px] border border-orange-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-bl-2xl">A SOLUÇÃO</div>
              <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-orange-500" /> Com o AnúncioPro
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start"><CheckCircle2 className="w-6 h-6 text-orange-500 shrink-0" /> <span className="text-slate-200 font-medium">SEO otimizado pelo algoritmo das plataformas.</span></li>
                <li className="flex gap-4 items-start"><CheckCircle2 className="w-6 h-6 text-orange-500 shrink-0" /> <span className="text-slate-200 font-medium">Fotos com fundo profissional geradas em um clique.</span></li>
                <li className="flex gap-4 items-start"><CheckCircle2 className="w-6 h-6 text-orange-500 shrink-0" /> <span className="text-slate-200 font-medium">Economia de R$ 1.000+ por mês com designers.</span></li>
                <li className="flex gap-4 items-start"><CheckCircle2 className="w-6 h-6 text-orange-500 shrink-0" /> <span className="text-slate-200 font-medium">Copys magnéticas que usam gatilhos mentais.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL (CARROSSEL 8 ITENS — SEM IMAGENS, ESTILO IGUAL AO ATUAL) */}
      <section className="py-24 px-4 bg-[#0F172A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Resultados reais de quem já está vendendo</h2>
            <p className="text-slate-400 text-lg">Exemplos e provas de usuários do AnúncioPro (sem datas).</p>
          </div>

          <SocialProofCarousel />
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-24 px-4 bg-slate-900/80 border-t border-slate-800 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Escolha seu Plano</h2>
            <p className="text-slate-400 text-lg">Cancele quando quiser pelo painel do Mercado Pago.</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-14">
            <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>Mensal</span>
            <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')} className="w-14 h-7 bg-slate-700 rounded-full relative p-1 transition-colors">
              <div className={`w-5 h-5 bg-orange-500 rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}`}>Anual</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase italic border border-emerald-500/20">2 Meses Grátis</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Lite */}
            <div className="bg-[#1E293B] p-10 rounded-[32px] border border-slate-700 flex flex-col hover:border-slate-500 transition-colors">
              <span className="text-orange-500 font-bold tracking-wider text-sm mb-4 uppercase">Vendedor Lite</span>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black text-white">R$ {content.lite.price}</span>
                <span className="text-slate-400 font-medium">/{billingCycle === 'monthly' ? 'mês' : 'ano'}</span>
              </div>
              <ul className="space-y-5 mb-10 flex-1">
                <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {content.lite.ads}</li>
                <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> SEO Shopee e Mercado Livre</li>
                <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Imagens com Inteligência Artificial</li>
              </ul>
              <a href={links.lite[billingCycle]} target="_blank" rel="noopener noreferrer" className="w-full block text-center py-4 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-all">
                Assinar Vendedor Lite
              </a>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-b from-orange-600 to-orange-500 p-10 rounded-[32px] shadow-2xl shadow-orange-500/20 flex flex-col relative transform md:-translate-y-4 hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="absolute -top-4 inset-x-0 flex justify-center">
                <span className="bg-slate-900 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-slate-700">
                  Mais Escolhido
                </span>
              </div>
              <span className="text-orange-100 font-bold tracking-wider text-sm mb-4 uppercase">Plano Pro (Agência)</span>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black text-white">R$ {content.pro.price}</span>
                <span className="text-orange-200 font-medium">/{billingCycle === 'monthly' ? 'mês' : 'ano'}</span>
              </div>
              <ul className="space-y-5 mb-10 flex-1">
                <li className="flex items-center gap-3 text-white font-bold"><CheckCircle2 className="w-5 h-5 text-white shrink-0" /> {content.pro.ads}</li>
                <li className="flex items-center gap-3 text-orange-50 font-medium"><CheckCircle2 className="w-5 h-5 text-orange-200 shrink-0" /> SEO Premium Shopee e ML</li>
                <li className="flex items-center gap-3 text-orange-50 font-medium"><CheckCircle2 className="w-5 h-5 text-orange-200 shrink-0" /> Alta resolução de Imagens</li>
                <li className="flex items-center gap-3 text-orange-50 font-medium"><CheckCircle2 className="w-5 h-5 text-orange-200 shrink-0" /> Suporte Prioritário</li>
              </ul>
              <a href={links.pro[billingCycle]} target="_blank" rel="noopener noreferrer" className="w-full block text-center py-4 rounded-xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all shadow-xl">
                Assinar Plano Pro
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>© 2026 AnúncioPro. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

/**
 * Carrossel automático (8 itens), deslizando da direita -> esquerda.
 * Sem imagens e com visual igual ao card atual.
 */
function SocialProofCarousel() {
  const items = useMemo(() => {
    const values = ["42.565,80", "8.831,90", "153.887,62", "21.044,10", "65.210,33", "12.904,77", "98.430,12", "7.115,50"];
    const quotes = [
      "O AnúncioPro fez minhas vendas dispararem na Shopee. As imagens geradas chamam muita atenção e o SEO coloca meu produto na primeira página!",
      "Começando do zero com a automação do AnúncioPro. A primeira semana já trouxe resultados que eu não tive nos últimos 3 meses tentando fazer sozinho.",
      "Escala real sem precisar de equipe grande. A IA faz o trabalho de 5 pessoas e eu consigo subir anúncios muito mais rápido.",
      "Depois que comecei a usar, meus anúncios ficaram mais profissionais e aumentou a conversão.",
      "Melhorou o CTR e minhas visitas subiram. O título e a descrição ficaram muito mais fortes.",
      "Ganho de tempo absurdo: anúncio pronto em minutos, sem ficar quebrando cabeça.",
      "Comecei a aparecer melhor nas buscas. O SEO premium faz diferença de verdade.",
      "Subi mais anúncios na semana e com mais qualidade. Isso destravou meu crescimento.",
    ];

    return Array.from({ length: 8 }).map((_, i) => ({
      id: i + 1,
      title: "Resultados de usuários do AnúncioPro",
      value: values[i],
      quote: quotes[i],
    }));
  }, []);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3500);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((it) => (
            <div key={it.id} className="w-full shrink-0 px-2">
              <div className="bg-slate-800/30 p-8 rounded-3xl border border-slate-700 flex flex-col hover:border-orange-500/50 transition-all">
                <div className="bg-slate-900 rounded-2xl p-6 mb-8 border border-slate-800 relative overflow-hidden flex-1">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></div>

                  <p className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">
                    {it.title}
                  </p>

                  <div className="flex items-start gap-1">
                    <span className="text-emerald-400 font-bold mt-1">R$</span>
                    <span className="text-4xl font-black text-white tracking-tight">{it.value}</span>
                  </div>

                  {/* Ícone estilo “tendência” no canto (sem precisar importar) */}
                  <svg
                    className="w-16 h-16 text-emerald-500/10 absolute -bottom-4 -right-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M4 14l4-4 4 4 8-8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Selo + “chat” + depoimento (igual ao seu estilo atual) */}
                <div className="text-center mb-2">
                  <div className="flex items-center justify-center gap-2 mb-4 text-orange-500">
                    <span className="text-sm font-black uppercase tracking-wider">Resultados de clientes</span>
                  </div>

                  <div className="flex justify-center mb-4">
                    <div className="bg-emerald-500/20 p-3 rounded-full">
                      <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <p className="text-slate-300 italic text-sm leading-relaxed">
                    “{it.quote}”
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* bolinhas */}
      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-orange-500" : "w-2.5 bg-slate-600 hover:bg-slate-500"}`}
            aria-label={`Ir para item ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}