import React from 'react';
import { X, MapPin, Calendar, Tag, Info, Phone, MessageSquare, CheckCircle2, Trash2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ItemDetailsModal = ({ item, onClose }) => {
  const navigate = useNavigate();
  const { startChatWithUser, currentUser, markItemAsClaimed, deleteItemPost } = useApp();
  if (!item) return null;

  const isLost = item.type === 'lost';
  const isClaimed = item.status === 'claimed' || item.status === 'resolved';
  const posterName = item.reporterName || item.postedBy?.name || (isLost ? 'Item Owner' : 'Item Finder');
  const phone = item.contactPhone || (isLost ? '+91 98765 43210' : '+91 98123 45678');

  const currentUserId = currentUser?._id || currentUser?.id;
  const posterId = typeof item.postedBy === 'object' ? (item.postedBy?._id || item.postedBy?.id) : item.postedBy;
  
  const isOwner = Boolean(
    (currentUserId && posterId && String(currentUserId) === String(posterId)) ||
    (currentUser?.name && item.reporterName && currentUser.name.trim().toLowerCase() === item.reporterName.trim().toLowerCase())
  );

  const handleStartChat = () => {
    const ownerId = typeof item.postedBy === 'object' ? item.postedBy?._id : item.postedBy;
    const itemId = item._id || item.id;
    startChatWithUser(posterName, item.title, item.reporterAvatar || '/user-avatar.svg', ownerId, itemId);
    onClose();
    navigate('/messages');
  };

  const handleMarkClaimed = () => {
    markItemAsClaimed(item.id || item._id);
  };

  const handleDeletePost = () => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      deleteItemPost(item.id || item._id);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(13, 17, 34, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(940px, 100%)',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative',
          padding: '30px',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '22px',
            top: '22px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            cursor: 'pointer',
          }}
          aria-label="Close details modal"
        >
          <X size={18} />
        </button>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {item.title}
                </h2>
                {isClaimed && (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                    }}
                  >
                    CLAIMED
                  </span>
                )}
              </div>
              <p style={{ marginTop: '10px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                {item.description || 'No detailed description available.'}
              </p>

              <div style={{ display: 'grid', gap: '10px', marginTop: '24px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <MapPin size={16} />
                  <span>{item.location}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Calendar size={16} />
                  <span>{item.date}</span>
                </div>
                {!isOwner && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--color-primary)', fontWeight: 600 }}>
                    <Phone size={16} />
                    <span>Contact: {phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ width: '260px', minWidth: '260px' }}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{
                    width: '100%',
                    borderRadius: '18px',
                    objectFit: 'cover',
                    aspectRatio: '4 / 3',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    minHeight: '220px',
                    borderRadius: '18px',
                    backgroundColor: 'var(--color-surface-dim)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  No image available
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <div
              style={{
                display: 'inline-flex',
                gap: '8px',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-primary-bg)',
                color: 'var(--color-primary)',
                fontWeight: 600,
              }}
            >
              <Tag size={14} />
              {item.category}
            </div>
            <div
              style={{
                display: 'inline-flex',
                gap: '8px',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-surface-dim)',
                color: 'var(--color-text-secondary)',
                fontWeight: 600,
              }}
            >
              <Info size={14} />
              {item.type === 'lost' ? 'Lost item' : 'Found item'}
            </div>
          </div>

          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '8px 11px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--color-surface-dim)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '13px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
            {isOwner ? (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {isClaimed ? (
                  <div
                    style={{
                      padding: '12px 18px',
                      borderRadius: '12px',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Check size={16} /> Item Claimed
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleMarkClaimed}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '12px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    <CheckCircle2 size={16} /> Mark as Claimed
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDeletePost}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-lost-bg)',
                    color: 'var(--color-lost)',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  <Trash2 size={16} /> Delete Post
                </button>
              </div>
            ) : (
              <>
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-primary-bg)',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                  }}
                >
                  <Phone size={16} /> Call {phone}
                </a>

                <button
                  type="button"
                  onClick={handleStartChat}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  <MessageSquare size={16} /> {isLost ? 'Message Owner' : 'Message Finder'}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-surface-dim)',
                color: 'var(--color-text-secondary)',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
