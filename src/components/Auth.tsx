import React, { useState, useEffect } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  checkSupabaseHealth,
  getSupabaseUrl,
  getSupabaseAnonKey,
  reinitSupabase,
  SupabaseHealthResult
} from '../services/supabase';
import {
  Mail,
  Lock,
  User,
  LogIn,
  ArrowRight,
  UserPlus,
  Key,
  Check,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Server
} from 'lucide-react';

interface AuthProps {
  onSuccess: () => void;
  onSkip: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, onSkip }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Health check state
  const [health, setHealth] = useState<SupabaseHealthResult | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Custom Supabase Config fields
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseUrl());
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseAnonKey());
  const [showConfig, setShowConfig] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Verify health on mount
  useEffect(() => {
    const runCheck = async () => {
      setCheckingHealth(true);
      const res = await checkSupabaseHealth();
      setHealth(res);
      setCheckingHealth(false);
      if (!res.ok) {
        setShowConfig(true);
      }
    };
    runCheck();
  }, []);

  const handleTestConnection = async () => {
    setCheckingHealth(true);
    setTestResult(null);
    const res = await checkSupabaseHealth(supabaseUrlInput, supabaseKeyInput);
    setHealth(res);
    setCheckingHealth(false);
    if (res.ok) {
      setTestResult('✓ Conexão bem-sucedida! O banco de dados está ativo.');
    } else {
      setTestResult(`❌ Falha: ${res.message}`);
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      setError('Por favor, insira a URL e a Chave Anon do seu projeto Supabase.');
      return;
    }
    reinitSupabase(supabaseUrlInput, supabaseKeyInput);
    alert('✓ Novas credenciais salvas com sucesso! Recarregando para conectar...');
    window.location.reload();
  };

  const handleGoogleLogin = async () => {
    if (health && !health.ok) {
      setError(`O servidor Supabase está inacessível (${health.message}). Reative seu projeto no Supabase ou use 'Continuar como Visitante'.`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error: googleErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (googleErr) throw googleErr;
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao tentar entrar com o Google.');
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    if (health && !health.ok) {
      setError(`O servidor Supabase está inacessível (${health.message}). Reative seu projeto no Supabase ou use 'Continuar como Visitante'.`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error: githubErr } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (githubErr) throw githubErr;
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao tentar entrar com o GitHub.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (health && !health.ok) {
      setError(
        `Servidor Supabase indisponível no momento: ${health.message}. Você pode usar 'Continuar como Visitante' para praticar offline normalmente sem perder seus dados.`
      );
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: displayName.trim()
            }
          }
        });
        if (signUpErr) throw signUpErr;

        alert('Cadastro realizado com sucesso! Verifique seu e-mail para confirmação se necessário.');
        setIsSignUp(false);
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (signInErr) throw signInErr;
        onSuccess();
      }
    } catch (err: any) {
      if (err.message?.includes('fetch') || err.message?.includes('network')) {
        setError(
          'Falha de rede ao contatar o Supabase. O projeto pode estar pausado. Clique em "Continuar como Visitante" para estudar offline com segurança.'
        );
      } else {
        setError(err.message || 'Ocorreu um erro no processo de autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px', minHeight: '100%', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>NoClima</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {isSignUp ? 'Crie sua conta para sincronizar seu progresso na nuvem.' : 'Entre para acessar seu perfil e sincronizar seus dados.'}
        </p>
      </div>

      {/* Supabase Health Banner if Paused or Offline */}
      {health && !health.ok && (
        <div
          className="glass-card"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
            <AlertTriangle size={18} />
            <strong style={{ fontSize: '0.9rem' }}>Banco de Dados em Pausa ou Inacessível</strong>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            O projeto Supabase <code>{health.projectRef}</code> foi pausado pela política de inatividade do plano gratuito. Para reativá-lo com 1 clique:
          </p>

          <a
            href={`https://supabase.com/dashboard/project/${health.projectRef}`}
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{
              background: '#ef4444',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px'
            }}
          >
            Reativar Projeto no Supabase <ExternalLink size={14} />
          </a>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px' }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={checkingHealth}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0
              }}
            >
              <RefreshCw size={12} className={checkingHealth ? 'spin' : ''} /> {checkingHealth ? 'Testando...' : 'Verificar se já reativou'}
            </button>

            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {showConfig ? 'Ocultar configurações' : 'Usar outro projeto Supabase'}
            </button>
          </div>
        </div>
      )}

      {/* Supabase Connection Config Panel */}
      {showConfig && (
        <form onSubmit={handleSaveSupabaseConfig} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid rgba(245, 158, 11, 0.35)', background: 'rgba(245, 158, 11, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
              <Server size={18} />
              <strong style={{ fontSize: '0.9rem' }}>Configurar Conexão do Supabase</strong>
            </div>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={checkingHealth}
              className="btn btn-secondary"
              style={{ fontSize: '0.72rem', padding: '4px 10px' }}
            >
              {checkingHealth ? 'Testando...' : 'Testar Conexão'}
            </button>
          </div>

          {testResult && (
            <div style={{
              fontSize: '0.75rem',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: testResult.startsWith('✓') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: testResult.startsWith('✓') ? '#22c55e' : '#ef4444'
            }}>
              {testResult}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>URL do Projeto</label>
            <input
              type="text"
              required
              className="input-text"
              style={{ width: '100%', fontSize: '0.8rem' }}
              placeholder="https://seu-projeto.supabase.co"
              value={supabaseUrlInput}
              onChange={(e) => setSupabaseUrlInput(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Chave Anon (Public API Key)</label>
            <input
              type="password"
              required
              className="input-text"
              style={{ width: '100%', fontSize: '0.8rem' }}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={supabaseKeyInput}
              onChange={(e) => setSupabaseKeyInput(e.target.value)}
            />
          </div>

          <button type="submit" className="btn" style={{ background: '#f59e0b', color: 'black', fontWeight: 800, fontSize: '0.85rem' }}>
            Salvar e Aplicar Novas Credenciais <Check size={16} />
          </button>
        </form>
      )}

      {/* Main Login / Register Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="glass-card">
        {error && (
          <div style={{
            background: 'var(--danger-glow)',
            color: 'var(--danger)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            lineHeight: 1.4
          }}>
            {error}
          </div>
        )}

        {isSignUp && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Nome de Exibição</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                required
                className="input-text"
                style={{ width: '100%', paddingLeft: '44px' }}
                placeholder="Ex: Maria"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>E-mail</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            <input
              type="email"
              required
              className="input-text"
              style={{ width: '100%', paddingLeft: '44px' }}
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Senha</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            <input
              type="password"
              required
              className="input-text"
              style={{ width: '100%', paddingLeft: '44px' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
          {loading ? 'Processando...' : isSignUp ? (
            <>Cadastrar <UserPlus size={16} /></>
          ) : (
            <>Entrar <LogIn size={16} /></>
          )}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', margin: '2px 0', gap: '8px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ou</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleGoogleLogin}
        className="btn btn-secondary"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontWeight: 600,
          padding: '12px'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px" style={{ flexShrink: 0 }}>
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.422-5.189l-6.269-5.139C29.217,35.053,26.743,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c.001-0.001,0.002-0.001,0.003-0.002l6.269,5.139C38.748,35.145,44,28.659,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        {isSignUp ? 'Cadastrar com Google' : 'Entrar com Google'}
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={handleGithubLogin}
        className="btn btn-secondary"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontWeight: 600,
          padding: '12px'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        {isSignUp ? 'Cadastrar com GitHub' : 'Entrar com GitHub'}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
        >
          {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Cadastre-se'}
        </button>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ou</span>

        <button
          onClick={onSkip}
          className="btn btn-secondary"
          style={{ width: '100%', gap: '8px', padding: '12px' }}
        >
          Continuar como Visitante (100% Offline) <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
