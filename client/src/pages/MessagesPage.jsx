import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Send, Paperclip, Tag, CheckCheck } from 'lucide-react';
import './MessagesPage.css';

export const MessagesPage = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;
    sendMessage(activeConv.id, inputMessage.trim());
    setInputMessage('');
  };

  const filteredConversations = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.itemTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="messages-layout">
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
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${
                  conv.id === activeConv?.id ? 'active' : ''
                }`}
                onClick={() => setActiveConversationId(conv.id)}
              >
                <div className="conv-avatar-wrapper">
                  <img
                    src={
                      conv.participantAvatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={conv.participantName}
                    className="conv-avatar"
                  />
                  {conv.online && <span className="online-dot" />}
                </div>

                <div className="conv-content">
                  <div className="conv-top-row">
                    <span className="conv-name">{conv.participantName}</span>
                    <span className="conv-time">{conv.lastMessageTime}</span>
                  </div>

                  <span className="conv-item-chip">
                    <Tag size={10} style={{ marginRight: '3px' }} />
                    {conv.itemTitle}
                  </span>

                  <div className="conv-snippet">{conv.lastMessage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chat Panel */}
        {activeConv ? (
          <div className="chat-main">
            <div className="chat-header">
              <div className="chat-user-info">
                <img
                  src={
                    activeConv.participantAvatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={activeConv.participantName}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: '700',
                      fontSize: '16px',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {activeConv.participantName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#3bb273', fontWeight: 600 }}>
                    {activeConv.online ? '• Online now' : 'Offline'}
                  </div>
                </div>
              </div>

              <div className="chat-item-context">
                <Tag size={14} />
                <span>
                  {activeConv.itemTitle} — {activeConv.itemLocation}
                </span>
              </div>
            </div>

            <div className="messages-body">
              {activeConv.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble-wrapper ${msg.isMe ? 'me' : 'other'}`}
                >
                  <div className="message-bubble">{msg.text}</div>
                  <span className="message-time">
                    {msg.timestamp}{' '}
                    {msg.isMe && (
                      <CheckCheck
                        size={12}
                        color="var(--color-primary)"
                        style={{ marginLeft: '4px' }}
                      />
                    )}
                  </span>
                </div>
              ))}
            </div>

            <form className="chat-input-bar" onSubmit={handleSend}>
              <button
                type="button"
                className="icon-button"
                title="Attach Photo or Document"
              >
                <Paperclip size={20} />
              </button>

              <input
                type="text"
                className="chat-input-field"
                placeholder={`Message ${activeConv.participantName}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />

              <button
                type="submit"
                className="btn-send"
                disabled={!inputMessage.trim()}
                title="Send Message"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            Select a conversation on the left to start messaging.
          </div>
        )}
      </div>
    </div>
  );
};
