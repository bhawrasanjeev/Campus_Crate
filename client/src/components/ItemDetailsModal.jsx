import React from 'react';
import { useApp } from '../context/AppContext';
import { X, MapPin, Calendar, ShieldCheck, MessageSquare, AlertCircle, CheckCircle2, Phone, PhoneCall } from 'lucide-react';
import './ItemDetailsModal.css';

export const ItemDetailsModal = ({
  item,
  onClose,
  onOpenClaim,
}) => {
  const { setCurrentPage, setActiveConversationId } = useApp();
  const isLost = item.type === 'lost';
  const phone = item.contactPhone || (isLost ? '+1 (555) 234-5678' : '+1 (555) 911-0022');

  const handleMessagePoster = () => {
    setActiveConversationId('conv_1');
    setCurrentPage('messages');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="details-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className={`status-badge ${isLost ? 'lost' : 'found'}`}
              style={{ position: 'static' }}
            >
              {isLost ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
              {isLost ? 'Lost Item' : 'Found Item'}
            </span>
          </div>

          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="details-modal-body">
          {item.imageUrl && (
            <div className="details-image-hero">
              <img src={item.imageUrl} alt={item.title} />
            </div>
          )}

          <div className="details-header-row">
            <div>
              <h1 className="details-title">{item.title}</h1>
              <span className="category-tag">{item.category}</span>
            </div>
          </div>

          <div className="details-reporter-card">
            <img
              src={
                item.reporterAvatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
              }
              alt={item.reporterName}
              className="reporter-avatar"
            />
            <div className="reporter-info">
              <span className="reporter-name">Posted by {item.reporterName}</span>
              <span className="reporter-role">{item.reporterRole || 'Campus Member'}</span>
            </div>
          </div>

          {/* Contact Phone Card */}
          <div
            style={{
              backgroundColor: isLost ? 'var(--color-lost-bg)' : 'var(--color-found-bg)',
              border: `1px solid ${isLost ? 'var(--color-lost)' : 'var(--color-found)'}`,
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: isLost ? 'var(--color-lost)' : 'var(--color-found)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Phone size={20} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 700,
                    color: isLost ? 'var(--color-lost)' : 'var(--color-found)',
                    display: 'block',
                  }}
                >
                  {isLost ? 'Owner Contact Number' : 'Finder Contact Phone Number'}
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: 'var(--color-text-main)',
                  }}
                >
                  {phone}
                </span>
              </div>
            </div>

            <a
              href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: isLost ? 'var(--color-lost)' : 'var(--color-found)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <PhoneCall size={15} /> Call / SMS
            </a>
          </div>

          <div className="details-grid-meta">
            <div className="meta-box">
              <MapPin size={18} className="meta-box-icon" />
              <div className="meta-box-text">
                <span className="meta-box-label">Location</span>
                <span className="meta-box-value">{item.location}</span>
              </div>
            </div>

            <div className="meta-box">
              <Calendar size={18} className="meta-box-icon" />
              <div className="meta-box-text">
                <span className="meta-box-label">Date & Time</span>
                <span className="meta-box-value">{item.date}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="details-section-title">Description</h3>
            <p className="details-description-text">{item.description}</p>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div>
              <h3 className="details-section-title">Tags</h3>
              <div className="tags-list">
                {item.tags.map((tag, i) => (
                  <span key={i} className="tag-chip">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.verificationQuestion && (
            <div
              style={{
                backgroundColor: 'var(--color-surface-dim)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <ShieldCheck size={20} color="var(--color-primary)" />
              <div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--color-primary)',
                    display: 'block',
                  }}
                >
                  Ownership Verification Question:
                </span>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  "{item.verificationQuestion}"
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-message-owner" onClick={handleMessagePoster}>
            <MessageSquare size={16} />
            Message Poster
          </button>

          <button
            className="btn-submit-claim"
            onClick={() => {
              onClose();
              onOpenClaim(item);
            }}
          >
            {isLost ? 'I Found This Item' : 'Claim Ownership'}
          </button>
        </div>
      </div>
    </div>
  );
};
