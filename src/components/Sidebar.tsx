import React, { useState } from 'react';
import { useApp, AVAILABLE_LANGUAGES } from '../context/AppContext';
import { Layout, Compass, BookOpen, Clock, ShieldAlert, User, BarChart3, ArrowRight, Video, Square, ChevronLeft, ChevronRight, Globe, Sun, Moon, Cpu, Music, X, Languages } from 'lucide-react';
 
interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}
 
export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen, collapsed = false, onToggleCollapse }) => {
  const {
    activeTab,
    setActiveTab,
    targetLanguage,
    setTargetLanguage,
    user,
    reviewsDueCount,
    theme,
    toggleTheme
  } = useApp();

  const [langPickerOpen, setLangPickerOpen] = useState(false);
 
  const handleNav = (tab: 'dashboard' | 'resources' | 'islands' | 'practice' | 'review' | 'stats' | 'settings' | 'admin' | 'media' | 'music' | 'vocabulary') => {
    setActiveTab(tab);
    setMobileOpen(false);
  };
 
  const isAdmin = user?.email === 'admin@hyperlingua.app' || user?.user_metadata?.role === 'admin';
  const activeLang = AVAILABLE_LANGUAGES.find(l => l.id === targetLanguage) || AVAILABLE_LANGUAGES[0];
 
  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''} ${collapsed ? 'collapsed' : ''}`}>
      <div>
        {/* Brand logo */}
        <div className="sidebar-logo" style={{ display: 'flex', flexDirection: collapsed ? 'column' : 'row', alignItems: 'center', gap: '10px', justifyContent: collapsed ? 'center' : 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: collapsed ? 'column' : 'row', alignItems: 'center', gap: '10px' }}>
            <Sun size={22} style={{ color: '#f59e0b', fill: 'rgba(245, 158, 11, 0.25)' }} />
            {!collapsed && (
              <span style={{ fontSize: '1.3rem', fontWeight: 850, letterSpacing: '-0.02em', color: '#f59e0b' }}>NoClima</span>
            )}
          </div>
          {onToggleCollapse && (
            <button 
              className="sidebar-toggle-btn"
              onClick={onToggleCollapse}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px',
                borderRadius: '50%', transition: 'all 0.2s', width: '24px', height: '24px'
              }}
              title={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
          <button 
            className="sidebar-mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'none', alignItems: 'center', justifyContent: 'center', padding: '4px',
              borderRadius: '50%', transition: 'all 0.2s', width: '24px', height: '24px'
            }}
            title="Fechar menu"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Language Selector ── */}
        <div className="sidebar-group">
          {!collapsed && <span className="sidebar-group-title">Estudando</span>}

          {collapsed ? (
            /* Collapsed: just flag icon */
            <button
              onClick={() => { setLangPickerOpen(p => !p); }}
              title={`Idioma: ${activeLang.name}`}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', justifyContent: 'center', padding: '6px 0',
                fontSize: '1.4rem'
              }}
            >
              {activeLang.flag_emoji}
            </button>
          ) : (
            /* Expanded: active language badge + toggle grid */
            <>
              <button
                onClick={() => setLangPickerOpen(p => !p)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.05) 100%)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{activeLang.flag_emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{activeLang.name}</span>
                </span>
                <Globe size={14} style={{ color: 'var(--accent)', opacity: 0.8 }} />
              </button>

              {langPickerOpen && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '6px',
                  marginTop: '8px',
                  padding: '8px',
                  background: 'rgba(0,0,0,0.25)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)'
                }}>
                  {AVAILABLE_LANGUAGES.map(lang => {
                    const isActive = lang.id === targetLanguage;
                    return (
                      <button
                        key={lang.id}
                        onClick={() => {
                          setTargetLanguage(lang.id);
                          setLangPickerOpen(false);
                        }}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          gap: '4px', padding: '10px 6px',
                          background: isActive
                            ? 'linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(124,58,237,0.18) 100%)'
                            : 'rgba(255,255,255,0.03)',
                          border: isActive ? '1px solid rgba(124,58,237,0.6)' : '1px solid transparent',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          transition: 'all 0.18s',
                          outline: 'none'
                        }}
                        title={lang.name}
                      >
                        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{lang.flag_emoji}</span>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: isActive ? 700 : 500,
                          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
                        }}>
                          {lang.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Principal Menu group */}
        <div className="sidebar-group">
          <span className="sidebar-group-title">Principal</span>
          <ul className="sidebar-menu">
            <li>
              <button
                className={`sidebar-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNav('dashboard')}
              >
                <Layout className="sidebar-icon" />
                <span>Início</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-menu-item ${activeTab === 'resources' ? 'active' : ''}`}
                onClick={() => handleNav('resources')}
              >
                <Cpu className="sidebar-icon" />
                <span>Recursos</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Aprender Menu group */}
        <div className="sidebar-group">
          <span className="sidebar-group-title">Aprender</span>
          <ul className="sidebar-menu">
            <li>
              <button
                className={`sidebar-menu-item ${activeTab === 'islands' || activeTab === 'practice' ? 'active' : ''}`}
                onClick={() => handleNav('islands')}
              >
                <BookOpen className="sidebar-icon" />
                <span>Ilhas</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-menu-item ${activeTab === 'media' ? 'active' : ''}`}
                onClick={() => handleNav('media')}
              >
                <Video className="sidebar-icon" />
                <span>Shadowing</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-menu-item ${activeTab === 'music' ? 'active' : ''}`}
                onClick={() => handleNav('music')}
              >
                <Music className="sidebar-icon" />
                <span>Músicas</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-menu-item ${activeTab === 'vocabulary' ? 'active' : ''}`}
                onClick={() => handleNav('vocabulary')}
              >
                <Languages className="sidebar-icon" />
                <span>Vocabulário</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-menu-item ${activeTab === 'review' ? 'active' : ''}`}
                onClick={() => handleNav('review')}
                style={{ justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock className="sidebar-icon" />
                  <span>Revisar</span>
                </div>
                {reviewsDueCount > 0 && (
                  <span style={{
                    background: 'var(--danger)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    lineHeight: 1
                  }}>
                    {reviewsDueCount}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>

        {/* Você Menu group */}
        <div className="sidebar-group">
          <span className="sidebar-group-title">Você</span>
          <ul className="sidebar-menu">
            <li>
              <button
                className={`sidebar-menu-item ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => handleNav('stats')}
              >
                <BarChart3 className="sidebar-icon" />
                <span>Estatísticas</span>
              </button>
            </li>
            <li>
              <button
                className={`sidebar-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => handleNav('settings')}
              >
                <User className="sidebar-icon" />
                <span>Perfil</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Admin section */}
        {isAdmin && (
          <div className="sidebar-group">
            <span className="sidebar-group-title">Administrar</span>
            <ul className="sidebar-menu">
              <li>
                <button
                  className={`sidebar-menu-item ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => handleNav('admin')}
                >
                  <ShieldAlert className="sidebar-icon" />
                  <span>Painel Admin</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Theme Toggle Button at Sidebar bottom */}
      {!collapsed && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => toggleTheme()}
            className="settings-btn"
            style={{
              width: '100%',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
        </div>
      )}
      {collapsed && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => toggleTheme()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      )}
    </aside>
  );
};
