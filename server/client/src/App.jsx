import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

const MainContent = () => {
  const {
    currentUser,
    startChatWithUser,
    selectedItemForDetails,
    setSelectedItemForDetails,
  } = useApp();
  const navigate = useNavigate();

  const handleOpenClaim = (item) => {
    startChatWithUser(
      item.reportedBy || item.reporterName || 'Item Owner',
      item.title,
      item.reporterAvatar,
      item.type,
      item.location
    );
    navigate('/messages');
  };

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
            element={
              <LostItemsPage
                onOpenClaim={handleOpenClaim}
                onOpenDetails={(item) => setSelectedItemForDetails(item)}
              />
            }
          />

          <Route
            path="/found"
            element={
              <FoundItemsPage
                onOpenClaim={handleOpenClaim}
                onOpenDetails={(item) => setSelectedItemForDetails(item)}
              />
            }
          />

          <Route
            path="/report"
            element={
              <ReportItemPage
                onOpenDetails={(item) => setSelectedItemForDetails(item)}
              />
            }
          />

          <Route
            path="/messages"
            element={
              currentUser ? <MessagesPage /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/my-posts"
            element={
              currentUser ? (
                <MyPostsPage
                  onOpenDetails={(item) => setSelectedItemForDetails(item)}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/*"
            element={
              currentUser?.role === 'admin' ? (
                <AdminPage />
              ) : (
                <Navigate to="/lost" replace />
              )
            }
          />

          <Route path="/login" element={<LoginPage />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/lost" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Item Details Modal */}
      {selectedItemForDetails && (
        <ItemDetailsModal
          item={selectedItemForDetails}
          onClose={() => setSelectedItemForDetails(null)}
          onOpenClaim={handleOpenClaim}
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
