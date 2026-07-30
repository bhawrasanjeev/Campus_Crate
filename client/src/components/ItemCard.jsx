import React from 'react';
import { MapPin, Calendar, ImageOff, AlertCircle, CheckCircle2, Phone, MessageSquare, Trash2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './ItemCard.css';

export const ItemCard = ({ item, onSelect }) => {
  const navigate = useNavigate();
  const { startChatWithUser, currentUser, markItemAsClaimed, deleteItemPost } = useApp();

  const isLost = item.type === 'lost';
  const isClaimed = item.status === 'claimed' || item.status === 'resolved';
  const phone = item.contactPhone || (isLost ? '+91 98765 43210' : '+91 98123 45678');
  const posterName = item.reporterName || item.postedBy?.name || (isLost ? 'Item Owner' : 'Item Finder');

  const currentUserId = currentUser?._id || currentUser?.id;
  const posterId = typeof item.postedBy === 'object' ? (item.postedBy?._id || item.postedBy?.id) : item.postedBy;
  
  const isOwner = Boolean(
    (currentUserId && posterId && String(currentUserId) === String(posterId)) ||
    (currentUser?.name && item.reporterName && currentUser.name.trim().toLowerCase() === item.reporterName.trim().toLowerCase())
  );

  const handleMessageUser = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please sign in or create an account to message the item poster.');
      navigate('/login');
      return;
    }
    const ownerId = typeof item.postedBy === 'object' ? item.postedBy?._id : item.postedBy;
    const itemId = item._id || item.id;
    startChatWithUser(posterName, item.title, item.reporterAvatar || '/user-avatar.svg', ownerId, itemId);
    navigate('/messages');
  };

  const handleMarkClaimed = (e) => {
    e.stopPropagation();
    markItemAsClaimed(item.id || item._id);
  };

  const handleDeletePost = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      deleteItemPost(item.id || item._id);
    }
  };

  return (
    <div className={`item-card ${isClaimed ? 'is-claimed-card' : ''}`} onClick={() => onSelect && onSelect(item)}>
      <div className="item-card-image-wrapper">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="item-card-image" />
        ) : (
          <div className="item-card-no-image">
            <ImageOff size={40} strokeWidth={1.5} />
          </div>
        )}

        {isClaimed ? (
          <div
            className="status-badge"
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              fontWeight: 800,
            }}
          >
            <Check size={12} /> CLAIMED
          </div>
        ) : (
          <div className={`status-badge ${isLost ? 'lost' : 'found'}`}>
            {isLost ? (
              <>
                <AlertCircle size={12} /> Lost
              </>
            ) : (
              <>
                <CheckCircle2 size={12} /> Found
              </>
            )}
          </div>
        )}
      </div>

      <div className="item-card-content">
        <h3 className="item-title">{item.title}</h3>

        <span className="category-tag">{item.category}</span>

        <div className="item-meta">
          <div className="meta-row">
            <MapPin size={14} />
            <span>{item.location}</span>
          </div>
          <div className="meta-row">
            <Calendar size={14} />
            <span>{item.date}</span>
          </div>
          {!isOwner && (
            <div className="meta-row contact-phone-row" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              <Phone size={14} />
              <span>Contact: {currentUser ? phone : 'Sign in to view contact'}</span>
            </div>
          )}
        </div>

        <div className="item-card-footer">
          {isOwner ? (
            <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
              {isClaimed ? (
                <div
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                  }}
                >
                  <Check size={14} /> Claimed
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleMarkClaimed}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <CheckCircle2 size={13} /> Mark Claimed
                </button>
              )}

              <button
                type="button"
                onClick={handleDeletePost}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-lost-bg)',
                  color: 'var(--color-lost)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="Delete Post"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          ) : (
            <>
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                className="btn-card-phone"
                onClick={(e) => e.stopPropagation()}
                title={`Call ${phone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-primary-bg)',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                }}
              >
                <Phone size={13} /> Call
              </a>

              <button
                type="button"
                className="btn-card-action"
                onClick={handleMessageUser}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <MessageSquare size={13} /> {isLost ? 'Message Owner' : 'Message Finder'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
