import React from 'react';
import { Search, Home, MapPin, MessageSquare, Archive, ShieldCheck, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = () => {
  const {
    currentPage,
    setCurrentPage,
    currentUser,
    setGlobalSearchQuery,
    globalSearchQuery,
  } = useApp();

  const navItems = [
    { key: 'lost', label: 'Lost', icon: Home },
    { key: 'found', label: 'Found', icon: MapPin },
    { key: 'report', label: 'Report', icon: ShieldCheck },
    { key: 'messages', label: 'Messages', icon: MessageSquare },
    { key: 'my-posts', label: 'My Posts', icon: Archive },
    { key: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <header
      style={{
        width: '100%',
        padding: '12px 22px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700,
            fontSize: '18px',
            color: 'var(--color-primary)',
          }}
        >
          <Home size={24} />
          <span>CampusCrate</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, auto)',
            gap: '8px',
            alignItems: 'center',
            overflowX: 'auto',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 12px',
                  borderRadius: '9999px',
                  border: '1px solid transparent',
                  backgroundColor:
                    currentPage === item.key
                      ? 'var(--color-primary-bg)'
                      : 'transparent',
                  color:
                    currentPage === item.key
                      ? 'var(--color-primary)'
                      : 'var(--color-text-secondary)',
                  fontWeight: 600,
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            width: '280px',
            backgroundColor: 'var(--color-bg)',
            borderRadius: '9999px',
            border: '1px solid var(--color-border)',
            padding: '8px 12px',
          }}
        >
          <Search size={18} className="search-icon" />
          <input
            type="search"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search college campus items..."
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '14px',
              color: 'var(--color-text-main)',
            }}
          />
        </div>

        <button
          onClick={() => setCurrentPage('login')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 700,
          }}
        >
          <LogIn size={16} />
          {currentUser ? 'Account' : 'Login'}
        </button>
      </div>
    </header>
  );
};
