import React, { useState } from 'react';
import { supabase } from "../lib/supabaseClient";
import { Package, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    
    if (!email || !password) {
      setMsg("⚠️ Por favor, preencha email e senha.");
      return;
    }

    setLoading(true);
    
    if (isRegistering) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg(`❌ ${error.message}`);
      else setMsg("Conta criada! Verifique seu email ✅");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("❌ E-mail ou senha incorretos.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      
      {/* Logo do Sistema */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-8"
      >
        <div className="bg-orange-500 p-2 rounded-lg shadow-lg shadow-orange-200">
          <Package className="w-8 h-8 text-white" />
        </div>
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          Anúncio<span className="text-orange-500">Pro</span>
        </span>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-[400px] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-[800] text-slate-900 mb-2 tracking-tight">
            {isRegistering ? 'Crie sua conta' : 'Seja bem vindo 👋'}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {isRegistering ? 'Comece a criar anúncios profissionais hoje.' : 'Acesso ao painel de controle.'}
          </p>
        </div>

        {msg && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-start gap-3 ${msg.includes('❌') || msg.includes('⚠️') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{msg}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="text-sm font-bold text-slate-700 mb-1.5 block">Usuário ou E-mail</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 h-[52px] rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-300"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-bold text-slate-700">Senha</label>
              {!isRegistering && (
                <button type="button" className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors">
                  Esqueceu a senha?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 h-[52px] rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-300"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[54px] bg-orange-500 hover:bg-orange-600 text-white font-black text-base rounded-xl shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              isRegistering ? 'Criar minha conta' : 'Acessar Sistema'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <p className="text-sm text-slate-500 font-medium">
            {isRegistering ? 'Já possui uma conta?' : 'Não tem uma conta?'}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setMsg('');
              }}
              className="ml-1.5 font-black text-orange-600 hover:text-orange-700 transition-colors"
            >
              {isRegistering ? 'Fazer login' : 'Criar conta'}
            </button>
          </p>
        </div>
      </motion.div>
      
      <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
        AnúncioPro © 2026
      </p>
    </div>
  );
}