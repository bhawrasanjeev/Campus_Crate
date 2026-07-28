import React from 'react';
import { X, MapPin, Calendar, Tag, Info, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './ItemDetailsModal.css';

export const ItemDetailsModal = ({ item, onClose, onOpenClaim }) => {
  const { startChatWithUser } = useApp();
  const navigate = useNavigate();

  if (!item) return null;

  return (
    <div className="details-modal-overlay" onClick={onClose}>
      <div className="details-modal-card" onClick={(event) => event.stopPropagation()}>
        <button
          onClick={onClose}
          className="details-modal-close-btn"
          aria-label="Close details modal"
        >
          <X size={18} />
        </button>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div className="details-modal-layout">
            <div className="details-modal-info">
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

            <div className="details-modal-media">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="details-modal-image"
                />
              ) : (
                <div className="details-modal-no-image">
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

          <div className="details-modal-actions">
            <button
              type="button"
              onClick={() => {
                startChatWithUser(
                  item.reportedBy || item.reporterName || 'Item Poster',
                  item.title,
                  item.reporterAvatar,
                  item.type,
                  item.location
                );
                onClose();
                navigate('/messages');
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
              {item.type === 'lost' ? '💬 Message Owner' : '💬 Message Finder'}
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
                  startChatWithUser(
                    item.reportedBy || item.reporterName || 'Item Owner',
                    item.title,
                    item.reporterAvatar,
                    'lost', // Act as finder, prefill "Hi, I found your..."
                    item.location
                  );
                  onClose();
                  navigate('/messages');
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
