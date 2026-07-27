import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, Plus, Package, Sun, Moon } from 'lucide-react';
import './Navbar.css';

export const Navbar = () => {
  const {
    currentPage,
    setCurrentPage,
    currentUser,
    unreadMessagesCount,
    setReportInitialType,
    globalSearchQuery,
    setGlobalSearchQuery,
    darkMode,
    toggleDarkMode,
  } = useApp();

  const handleReportClick = () => {
    setReportInitialType('lost');
    setCurrentPage('report');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <button
            className="brand-logo"
            onClick={() => setCurrentPage('lost')}
            title="CampusCrate Home"
          >
            <div className="logo-icon">
              <Package size={20} />
            </div>
            <span className="brand-name">CampusCrate</span>
          </button>

          <div className="nav-search">
            <Search className="nav-search-icon" />
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search items..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="nav-tabs">
          <button
            className={`nav-tab ${currentPage === 'lost' ? 'active' : ''}`}
            onClick={() => setCurrentPage('lost')}
          >
            Lost
          </button>
          <button
            className={`nav-tab ${currentPage === 'found' ? 'active' : ''}`}
            onClick={() => setCurrentPage('found')}
          >
            Found
          </button>
          <button
            className={`nav-tab ${currentPage === 'my-posts' ? 'active' : ''}`}
            onClick={() => setCurrentPage('my-posts')}
          >
            My Posts
          </button>
          <button
            className={`nav-tab ${currentPage === 'messages' ? 'active' : ''}`}
            onClick={() => setCurrentPage('messages')}
          >
            Messages
            {unreadMessagesCount > 0 && (
              <span className="badge">{unreadMessagesCount}</span>
            )}
          </button>
          <button
            className={`nav-tab ${currentPage === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentPage('admin')}
          >
            Admin
          </button>
        </div>

        <div className="navbar-right">
          <button
            className="icon-button theme-toggle-btn"
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={20} className="theme-icon sun" /> : <Moon size={20} className="theme-icon moon" />}
          </button>

          <button className="icon-button" title="Notifications">
            <Bell size={20} />
            <span className="notification-dot" />
          </button>

          <button className="btn-report" onClick={handleReportClick}>
            <Plus size={18} />
            <span>+ Report Item</span>
          </button>

          {currentUser ? (
            <button
              className="user-avatar-btn"
              onClick={() => setCurrentPage('login')}
              title={`Signed in as ${currentUser.name} (${currentUser.role})`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="user-avatar-img"
              />
            </button>
          ) : (
            <button
              className="login-link-btn"
              onClick={() => setCurrentPage('login')}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
