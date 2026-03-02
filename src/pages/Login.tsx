import React, { useState } from 'react';
import { supabase } from "../lib/supabaseClient";
import { Package, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isRegistering) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Verifique seu e-mail para confirmar o cadastro!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("E-mail ou senha incorretos.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4">
      {/* Logo acima do Card */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
          <Package className="w-8 h-8 text-white" />
        </div>
        <span className="text-3xl font-black text-white tracking-tight">
          Anúncio<span className="text-orange-500">Pro</span>
        </span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-[440px] rounded-[32px] shadow-2xl p-10 sm:p-12"
      >
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta 👋'}
          </h1>
          <p className="text-slate-500 font-medium">
            {isRegistering ? 'Comece a vender mais hoje mesmo.' : 'Acesse seu painel de controle.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                required 
                placeholder="seu@email.com" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              isRegistering ? 'Criar minha conta gratuita' : 'Acessar Sistema'
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)} 
            className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
          >
            {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem conta? Comece o teste grátis'}
          </button>
        </div>
      </motion.div>
      
      <p className="mt-8 text-slate-500 text-xs font-medium">
        © 2026 AnúncioPro - Tecnologia para Marketplaces
      </p>
    </div>
  );
}