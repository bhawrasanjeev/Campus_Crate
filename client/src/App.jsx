import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { LostItemsPage } from './pages/LostItemsPage';
import { FoundItemsPage } from './pages/FoundItemsPage';
import { ReportItemPage } from './pages/ReportItemPage';
import { MessagesPage } from './pages/MessagesPage';
import { MyPostsPage } from './pages/MyPostsPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';

// Protected Route Guard for Admin Portal
const ProtectedAdminRoute = ({ children }) => {
  const { currentUser } = useApp();

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div
          style={{
            maxWidth: '520px',
            margin: '0 auto',
            padding: '40px 30px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '24px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <ShieldAlert size={64} color="#ef4444" style={{ margin: '0 auto' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginTop: '20px', color: 'var(--color-text-main)' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '10px', lineHeight: 1.6 }}>
            The Admin Safety & Verification Portal is strictly reserved for campus administration officers and moderators.
          </p>
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link
              to="/lost"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Back to Campus Feed
            </Link>
            {!currentUser && (
              <Link
                to="/login"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-surface-dim)',
                  color: 'var(--color-text-main)',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// Protected Route Guard for Logged-In Users
const ProtectedUserRoute = ({ children }) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const MainContent = () => {
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/lost" replace />} />
          <Route
            path="/lost"
            element={<LostItemsPage onOpenDetails={(item) => setSelectedItemForDetails(item)} />}
          />
          <Route
            path="/found"
            element={<FoundItemsPage onOpenDetails={(item) => setSelectedItemForDetails(item)} />}
          />
          <Route
            path="/report"
            element={
              <ProtectedUserRoute>
                <ReportItemPage onOpenDetails={(item) => setSelectedItemForDetails(item)} />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedUserRoute>
                <MessagesPage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/my-posts"
            element={
              <ProtectedUserRoute>
                <MyPostsPage onOpenDetails={(item) => setSelectedItemForDetails(item)} />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminPage />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/lost" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Item Details Modal */}
      {selectedItemForDetails && (
        <ItemDetailsModal
          item={selectedItemForDetails}
          onClose={() => setSelectedItemForDetails(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainContent />
      </BrowserRouter>
    </AppProvider>
  );
}
