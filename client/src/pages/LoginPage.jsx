import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Mail, User, Building, AlertCircle, KeyRound, CheckCircle } from 'lucide-react';
import './LoginPage.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    setCurrentUser,
    login,
    register,
    sendOtp,
    verifyOtp,
    authLoading,
    authError,
    setAuthError,
  } = useApp();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpNotice, setOtpNotice] = useState('');

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science',
    role: 'student',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs[5].current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (setAuthError) setAuthError(null);
    setOtpNotice('');

    if (isRegisterMode) {
      const res = await register(formData);
      if (res.success && res.requiresOtp) {
        setOtpEmail(res.email);
        setShowOtpScreen(true);
        setOtpNotice(res.message || 'OTP verification code sent to your email.');
      } else if (res.isOffline) {
        setCurrentUser({
          id: `usr_${Date.now()}`,
          name: formData.name || 'Sanjeev Bhawra',
          email: formData.email,
          role: formData.role,
          department: formData.department,
          avatar: '/user-avatar.svg',
        });
        navigate('/lost');
      }
    } else {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        navigate(formData.role === 'admin' ? '/admin' : '/lost');
      } else if (res.isOffline) {
        setCurrentUser({
          id: 'usr_mock_1',
          name: formData.email.split('@')[0] || 'Sanjeev Bhawra',
          email: formData.email || 'student@college.edu',
          role: 'student',
          department: 'Computer Science',
          avatar: '/user-avatar.svg',
        });
        navigate('/lost');
      }
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      if (setAuthError) setAuthError('Please enter all 6 digits of the OTP code.');
      return;
    }

    const res = await verifyOtp(otpEmail, fullOtp);
    if (res.success) {
      navigate('/lost');
    }
  };

  const handleResendOtp = async () => {
    if (!otpEmail) return;
    const res = await sendOtp(otpEmail);
    if (res.success) {
      setOtpNotice('A new OTP code has been sent to your email.');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-split-card">
        {/* Left Blue Banner */}
        <div className="login-left-banner">
          <div className="banner-brand">
            <img
              src="/logo.svg"
              alt="CampusCrate Logo"
              style={{ width: '36px', height: '36px', objectFit: 'contain' }}
            />
            <span>CampusCrate</span>
          </div>

          <div>
            <h1 className="banner-heading">Reunite college items with owners</h1>
            <p className="banner-desc">
              Your college campus lost & found hub. Quickly report missing items or help another student
              recover theirs with secure Nodemailer OTP email verification and real-time chat.
            </p>
          </div>

          <div style={{ fontSize: '12px', opacity: 0.85 }}>
            🔒 Powered by Nodemailer Email Verification
          </div>
        </div>

        {/* Right Content */}
        <div className="login-right-content">
          {showOtpScreen ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <KeyRound size={24} color="var(--color-primary)" />
                <h2 className="login-card-title" style={{ margin: 0 }}>
                  Enter OTP Code
                </h2>
              </div>
              <p className="login-card-sub">
                We sent a 6-digit verification OTP code to <strong>{otpEmail}</strong>.
              </p>

              {otpNotice && (
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <CheckCircle size={16} />
                  <span>{otpNotice}</span>
                </div>
              )}

              {authError && (
                <div className="auth-error-banner">
                  <AlertCircle size={16} />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpSubmit}>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    margin: '24px 0',
                  }}
                >
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={inputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      style={{
                        width: '46px',
                        height: '52px',
                        fontSize: '22px',
                        fontWeight: 800,
                        textAlign: 'center',
                        borderRadius: '10px',
                        border: '2px solid var(--color-border)',
                        backgroundColor: 'var(--color-bg)',
                        color: 'var(--color-text-main)',
                        outline: 'none',
                      }}
                    />
                  ))}
                </div>

                <button type="submit" className="btn-auth-submit" disabled={authLoading}>
                  {authLoading ? 'Verifying OTP...' : 'Verify OTP & Enter CampusCrate'}
                </button>
              </form>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  fontSize: '13px',
                }}
              >
                <button
                  type="button"
                  onClick={handleResendOtp}
                  style={{
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  Resend OTP Code
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtpScreen(false)}
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  Back to Registration
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-tab-group">
                <button
                  className={`auth-tab-btn ${!isRegisterMode ? 'active' : ''}`}
                  onClick={() => setIsRegisterMode(false)}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab-btn ${isRegisterMode ? 'active' : ''}`}
                  onClick={() => setIsRegisterMode(true)}
                >
                  Create Account
                </button>
              </div>

              <h2 className="login-card-title">
                {isRegisterMode ? 'Join CampusCrate' : 'Welcome Back'}
              </h2>
              <p className="login-card-sub">
                {isRegisterMode
                  ? 'Register with your student details to receive email OTP'
                  : 'Sign in to access your claims & direct messages'}
              </p>

              {authError && (
                <div className="auth-error-banner">
                  <AlertCircle size={16} />
                  <span>{authError}</span>
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit}>
                {isRegisterMode && (
                  <div className="auth-input-group">
                    <User size={18} className="auth-input-icon" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <div className="auth-input-group">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-input-group">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password (min 6 chars)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>

                {isRegisterMode && (
                  <>
                    <div className="auth-input-group">
                      <Building size={18} className="auth-input-icon" />
                      <select name="department" value={formData.department} onChange={handleChange}>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Business Administration">Business Administration</option>
                        <option value="Arts & Humanities">Arts & Humanities</option>
                        <option value="Medical Sciences">Medical Sciences</option>
                      </select>
                    </div>

                    <div className="auth-input-group">
                      <ShieldCheck size={18} className="auth-input-icon" />
                      <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="student">Student Account</option>
                        <option value="admin">Campus Admin Officer</option>
                      </select>
                    </div>
                  </>
                )}

                <button type="submit" className="btn-auth-submit" disabled={authLoading}>
                  {authLoading
                    ? 'Processing...'
                    : isRegisterMode
                      ? 'Register & Get OTP'
                      : 'Sign In'}
                </button>
              </form>

              {!isRegisterMode && (
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        email: 'admin@college.edu',
                        password: 'adminpassword123',
                      });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    ⚡ Quick Admin Demo Fill (admin@college.edu)
                  </button>
                </div>
              )}

              <div className="verification-badge">
                <ShieldCheck size={16} />
                Nodemailer & Resend OTP Email Verification Enabled
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
