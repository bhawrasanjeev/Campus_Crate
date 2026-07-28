import React from 'react';
import { useApp } from '../context/AppContext';
import { CURRENT_USER } from '../data/mockData';
import { Package, ShieldCheck } from 'lucide-react';
import './LoginPage.css';

export const LoginPage = () => {
  const { currentUser, setCurrentUser, setCurrentPage } = useApp();

  const handleSignInAsStudent = () => {
    setCurrentUser(CURRENT_USER);
    setCurrentPage('lost');
  };

  const handleSignInAsAdmin = () => {
    setCurrentUser({
      id: 'admin_1',
      name: 'Admin Security',
      email: 'security@college.edu',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });
    setCurrentPage('admin');
  };

  return (
    <div className="login-page-container">
      <div className="login-split-card">
        {/* Left Blue Banner */}
        <div className="login-left-banner">
          <div className="banner-brand">
            <Package size={28} color="white" />
            <span>CampusCrate</span>
          </div>

          <div>
            <h1 className="banner-heading">Reunite items with owners</h1>
            <p className="banner-desc">
              Your campus digital safety net. Quickly report lost items or help someone
              find theirs with ease, verification questions, and secure messaging.
            </p>
          </div>

          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Powered by College Digital Safety Services
          </div>
        </div>

        {/* Right Content */}
        <div className="login-right-content">
          <Package size={48} color="var(--color-primary)" />
          <h2 className="login-card-title">Welcome to CampusCrate</h2>
          <p className="login-card-sub">
            Sign in with your verified college email to continue
          </p>

          <button className="btn-google-login" onClick={handleSignInAsStudent}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with College SSO
          </button>

          <div className="verification-badge">
            <ShieldCheck size={16} />
            Only verified @college.edu emails allowed
          </div>

          <div className="demo-switcher-box">
            <span className="demo-label">Quick Demo Switcher</span>
            <div className="demo-btn-group">
              <button
                className={`demo-user-btn ${
                  currentUser?.role === 'student' ? 'active' : ''
                }`}
                onClick={handleSignInAsStudent}
              >
                Student View
              </button>
              <button
                className={`demo-user-btn ${
                  currentUser?.role === 'admin' ? 'active' : ''
                }`}
                onClick={handleSignInAsAdmin}
              >
                Admin Portal View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
