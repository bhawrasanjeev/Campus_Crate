import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ITEMS, INITIAL_CLAIMS, INITIAL_CONVERSATIONS, CURRENT_USER } from '../data/mockData';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('lost');
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [claims, setClaims] = useState(INITIAL_CLAIMS);
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedItemForClaim, setSelectedItemForClaim] = useState(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);
  const [reportInitialType, setReportInitialType] = useState('lost');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [activeConversationId, setActiveConversationId] = useState('conv_1');

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const addItem = (newItemData) => {
    const newItem = {
      ...newItemData,
      id: `item_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const addClaim = (newClaimData) => {
    const newClaim = {
      ...newClaimData,
      id: `clm_${Date.now()}`,
      status: 'Under Review',
      submittedOn: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setClaims((prev) => [newClaim, ...prev]);
  };

  const updateClaimStatus = (claimId, status) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status } : c))
    );
  };

  const sendMessage = (conversationId, text) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const newMsg = {
            id: `m_${Date.now()}`,
            senderId: currentUser?.id || 'me',
            senderName: currentUser?.name || 'Me',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
          };
          return {
            ...conv,
            lastMessage: text,
            lastMessageTime: 'Just now',
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      })
    );
  };

  const unreadMessagesCount = conversations.reduce(
    (acc, curr) => acc + (curr.unreadCount || 0),
    0
  );

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        currentUser,
        setCurrentUser,
        items,
        addItem,
        claims,
        addClaim,
        updateClaimStatus,
        conversations,
        sendMessage,
        selectedItemForClaim,
        setSelectedItemForClaim,
        selectedItemForDetails,
        setSelectedItemForDetails,
        reportInitialType,
        setReportInitialType,
        globalSearchQuery,
        setGlobalSearchQuery,
        activeConversationId,
        setActiveConversationId,
        unreadMessagesCount,
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
