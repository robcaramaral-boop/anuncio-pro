import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("CLIQUEI EM ENTRAR");

    // 1. Validação para evitar envio vazio
    if (!email || !password) {
      setMsg("⚠️ Por favor, preencha email e senha.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setMsg(error.message);
    else setMsg("Logado com sucesso ✅");
  }

  async function signUp() {
    console.log("CLIQUEI EM CRIAR CONTA");

    // 1. Validação para evitar envio vazio
    if (!email || !password) {
      setMsg("⚠️ Por favor, preencha email e senha.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) setMsg(error.message);
    else setMsg("Conta criada! Verifique seu email ✅");
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 20 }}>
      <h2>Login</h2>

      <form onSubmit={signIn} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          // 2. Estilo básico para o campo ficar visível
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
        />

        <input
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          // 2. Estilo básico para o campo ficar visível
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
        />

        <button type="submit" style={{ padding: "8px", cursor: "pointer" }}>
          Entrar
        </button>

        <button type="button" onClick={signUp} style={{ padding: "8px", cursor: "pointer" }}>
          Criar conta
        </button>
      </form>

      {msg && <p style={{ marginTop: 10, color: msg.includes("⚠️") ? "orange" : "inherit" }}>{msg}</p>}
    </div>
  );
}