import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  CURRENT_USER,
  DEFAULT_CATEGORIES,
  DEFAULT_CLAIMS,
  DEFAULT_CONVERSATIONS,
  DEFAULT_ITEMS,
} from '../data/mockData';

const AppContext = createContext(null);
const API_BASE_URL = 'http://localhost:5050/api';

export const AppProvider = ({ children }) => {
  const [selectedItemForClaim, setSelectedItemForClaim] = useState(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);
  const [reportInitialType, setReportInitialType] = useState('lost');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('campuscrate_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campuscrate_token') || null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Items & Chat State
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [conversations, setConversations] = useState(DEFAULT_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [claims, setClaims] = useState(DEFAULT_CLAIMS);
  const [socket, setSocket] = useState(null);

  // Initialize Socket.io connection on user auth
  useEffect(() => {
    if (currentUser) {
      const newSocket = io('http://localhost:5050', {
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('⚡ Socket connected to server');
        newSocket.emit('setup', currentUser);
      });

      newSocket.on('message_received', (newMessage) => {
        const timestamp = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === newMessage.conversationId || conv._id === newMessage.conversationId) {
              return {
                ...conv,
                messages: [
                  ...(conv.messages || []),
                  {
                    id: newMessage._id || `msg_${Date.now()}`,
                    text: newMessage.text,
                    timestamp,
                    isMe: false,
                  },
                ],
                lastMessage: newMessage.text,
                lastMessageTime: timestamp,
              };
            }
            return conv;
          })
        );
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentUser]);

  // Auth Functions
  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      setCurrentUser(data);
      setToken(data.token);
      localStorage.setItem('campuscrate_user', JSON.stringify(data));
      localStorage.setItem('campuscrate_token', data.token);
      return { success: true };
    } catch (err) {
      const isOffline = err.name === 'TypeError' || err.message.includes('Failed to fetch');
      const errorMsg = isOffline ? 'Backend server unreachable' : err.message;
      setAuthError(errorMsg);
      return { success: false, isOffline, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (userData) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setCurrentUser(data);
      setToken(data.token);
      localStorage.setItem('campuscrate_user', JSON.stringify(data));
      localStorage.setItem('campuscrate_token', data.token);
      return { success: true };
    } catch (err) {
      const isOffline = err.name === 'TypeError' || err.message.includes('Failed to fetch');
      const errorMsg = isOffline ? 'Backend server unreachable' : err.message;
      setAuthError(errorMsg);
      return { success: false, isOffline, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithGoogle = async (googleUserData) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUserData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google OAuth failed');
      }

      setCurrentUser(data);
      setToken(data.token);
      localStorage.setItem('campuscrate_user', JSON.stringify(data));
      localStorage.setItem('campuscrate_token', data.token);
      return { success: true };
    } catch (err) {
      const isOffline = err.name === 'TypeError' || err.message.includes('Failed to fetch');
      const errorMsg = isOffline ? 'Backend server unreachable' : err.message;
      setAuthError(errorMsg);

      if (isOffline) {
        const dummyUser = {
          _id: `gusr_${Date.now()}`,
          name: googleUserData.name || 'Google Student',
          email: googleUserData.email || 'student@college.edu',
          role: 'student',
          department: 'Computer Science',
          avatar: googleUserData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          token: 'mock_google_token',
        };
        setCurrentUser(dummyUser);
        return { success: true };
      }
      return { success: false, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('campuscrate_user');
    localStorage.removeItem('campuscrate_token');
  };

  const addItem = (item) => {
    const newItem = {
      ...item,
      id: `item_${Date.now()}`,
      status: 'active',
      tags: item.tags || [],
      createdOn: new Date().toLocaleDateString(),
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const addClaim = (claim) => {
    const newClaim = {
      ...claim,
      id: `claim_${Date.now()}`,
      status: 'Pending',
      submittedOn: new Date().toLocaleDateString(),
    };
    setClaims((prev) => [newClaim, ...prev]);
  };

  const updateClaimStatus = (claimId, status) => {
    setClaims((prev) =>
      prev.map((claim) =>
        claim.id === claimId ? { ...claim, status } : claim,
      ),
    );
  };

  // Chat message send handler
  const sendMessage = async (conversationId, messageText) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsgObj = {
      id: `msg_${Date.now()}`,
      text: messageText,
      timestamp,
      isMe: true,
    };

    // Update local state immediately
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== conversationId && conversation._id !== conversationId) return conversation;

        const updatedMessages = [...(conversation.messages || []), newMsgObj];

        return {
          ...conversation,
          messages: updatedMessages,
          lastMessage: messageText,
          lastMessageTime: timestamp,
        };
      }),
    );

    // If socket connected, emit message
    if (socket) {
      socket.emit('new_message', {
        conversationId,
        text: messageText,
        sender: currentUser,
      });
    }

    // Try posting to API if token present
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/chat/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ conversationId, text: messageText }),
        });
      } catch (err) {
        console.warn('API message sync warning:', err.message);
      }
    }
  };

  // Start chat with item owner
  const startChatWithUser = (ownerName, itemTitle, ownerAvatar = null, itemType = 'found', itemLocation = 'Main Campus') => {
    const existingConv = conversations.find(
      (c) => c.participantName === ownerName || c.itemTitle === itemTitle
    );

    if (existingConv) {
      setActiveConversationId(existingConv.id || existingConv._id);
    } else {
      const initialMessageText = itemType === 'found'
        ? `Hi, I think this is my ${itemTitle}. I lost it near the ${itemLocation}.`
        : `Hi, I found your ${itemTitle}. I found it near the ${itemLocation}.`;

      const newConv = {
        id: `conv_${Date.now()}`,
        participantName: ownerName || 'Campus Student',
        participantAvatar:
          ownerAvatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        online: true,
        itemTitle: itemTitle || 'Item Inquiry',
        itemLocation: itemLocation,
        lastMessage: initialMessageText,
        lastMessageTime: 'Just now',
        messages: [
          {
            id: `msg_init_${Date.now()}`,
            text: initialMessageText,
            timestamp: 'Just now',
            isMe: true,
          },
        ],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
    }
  };

  const value = useMemo(
    () => ({
      selectedItemForClaim,
      setSelectedItemForClaim,
      selectedItemForDetails,
      setSelectedItemForDetails,
      reportInitialType,
      setReportInitialType,
      globalSearchQuery,
      setGlobalSearchQuery,
      currentUser,
      setCurrentUser,
      token,
      authLoading,
      authError,
      setAuthError,
      login,
      register,
      loginWithGoogle,
      logout,
      items,
      addItem,
      conversations,
      activeConversationId,
      setActiveConversationId,
      sendMessage,
      startChatWithUser,
      claims,
      addClaim,
      updateClaimStatus,
      DEFAULT_CATEGORIES,
    }),
    [
      activeConversationId,
      authError,
      authLoading,
      claims,
      conversations,
      currentUser,
      globalSearchQuery,
      items,
      reportInitialType,
      selectedItemForClaim,
      selectedItemForDetails,
      token,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
};
