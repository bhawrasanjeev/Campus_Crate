import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Search, Home, MapPin, MessageSquare, Archive, ShieldCheck, LogIn, Menu, X, User, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, setGlobalSearchQuery, globalSearchQuery, logout, theme, toggleTheme, hasUnreadMessages } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/lost', label: 'Lost', icon: Home },
    { path: '/found', label: 'Found', icon: MapPin },
    { path: '/report', label: 'Report', icon: ShieldCheck },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/my-posts', label: 'My Posts', icon: Archive },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin Portal', icon: ShieldCheck, adminOnly: true });
  }

  return (
    <header className="navbar-sticky-header">
      <div className="navbar-content-container">
        {/* Left Section: Brand Logo & Navigation Links */}
        <div className="navbar-left-group">
          <Link to="/lost" className="navbar-logo">
            <img
              src="/logo.svg"
              alt="CampusCrate Logo"
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
            <span>CampusCrate</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isMessagesNav = item.path === '/messages';
              const showDot = isMessagesNav && hasUnreadMessages;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 13px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    backgroundColor: isActive ? 'var(--color-primary-bg)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  })}
                >
                  <Icon size={15} />
                  {item.label}
                  {showDot && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        boxShadow: '0 0 8px #10b981',
                        display: 'inline-block',
                        marginLeft: '3px',
                      }}
                      title="New unread message"
                    />
                  )}
                  {item.adminOnly && (
                    <span
                      style={{
                        fontSize: '9px',
                        backgroundColor: 'var(--color-lost)',
                        color: '#fff',
                        padding: '1px 5px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        marginLeft: '3px',
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Search, Theme Toggle, User Status, Logout */}
        <div className="navbar-right-group">
          <div className="navbar-search-box">
            <Search size={15} style={{ color: 'var(--color-text-muted)', marginRight: '6px', flexShrink: 0 }} />
            <input
              type="search"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search items..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '13px',
                color: 'var(--color-text-main)',
              }}
            />
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-dim)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-main)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#f59e0b" />}
          </button>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div className="navbar-user-pill">
                <User size={14} color="var(--color-primary)" />
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.name || 'User'}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 5px',
                    borderRadius: '4px',
                    backgroundColor: currentUser.role === 'admin' ? '#ef4444' : 'var(--color-primary-bg)',
                    color: currentUser.role === 'admin' ? '#fff' : 'var(--color-primary)',
                    fontWeight: 700,
                  }}
                >
                  {currentUser.role === 'admin' ? 'ADMIN' : 'STUDENT'}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                style={{
                  padding: '7px 13px',
                  borderRadius: '9999px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <LogIn size={14} />
              Login
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle-btn"
            style={{
              display: 'none',
              padding: '7px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            width: '100%',
            padding: '12px 20px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            backgroundColor: 'var(--color-surface)',
          }}
          className="mobile-drawer"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isMessagesNav = item.path === '/messages';
            const showDot = isMessagesNav && hasUnreadMessages;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  backgroundColor: isActive ? 'var(--color-primary-bg)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} />
                  {item.label}
                </div>
                {showDot && (
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                    }}
                  />
                )}
              </NavLink>
            );
          })}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderTop: '1px solid var(--color-border)',
              marginTop: '8px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Theme Mode
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-surface-dim)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-main)',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#f59e0b" />}
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
