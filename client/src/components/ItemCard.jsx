import React from 'react';
import { MapPin, Calendar, ImageOff, AlertCircle, CheckCircle2, Phone } from 'lucide-react';
import './ItemCard.css';

export const ItemCard = ({ item, onSelect, onClaim }) => {
  const isLost = item.type === 'lost';
  const phone = item.contactPhone || (isLost ? '+1 (555) 234-5678' : '+1 (555) 911-0022');

  return (
    <div className="item-card" onClick={() => onSelect(item)}>
      <div className="item-card-image-wrapper">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="item-card-image" />
        ) : (
          <div className="item-card-no-image">
            <ImageOff size={40} strokeWidth={1.5} />
          </div>
        )}

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
          <div className="meta-row contact-phone-row" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            <Phone size={14} />
            <span>Contact: {phone}</span>
          </div>
        </div>

        <div className="item-card-footer">
          <a
            href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
            className="btn-card-phone"
            onClick={(e) => e.stopPropagation()}
            title={`Call ${phone}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
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
            className="btn-card-action"
            onClick={(e) => {
              e.stopPropagation();
              if (onClaim) {
                onClaim(item);
              } else {
                onSelect(item);
              }
            }}
          >
            {isLost ? 'I Found This' : 'Details'}
          </button>
        </div>
      </div>
    </div>
  );
};
