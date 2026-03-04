import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, Sparkles, CheckCircle2, XCircle, ChevronRight,
  Check, X, ChevronDown, Image as ImageIcon, Search,
  LayoutTemplate, ShieldCheck, Clock, TrendingUp, ShoppingBag, Copy, Watch
} from 'lucide-react';

interface LandingProps {
  onLoginClick: () => void;
}

export default function Landing({ onLoginClick }: LandingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // SEUS LINKS AUTOMÁTICOS DO MERCADO PAGO
  const links = {
    lite: {
      monthly: "https://pay.kiwify.com.br/DSQXy6V",
      yearly: "https://pay.kiwify.com.br/nXSrYRj"
    },
    pro: {
      monthly: "https://pay.kiwify.com.br/G06X7TB",
      yearly: "https://pay.kiwify.com.br/7Qyje9t"
    }
  };

  const content = {
    lite: {
      price: billingCycle === 'monthly' ? '49,90' : '497,00',
      ads: billingCycle === 'monthly' ? '20 anúncios/mês' : '240 anúncios/ano'
    },
    pro: {
      price: billingCycle === 'monthly' ? '97,00' : '967,00',
      ads: billingCycle === 'monthly' ? '50 anúncios/mês' : '600 anúncios/ano'
    }
  };

  const faqs = [
    {
      q: "Como a Inteligência Artificial funciona?",
      a: "Nossa IA analisa o nome do seu produto e busca as melhores palavras-chave da Shopee e do Mercado Livre. Em seguida, gera títulos, descrições persuasivas e recria imagens de alta conversão em fundo de estúdio, tudo em 20 segundos."
    },
    {
      q: "Preciso ter conhecimento em design ou SEO?",
      a: "Não! O AnúncioPro foi feito exatamente para quem não quer perder tempo aprendendo ferramentas complexas. Com 1 clique, você tem o anúncio de um especialista."
    },
    {
      q: "Em quais marketplaces posso usar os anúncios?",
      a: "Nossa tecnologia é otimizada especificamente para os algoritmos do Mercado Livre e da Shopee, garantindo máxima relevância e cliques nas buscas."
    },
    {
      q: "Como funcionam os créditos?",
      a: "Cada anúncio gerado (com 5 fotos + SEO completo) consome 1 crédito. Ao criar sua conta, você ganha 3 créditos grátis para testar. Depois, basta escolher o plano que melhor atende o seu volume de vendas."
    },
  ];

  const scrollToPlans = () => {
    document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToLoginForFreeTrial = () => {
    onLoginClick();
  };

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans text-slate-50 selection:bg-orange-500 selection:text-white overflow-x-hidden pb-20">

      {/* 1. HEADER */}
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

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-300">
              <a href="#como-funciona" className="hover:text-orange-500 transition-colors">Sistema</a>
              <a href="#beneficios" className="hover:text-orange-500 transition-colors">Benefícios</a>
              <button onClick={scrollToPlans} className="hover:text-orange-500 transition-colors cursor-pointer">Planos</button>
              <a href="#faq" className="hover:text-orange-500 transition-colors">Dúvidas</a>
            </nav>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onLoginClick}
                className="text-sm font-black text-white bg-orange-500 hover:bg-orange-600 transition-colors px-6 py-2.5 rounded-full shadow-lg shadow-orange-500/20"
              >
                TESTE GRÁTIS
              </button>

              <button
                onClick={onLoginClick}
                className="text-sm font-bold text-slate-300 hover:text-white transition-colors border border-slate-700 hover:border-slate-500 px-6 py-2.5 rounded-full"
              >
                Acessar Sistema
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-40 pb-20 px-4 relative bg-[#0F172A]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-orange-400 font-bold text-sm mb-8"
          >
            <Sparkles className="w-4 h-4" /> A revolução dos Marketplaces chegou
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight"
          >
            Venda muito mais na <span className="text-orange-500">Shopee</span> e{' '}
            <span className="text-yellow-500">Mercado Livre</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Comece hoje mesmo a multiplicar sua margem de lucro criando anúncios perfeitos, com SEO de ponta e imagens de estúdio em apenas 20 segundos.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={scrollToPlans}
            className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-orange-500/30 transition-all hover:scale-105 flex items-center gap-3 mx-auto"
          >
            COMECE A VENDER MAIS <ChevronRight className="w-6 h-6" />
          </motion.button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={goToLoginForFreeTrial}
              className="text-sm font-semibold text-slate-300 hover:text-white underline underline-offset-4 decoration-slate-600 hover:decoration-slate-300 transition-colors"
            >
              Teste grátis — 3 créditos liberados
            </button>
            <div className="mt-1 text-xs text-slate-500">
              Sem cartão • Sem compromisso
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMO FUNCIONA (COM MOCKUP 100% SEGURO VIA CÓDIGO) */}
      <section id="como-funciona" className="py-24 bg-[#0F172A] border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">Como funciona o nosso sistema</h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">Um novo modelo de negócio: você só digita o nome do produto e a nossa Inteligência Artificial faz todo o trabalho duro para você.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* A JANELA FAKE DO APLICATIVO PREENCHIDA E ESTÁVEL */}
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-4 bg-orange-500/10 rounded-[40px] blur-2xl"></div>
              
              <div className="bg-[#1E293B] rounded-[32px] p-6 relative border border-slate-700 shadow-2xl overflow-hidden flex flex-col gap-4 h-[550px]">
                
                {/* Botões do Topo (Estilo Mac) */}
                <div className="flex gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>

                {/* Bloco 1: Input de Produto */}
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nome do Produto *</div>
                      <div className="h-10 w-full bg-slate-50 border border-slate-200 rounded-xl flex items-center px-3">
                        <span className="text-sm font-bold text-slate-800 truncate">Smartwatch Ultra Pro 9</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-2">Marketplace</div>
                      <div className="flex gap-2">
                        <div className="h-10 flex-1 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-bold text-xs">
                          Shopee
                        </div>
                        <div className="h-10 flex-1 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 font-bold text-xs">
                          Mercado Livre
                        </div>
                      </div>
                    </div>
                    {/* Imagem Original (Feita com Código - Não quebra) */}
                    <div className="border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[120px]">
                      <Watch className="w-10 h-10 text-slate-400 mb-2 drop-shadow-sm" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Foto Original</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                    <div className="h-10 px-4 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-bold text-xs">
                      Limpar
                    </div>
                    <div className="h-10 px-4 bg-orange-500 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 text-white font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-white" />
                      Gerar Anúncio
                    </div>
                  </div>
                </div>

                {/* Bloco 2: Resultados Falsos (Feitos com Código) */}
                <div className="grid grid-cols-12 gap-4 relative flex-1 pb-10">
                  {/* Efeito de Gradiente para "cortar" embaixo e mostrar que rola */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1E293B] to-transparent z-10 pointer-events-none"></div>
                  
                  {/* Bloco de Imagens Geradas */}
                  <div className="col-span-5 bg-white rounded-2xl p-4 shadow-lg border border-slate-200 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                      <ImageIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-[10px] font-black text-slate-900 uppercase">Imagens Geradas</span>
                    </div>
                    
                    {/* FOTO 1 - Gerada com Gradiente Premium CSS */}
                    <div className="aspect-square bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl border border-slate-200 overflow-hidden mb-2 shadow-md flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <Watch className="w-16 h-16 text-white drop-shadow-2xl z-10" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                       {/* FOTO 2 */}
                       <div className="aspect-square bg-gradient-to-tr from-slate-900 to-slate-800 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
                         <Watch className="w-8 h-8 text-emerald-400 drop-shadow-md" />
                       </div>
                       {/* FOTO 3 */}
                       <div className="aspect-square bg-gradient-to-bl from-orange-400 to-red-500 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
                         <Watch className="w-8 h-8 text-white drop-shadow-md" />
                       </div>
                    </div>
                  </div>

                  {/* Bloco de SEO Gerado */}
                  <div className="col-span-7 bg-white rounded-2xl p-4 shadow-lg border border-slate-200 flex flex-col">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] font-black text-slate-900 uppercase">SEO Shopee</span>
                      </div>
                      <div className="bg-slate-50 px-2 py-1 rounded-md text-[9px] font-bold text-slate-500 border border-slate-200 flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Copiar
                      </div>
                    </div>
                    <div className="space-y-3 overflow-hidden">
                      <div>
                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest block mb-1">Título Otimizado</span>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] font-bold text-slate-800 leading-snug">
                          Smartwatch Ultra Pro 9 Monitor Cardíaco Relógio Esportivo Inteligente
                        </div>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest block mb-1">Descrição Persuasiva</span>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[10px] text-slate-600 leading-relaxed h-24 overflow-hidden relative">
                          Descubra a revolução no seu pulso. O Smartwatch Ultra Pro 9 acompanha seus treinos com precisão, monitora sua saúde 24 horas por dia e recebe todas as notificações do seu celular. Design premium em alumínio e bateria de longa duração.
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* TEXTOS AO LADO */}
            <div className="order-1 lg:order-2 space-y-8">
              <div className="flex gap-6 items-start">
                <div className="bg-orange-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg shadow-orange-500/20">1</div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">Digite o nome e envie a foto</h3>
                  <p className="text-slate-400 font-medium">Informe o nome do produto e faça o upload de uma foto simples. Não precisa de fundo branco nem iluminação profissional.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="bg-orange-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg shadow-orange-500/20">2</div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">A Mágica Acontece</h3>
                  <p className="text-slate-400 font-medium">Nossa IA cria 5 imagens com cenário de estúdio, um título matador para o Marketplace e uma descrição altamente persuasiva.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="bg-orange-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl shadow-lg shadow-orange-500/20">3</div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">Comece a Vender</h3>
                  <p className="text-slate-400 font-medium">Copie, cole no seu Marketplace e veja os cliques e as vendas dispararem nas primeiras 24 horas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPARAÇÃO */}
      <section className="py-24 px-4 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Por que usar o AnúncioPro?</h2>
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

      {/* 5. O QUE VOU RECEBER */}
      <section id="beneficios" className="py-24 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">O que eu vou receber</h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">Dá uma olhada em todas as ferramentas que você terá acesso fazendo parte do AnúncioPro hoje.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <ImageIcon className="w-8 h-8"/>, title: "5 Imagens Profissionais", desc: "Você terá acesso a imagens em alta resolução geradas do zero pela Inteligência Artificial." },
              { icon: <LayoutTemplate className="w-8 h-8"/>, title: "Plataforma Automática", desc: "Uma plataforma que facilita o processo de criação de qualquer produto, de qualquer nicho." },
              { icon: <Search className="w-8 h-8"/>, title: "SEO Mercado Livre", desc: "Pesquisa avançada das palavras que as pessoas mais digitam para comprar seu produto." },
              { icon: <TrendingUp className="w-8 h-8"/>, title: "Textos Persuasivos", desc: "Descrições com gatilhos mentais que transformam visitantes indecisos em compradores." },
              { icon: <Clock className="w-8 h-8"/>, title: "Pronto na Hora", desc: "As suas imagens e textos serão entregues para você usar no mesmo minuto." },
              { icon: <ShieldCheck className="w-8 h-8"/>, title: "Sem Comissões", desc: "Você só paga uma assinatura fixa. Não pegamos comissão das suas vendas." },
            ].map((item, i) => (
              <div key={i} className="bg-[#1E293B] rounded-3xl p-8 border border-slate-700 hover:border-orange-500/50 transition-colors group shadow-lg">
                <div className="bg-orange-500/20 text-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ONDE POSSO VENDER */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-8">Venda nos maiores marketplaces do Brasil</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <div className="bg-[#FFE600] text-[#2D3277] w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-2xl flex items-center justify-center gap-3 shadow-2xl">
              MERCADO LIVRE
            </div>
            <div className="bg-[#EE4D2D] text-white w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-2xl flex items-center justify-center gap-3 shadow-2xl">
              SHOPEE
            </div>
          </div>
        </div>
      </section>

      {/* 7. PROVA SOCIAL (CARROSSEL) */}
      <section className="py-24 px-4 bg-[#0F172A] border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Resultados reais de quem já está vendendo</h2>
            <p className="text-slate-400 text-lg">Exemplos e provas de usuários do AnúncioPro.</p>
          </div>

          <SocialProofCarousel />
        </div>
      </section>

      {/* 8. PLANOS */}
      <section id="planos" className="py-24 px-4 bg-slate-900/80 border-t border-slate-800 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Escolha seu Plano</h2>
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

      {/* 9. FAQ */}
      <section id="faq" className="py-24 bg-[#0F172A] border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Dúvidas Frequentes</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#1E293B] border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left font-bold text-white flex justify-between items-center focus:outline-none hover:bg-slate-800 transition-colors"
                >
                  {faq.q}
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-5 text-slate-400 font-medium"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-10 border-t border-slate-800 bg-[#0F172A] text-center text-slate-500 text-sm">
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