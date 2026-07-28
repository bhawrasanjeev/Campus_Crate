import React from 'react';
import { Search, Home, MapPin, MessageSquare, Archive, ShieldCheck, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';

export const Navbar = () => {
  const {
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

  // Filter navItems: only show Admin tab if user is an admin
  const visibleNavItems = navItems.filter((item) => {
    if (item.key === 'admin') {
      return currentUser?.role === 'admin';
    }
    return true;
  });

  return (
    <header className="navbar-header">
      <div className="navbar-brand-section">
        <Link to="/lost" className="navbar-logo-link">
          <Home size={24} />
          <span>CampusCrate</span>
        </Link>

        <div className="navbar-nav-links">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const path = item.key === 'admin' ? '/admin' : `/${item.key}`;
            
            return (
              <NavLink
                key={item.key}
                to={path}
                style={({ isActive }) => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 12px',
                  borderRadius: '9999px',
                  border: '1px solid transparent',
                  backgroundColor: isActive
                    ? 'var(--color-primary-bg)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--color-primary)'
                    : 'var(--color-text-secondary)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                })}
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="navbar-actions-section">
        <div className="navbar-search-wrapper">
          <Search size={18} className="search-icon" style={{ marginRight: '8px', color: 'var(--color-text-muted)' }} />
          <input
            type="search"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search college campus items..."
            className="navbar-search-input"
          />
        </div>

        <Link to="/login" className="navbar-login-btn">
          <LogIn size={16} />
          {currentUser ? 'Account' : 'Login'}
        </Link>
      </div>
    </header>
  );
};
