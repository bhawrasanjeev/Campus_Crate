import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_CLAIMS,
  DEFAULT_CONVERSATIONS,
  DEFAULT_ITEMS,
} from '../data/mockData';

const AppContext = createContext(null);
const getApiServerUrl = () => {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '') {
    return import.meta.env.VITE_API_URL.trim().replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  return 'http://localhost:5050';
};

const API_SERVER_URL = getApiServerUrl();
const API_BASE_URL = `${API_SERVER_URL}/api`;

const parseJsonResponse = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('API server returned HTML. Please check VITE_API_URL in your Vercel Environment Variables.');
  }
};

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('lost');
  const [selectedItemForClaim, setSelectedItemForClaim] = useState(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);
  const [reportInitialType, setReportInitialType] = useState('lost');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  // Unread messages tracking state
  const [unreadConvIds, setUnreadConvIds] = useState([]);

  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('campuscrate_theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('campuscrate_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

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
  const [activeConversationId, setActiveConversationId] = useState(
    DEFAULT_CONVERSATIONS[0]?.id || null,
  );
  const [claims, setClaims] = useState(DEFAULT_CLAIMS);
  const [socket, setSocket] = useState(null);

  // Mark conversation as read
  const markConvAsRead = (convId) => {
    setUnreadConvIds((prev) => prev.filter((id) => id !== convId));
  };

  // Fetch items from MongoDB backend & merge with default items
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items?status=all`);
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data)) {
        const formattedApiItems = data.map((it) => ({
          ...it,
          id: it._id || it.id,
          imageUrl: it.photoUrl || it.imageUrl || '',
          reporterName: it.postedBy?.name || 'Campus Student',
          reporterAvatar: it.postedBy?.avatar,
          contactPhone: it.contactPhone || '',
          date: typeof it.date === 'string' ? it.date : new Date(it.date).toLocaleDateString(),
        }));

        setItems(formattedApiItems);
      }
    } catch (err) {
      console.warn('API fetchItems warning (using local state):', err.message);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Initialize Socket.io connection on user auth
  useEffect(() => {
    if (currentUser) {
      const newSocket = io(API_SERVER_URL, {
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

        const targetConvId = newMessage.conversationId?._id || newMessage.conversationId;
        const msgSenderId = newMessage.sender?._id || newMessage.sender;

        if (msgSenderId !== currentUser?._id) {
          setUnreadConvIds((prev) => (prev.includes(targetConvId) ? prev : [...prev, targetConvId]));
        }

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetConvId || conv._id === targetConvId) {
              return {
                ...conv,
                messages: [
                  ...(conv.messages || []),
                  {
                    id: newMessage._id || `msg_${Date.now()}`,
                    text: newMessage.text,
                    timestamp,
                    sender: msgSenderId,
                    isMe: msgSenderId === currentUser?._id,
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

  // Fetch messages for a specific conversation
  const fetchMessagesForConv = async (convId) => {
    if (!token || !convId || typeof convId !== 'string' || convId.startsWith('conv_')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages/${convId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data)) {
        const formattedMsgs = data.map((m) => {
          const senderId = m.sender?._id || m.sender;
          return {
            id: m._id,
            _id: m._id,
            text: m.text,
            sender: senderId,
            senderName: m.sender?.name,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            isMe: senderId === currentUser?._id,
          };
        });

        setConversations((prev) =>
          prev.map((c) => (c.id === convId || c._id === convId ? { ...c, messages: formattedMsgs } : c))
        );
      }
    } catch (err) {
      console.warn('API fetchMessagesForConv warning:', err.message);
    }
  };

  // Fetch conversations from backend & load active conversation messages
  const fetchConversations = async () => {
    if (!token || !currentUser) return;
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data)) {
        const formattedConvs = data.map((conv) => {
          const otherParticipant = conv.participants?.find(
            (p) => p._id !== currentUser._id && p.id !== currentUser._id
          ) || conv.participants?.[0];

          return {
            id: conv._id,
            _id: conv._id,
            targetUserId: otherParticipant?._id,
            participantName: otherParticipant?.name || 'Campus Student',
            participantAvatar: otherParticipant?.avatar || '/user-avatar.svg',
            online: true,
            itemTitle: conv.item?.title || 'Item Inquiry',
            itemLocation: conv.item?.location || 'Main Campus',
            lastMessage: conv.lastMessage || 'No messages yet',
            lastMessageTime: conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
            messages: conv.messages || [],
          };
        });

        setConversations(formattedConvs);
        
        if (formattedConvs.length > 0) {
          const currentActive = formattedConvs.find((c) => c.id === activeConversationId || c._id === activeConversationId) || formattedConvs[0];
          setActiveConversationId(currentActive.id);
          fetchMessagesForConv(currentActive.id);
        } else {
          setActiveConversationId(null);
        }
      }
    } catch (err) {
      console.warn('API fetchConversations warning:', err.message);
    }
  };

  useEffect(() => {
    if (currentUser && token) {
      fetchConversations();
    }
  }, [currentUser, token]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessagesForConv(activeConversationId);
      markConvAsRead(activeConversationId);
    }
  }, [activeConversationId]);

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
      setCurrentPage('lost');
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

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return {
        success: true,
        requiresOtp: true,
        email: data.email,
        message: data.message,
        otpDemoHint: data.otpDemoHint,
      };
    } catch (err) {
      const isOffline = err.name === 'TypeError' || err.message.includes('Failed to fetch');
      const errorMsg = isOffline ? 'Backend server unreachable' : err.message;
      setAuthError(errorMsg);
      return { success: false, isOffline, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };

  const sendOtp = async (email) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      return { success: true, message: data.message, otpDemoHint: data.otpDemoHint };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const verifyOtp = async (email, otp) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      setCurrentUser(data);
      setToken(data.token);
      localStorage.setItem('campuscrate_user', JSON.stringify(data));
      localStorage.setItem('campuscrate_token', data.token);
      setCurrentPage('lost');
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
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
      setCurrentPage('lost');
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
        setCurrentPage('lost');
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
    setCurrentPage('lost');
  };

  // Add Item with ImageKit & MongoDB persistence
  const addItem = async (item) => {
    const tempId = `item_${Date.now()}`;
    const newItemLocal = {
      ...item,
      id: tempId,
      status: 'active',
      tags: item.tags || [],
      createdOn: new Date().toLocaleDateString(),
    };
    
    setItems((prev) => [newItemLocal, ...prev]);

    if (token) {
      try {
        let finalPhotoUrl = item.imageUrl || item.photoUrl || '';

        if (finalPhotoUrl && finalPhotoUrl.startsWith('data:image/')) {
          try {
            const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ image: finalPhotoUrl, fileName: `item_${Date.now()}.jpg` }),
            });
            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              if (uploadData.photoUrl) {
                finalPhotoUrl = uploadData.photoUrl;
              }
            }
          } catch (uploadErr) {
            console.warn('Image upload notice:', uploadErr.message);
          }
        }

        const response = await fetch(`${API_BASE_URL}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: item.type,
            title: item.title,
            description: item.description,
            category: item.category,
            location: item.location,
            date: item.date,
            photoUrl: finalPhotoUrl,
            contactPhone: item.contactPhone || '',
            tags: item.tags || [],
          }),
        });

        if (response.ok) {
          const savedItem = await response.json();
          const formattedSavedItem = {
            ...savedItem,
            id: savedItem._id,
            imageUrl: savedItem.photoUrl || item.imageUrl || '',
            reporterName: savedItem.postedBy?.name || item.reporterName || currentUser?.name,
            reporterAvatar: savedItem.postedBy?.avatar || currentUser?.avatar,
            contactPhone: savedItem.contactPhone || item.contactPhone,
            date: typeof savedItem.date === 'string' ? savedItem.date : item.date,
          };
          setItems((prev) =>
            prev.map((it) => (it.id === tempId ? formattedSavedItem : it))
          );
          return formattedSavedItem;
        }
      } catch (err) {
        console.warn('API addItem warning:', err.message);
      }
    }
    return newItemLocal;
  };

  // Mark item as claimed in MongoDB
  const markItemAsClaimed = async (itemId) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId || it._id === itemId ? { ...it, status: 'claimed' } : it))
    );

    if (token && typeof itemId === 'string' && !itemId.startsWith('item_')) {
      try {
        await fetch(`${API_BASE_URL}/items/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'claimed' }),
        });
      } catch (err) {
        console.warn('API markItemAsClaimed warning:', err.message);
      }
    }
  };

  // Delete item post from MongoDB
  const deleteItemPost = async (itemId) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId && it._id !== itemId));

    if (token && typeof itemId === 'string' && !itemId.startsWith('item_')) {
      try {
        await fetch(`${API_BASE_URL}/items/${itemId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('API deleteItemPost warning:', err.message);
      }
    }
  };

  // Add Claim with API sync to MongoDB
  const addClaim = async (claim) => {
    const localId = `claim_${Date.now()}`;
    const newClaim = {
      ...claim,
      id: localId,
      status: 'Pending',
      submittedOn: new Date().toLocaleDateString(),
    };
    setClaims((prev) => [newClaim, ...prev]);

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/admin/claims`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            itemId: claim.itemId,
            itemTitle: claim.itemTitle || claim.title,
            itemImage: claim.itemImage || claim.imageUrl || '',
            location: claim.location || 'Campus',
            verificationAnswer: claim.verificationAnswer || claim.answer || 'Verification claim details',
            message: claim.message || '',
          }),
        });
      } catch (err) {
        console.warn('API addClaim warning:', err.message);
      }
    }
  };

  const updateClaimStatus = (claimId, status) => {
    setClaims((prev) =>
      prev.map((claim) =>
        claim.id === claimId ? { ...claim, status } : claim,
      ),
    );
  };

  // Send Chat message with API & Socket sync
  const sendMessage = async (conversationId, messageText) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsgObj = {
      id: `msg_${Date.now()}`,
      text: messageText,
      timestamp,
      sender: currentUser?._id,
      isMe: true,
    };

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

    if (socket) {
      socket.emit('new_message', {
        conversationId,
        text: messageText,
        sender: currentUser,
      });
    }

    if (token && conversationId && typeof conversationId === 'string' && !conversationId.startsWith('conv_')) {
      try {
        const response = await fetch(`${API_BASE_URL}/chat/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ conversationId, text: messageText }),
        });

        if (response.ok) {
          const savedMsg = await response.json();
          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.id !== conversationId && conv._id !== conversationId) return conv;
              return {
                ...conv,
                messages: conv.messages.map((m) =>
                  m.id === newMsgObj.id ? { ...m, id: savedMsg._id, _id: savedMsg._id } : m
                ),
              };
            })
          );
        }
      } catch (err) {
        console.warn('API sendMessage warning:', err.message);
      }
    }
  };

  // Start chat with item owner (creates MongoDB conversation)
  const startChatWithUser = async (ownerName, itemTitle, ownerAvatar = null, targetUserId = null, itemId = null) => {
    let existingConv = null;
    if (targetUserId) {
      existingConv = conversations.find(
        (c) => c.targetUserId === targetUserId || c.id === targetUserId || c._id === targetUserId
      );
    } else {
      existingConv = conversations.find(
        (c) => c.participantName === ownerName || c.itemTitle === itemTitle
      );
    }

    if (existingConv) {
      setActiveConversationId(existingConv.id || existingConv._id);
      fetchMessagesForConv(existingConv.id || existingConv._id);
      setCurrentPage('messages');
      return;
    }

    if (token && targetUserId && targetUserId !== currentUser?._id) {
      try {
        const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ targetUserId, itemId }),
        });

        if (response.ok) {
          const convData = await response.json();
          const otherParticipant = convData.participants?.find(
            (p) => p._id !== currentUser._id && p.id !== currentUser._id
          ) || { name: ownerName, avatar: ownerAvatar };

          const newConv = {
            id: convData._id,
            _id: convData._id,
            targetUserId: otherParticipant._id,
            participantName: otherParticipant.name || ownerName || 'Campus Student',
            participantAvatar: otherParticipant.avatar || ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            online: true,
            itemTitle: itemTitle || 'Item Inquiry',
            itemLocation: 'Main Campus',
            lastMessage: 'Conversation started',
            lastMessageTime: 'Just now',
            messages: [],
          };

          setConversations((prev) => [newConv, ...prev]);
          setActiveConversationId(newConv.id);
          fetchMessagesForConv(newConv.id);
          setCurrentPage('messages');
          return;
        }
      } catch (err) {
        console.warn('API startChatWithUser warning:', err.message);
      }
    }

    const localId = `conv_${Date.now()}`;
    const newConv = {
      id: localId,
      _id: localId,
      participantName: ownerName || 'Campus Student',
      participantAvatar: ownerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      online: true,
      itemTitle: itemTitle || 'Item Inquiry',
      itemLocation: 'Main Campus',
      lastMessage: 'Hi, I am reaching out regarding this item.',
      lastMessageTime: 'Just now',
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          text: `Hi, I am reaching out regarding "${itemTitle}".`,
          timestamp: 'Just now',
          isMe: true,
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setCurrentPage('messages');
  };

  const hasUnreadMessages = unreadConvIds.length > 0;

  const value = useMemo(
    () => ({
      currentPage,
      setCurrentPage,
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
      sendOtp,
      verifyOtp,
      loginWithGoogle,
      logout,
      items,
      addItem,
      fetchItems,
      markItemAsClaimed,
      deleteItemPost,
      conversations,
      activeConversationId,
      setActiveConversationId,
      fetchMessagesForConv,
      sendMessage,
      startChatWithUser,
      claims,
      addClaim,
      updateClaimStatus,
      unreadConvIds,
      hasUnreadMessages,
      markConvAsRead,
      theme,
      toggleTheme,
      DEFAULT_CATEGORIES,
    }),
    [
      activeConversationId,
      authError,
      authLoading,
      claims,
      conversations,
      currentPage,
      currentUser,
      globalSearchQuery,
      hasUnreadMessages,
      items,
      reportInitialType,
      selectedItemForClaim,
      selectedItemForDetails,
      theme,
      token,
      unreadConvIds,
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
