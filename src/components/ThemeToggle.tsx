import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useBrandTherapy } from '../context/BrandTherapyContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useBrandTherapy();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      title={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 500,
        transition: 'all var(--transition-normal)'
      }}
    >
      {isDark ? (
        <>
          <Sun size={16} style={{ color: '#f59e0b' }} />
          <span>Modo Claro</span>
        </>
      ) : (
        <>
          <Moon size={16} style={{ color: '#a855f7' }} />
          <span>Modo Escuro</span>
        </>
      )}
    </button>
  );
};
