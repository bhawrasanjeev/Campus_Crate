import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Send, Paperclip, Tag, ArrowLeft, MessageSquare } from 'lucide-react';
import './MessagesPage.css';

export const MessagesPage = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    fetchMessagesForConv,
    sendMessage,
    currentUser,
    unreadConvIds,
    markConvAsRead,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const activeConv =
    conversations.find((c) => c.id === activeConversationId || c._id === activeConversationId) || conversations[0];

  useEffect(() => {
    if (activeConv) {
      const convId = activeConv._id || activeConv.id;
      fetchMessagesForConv(convId);
      markConvAsRead(convId);
    }
  }, [activeConversationId, activeConv?._id]);

  const handleSelectConv = (id) => {
    setActiveConversationId(id);
    markConvAsRead(id);
    fetchMessagesForConv(id);
    setMobileShowChat(true);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;
    const targetConvId = activeConv._id || activeConv.id;
    sendMessage(targetConvId, inputMessage.trim());
    setInputMessage('');
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.itemTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className={`messages-layout ${mobileShowChat ? 'show-mobile-chat' : 'show-mobile-list'}`}>
        {/* Left Inbox Sidebar */}
        <div className="inbox-sidebar">
          <div className="inbox-header">
            <h2 className="inbox-title">Messages</h2>
            <div className="search-box-field">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-input-field"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '34px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="conversation-list">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const convId = conv.id || conv._id;
                const isUnread = unreadConvIds.includes(convId);
                const isActive = convId === activeConv?.id || convId === activeConv?._id;

                return (
                  <div
                    key={convId}
                    className={`conversation-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectConv(convId)}
                  >
                    <div className="conv-avatar-wrapper">
                      <img
                        src={conv.participantAvatar}
                        alt={conv.participantName}
                        className="conv-avatar"
                      />
                      <div className="online-dot" />
                    </div>
                    <div className="conv-content">
                      <div className="conv-top-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="conv-name">{conv.participantName}</span>
                          {isUnread && (
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#10b981',
                                boxShadow: '0 0 8px #10b981',
                                display: 'inline-block',
                              }}
                              title="New unread message"
                            />
                          )}
                        </div>
                        <span className="conv-time">
                          {conv.messages && conv.messages.length > 0
                            ? conv.messages[conv.messages.length - 1]?.timestamp || ''
                            : conv.lastMessageTime || ''}
                        </span>
                      </div>
                      <span className="conv-item-chip">{conv.itemTitle}</span>
                      <div className="conv-snippet" style={{ fontWeight: isUnread ? 700 : 400 }}>
                        {conv.messages && conv.messages.length > 0
                          ? conv.messages[conv.messages.length - 1]?.text
                          : conv.lastMessage || 'No messages yet.'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: '13px',
                  lineHeight: 1.6,
                }}
              >
                <MessageSquare size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
                <div>No active messages yet.</div>
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                  Click <strong>"Message Owner"</strong> or <strong>"Message Finder"</strong> on any item post to start a conversation!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Active Chat Panel */}
        {activeConv ? (
          <div className="chat-main">
            <div className="chat-header">
              <div className="chat-user-info">
                <button
                  type="button"
                  className="mobile-back-btn"
                  onClick={() => setMobileShowChat(false)}
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="conv-avatar-wrapper">
                  <img
                    src={activeConv.participantAvatar}
                    alt={activeConv.participantName}
                    className="conv-avatar"
                  />
                  <div className="online-dot" />
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--color-text-main)',
                      margin: 0,
                    }}
                  >
                    {activeConv.participantName}
                  </h3>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#10b981',
                      fontWeight: 600,
                    }}
                  >
                    Active Now • Campus Verified
                  </span>
                </div>
              </div>

              <div className="chat-item-context">
                <Tag size={14} />
                <span>{activeConv.itemTitle}</span>
              </div>
            </div>

            <div className="messages-body">
              {Array.isArray(activeConv.messages) && activeConv.messages.length > 0 ? (
                activeConv.messages.map((msg, idx) => {
                  const msgSenderId = msg.sender?._id || msg.sender;
                  const isMe =
                    msg.isMe ||
                    (msgSenderId && currentUser?._id && String(msgSenderId) === String(currentUser._id)) ||
                    msg.senderId === 'me' ||
                    msg.senderId === 'user1';
                  return (
                    <div
                      key={msg.id || msg._id || `msg_idx_${idx}`}
                      className={`message-bubble-wrapper ${isMe ? 'me' : 'other'}`}
                    >
                      <div className="message-bubble">{msg.text}</div>
                      <span className="message-time">{msg.timestamp}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '40px', fontSize: '13px' }}>
                  No messages yet. Send a message below to start chatting!
                </div>
              )}
            </div>

            <form className="chat-input-bar" onSubmit={handleSend}>
              <button
                type="button"
                style={{
                  color: 'var(--color-text-muted)',
                  padding: '8px',
                  borderRadius: '50%',
                }}
              >
                <Paperclip size={18} />
              </button>
              <input
                type="text"
                className="chat-input-field"
                placeholder="Write a message to arrange return..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button type="submit" className="btn-send" title="Send Message">
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div
            className="chat-main"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              gap: '12px',
            }}
          >
            <MessageSquare size={48} style={{ opacity: 0.4 }} />
            <div style={{ fontSize: '16px', fontWeight: 600 }}>Your Inbox is Empty</div>
            <div style={{ fontSize: '13px', maxWidth: '320px', lineHeight: 1.5 }}>
              Browse lost & found items and click <strong>Message</strong> to contact other students directly.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
