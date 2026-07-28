import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ClaimModal } from './components/ClaimModal';
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
    currentPage,
    selectedItemForClaim,
    setSelectedItemForClaim,
    selectedItemForDetails,
    setSelectedItemForDetails,
  } = useApp();

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
        {currentPage === 'lost' && (
          <LostItemsPage
            onOpenClaim={(item) => setSelectedItemForClaim(item)}
            onOpenDetails={(item) => setSelectedItemForDetails(item)}
          />
        )}

        {currentPage === 'found' && (
          <FoundItemsPage
            onOpenClaim={(item) => setSelectedItemForClaim(item)}
            onOpenDetails={(item) => setSelectedItemForDetails(item)}
          />
        )}

        {currentPage === 'report' && (
          <ReportItemPage
            onOpenDetails={(item) => setSelectedItemForDetails(item)}
          />
        )}

        {currentPage === 'messages' && <MessagesPage />}

        {currentPage === 'my-posts' && (
          <MyPostsPage
            onOpenDetails={(item) => setSelectedItemForDetails(item)}
          />
        )}

        {currentPage === 'admin' && <AdminPage />}

        {currentPage === 'login' && <LoginPage />}
      </main>

      <Footer />

      {/* Claim Modal */}
      {selectedItemForClaim && (
        <ClaimModal
          item={selectedItemForClaim}
          onClose={() => setSelectedItemForClaim(null)}
        />
      )}

      {/* Item Details Modal */}
      {selectedItemForDetails && (
        <ItemDetailsModal
          item={selectedItemForDetails}
          onClose={() => setSelectedItemForDetails(null)}
          onOpenClaim={(item) => setSelectedItemForClaim(item)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
