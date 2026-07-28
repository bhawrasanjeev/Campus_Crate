import React from 'react';
import { X, MapPin, Calendar, Tag, Info, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ItemDetailsModal = ({ item, onClose, onOpenClaim }) => {
  const { startChatWithUser } = useApp();
  if (!item) return null;

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
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)' }}>
                {item.title}
              </h2>
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
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Phone size={16} />
                  <span>{item.contactPhone || 'No contact phone available'}</span>
                </div>
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
            <button
              type="button"
              onClick={() => {
                startChatWithUser(item.reportedBy || item.reporterName || 'Item Poster', item.title, item.reporterAvatar);
                onClose();
              }}
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              💬 Message Owner
            </button>
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
              }}
            >
              Close
            </button>
            {item.type === 'lost' && (
              <button
                type="button"
                onClick={() => {
                  onOpenClaim(item);
                  onClose();
                }}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-found)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                I Found This
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
