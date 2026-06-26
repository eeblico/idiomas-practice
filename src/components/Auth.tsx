import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Mail, Lock, User, LogIn, ArrowRight, UserPlus } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName
            }
          }
        });
        if (signUpErr) throw signUpErr;
        
        // Show success alert
        alert('Cadastro realizado com sucesso! Verifique seu e-mail para confirmação se necessário.');
        setIsSignUp(false);
      } else {
        // Sign In Flow
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInErr) throw signInErr;
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro no processo de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100%', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>HyperLingua</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isSignUp ? 'Crie sua conta para sincronizar seu progresso.' : 'Entre para retomar seu aprendizado.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="glass-card">
        {error && (
          <div style={{
            background: 'var(--danger-glow)',
            color: 'var(--danger)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            border: '1px solid rgba(239, 68, 68, 0.15)'
          }}>
            {error}
          </div>
        )}

        {isSignUp && (
          <div className="form-group">
            <label className="form-label">Nome de Exibição</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
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

        <div className="form-group">
          <label className="form-label">E-mail</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
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

        <div className="form-group">
          <label className="form-label">Senha</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
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

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
          {loading ? 'Processando...' : isSignUp ? (
            <>Cadastrar <UserPlus size={16} /></>
          ) : (
            <>Entrar <LogIn size={16} /></>
          )}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
        >
          {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Cadastre-se'}
        </button>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ou</span>

        <button
          onClick={onSkip}
          className="btn btn-secondary"
          style={{ width: '100%', gap: '8px' }}
        >
          Continuar como Visitante <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
