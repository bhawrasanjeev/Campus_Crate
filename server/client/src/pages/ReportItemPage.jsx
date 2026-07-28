import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import {
  AlertTriangle,
  Upload,
  MapPin,
  Calendar,
  Shield,
  Lightbulb,
  CheckCircle,
  Phone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ReportItemPage.css';

const PRESET_PHOTOS = [
  { label: 'Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80' },
  { label: 'Keys', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80' },
  { label: 'MacBook', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80' },
  { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80' },
  { label: 'Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80' },
];

export const ReportItemPage = ({ onOpenDetails }) => {
  const { addItem, currentUser, reportInitialType, items } = useApp();
  const navigate = useNavigate();

  const [reportType, setReportType] = useState(reportInitialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Water Bottle');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(['blue', 'campus']);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('Today, 10:30 AM');
  const [time, setTime] = useState('10:30 AM');
  const [imageUrl, setImageUrl] = useState('');
  const [contactPhone, setContactPhone] = useState('+1 (555) 234-5678');
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result); // sets base64 data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const potentialMatches = items.filter(
    (it) => it.type !== reportType && it.status === 'active'
  ).slice(0, 2);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;

    addItem({
      type: reportType,
      title: title.trim(),
      category,
      tags,
      description: description.trim() || 'No additional description provided.',
      location: location.trim(),
      date: date || 'Today',
      time: time || 'Just now',
      imageUrl: imageUrl.trim(),
      verificationQuestion: 'Please contact directly via chat.',
      contactPhone: contactPhone.trim() || '+1 (555) 911-0022',
      reporterName: currentUser?.name || 'Anonymous Student',
      reporterAvatar: currentUser?.avatar,
      reporterRole: currentUser?.role === 'admin' ? 'Campus Admin' : 'Student',
    });

    setSubmitted(true);
    setTimeout(() => {
      navigate(reportType === 'lost' ? '/lost' : '/found');
    }, 1500);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">
            {reportType === 'lost' ? 'Report Lost Item' : 'Report Found Item'}
          </h1>
          <p className="page-subtitle">
            Provide details below to post to the college campus lost & found directory and trigger automated owner matching.
          </p>
        </div>

        <div className="report-type-toggle">
          <button
            type="button"
            className={`toggle-btn ${reportType === 'lost' ? 'active' : ''}`}
            onClick={() => setReportType('lost')}
          >
            I Lost Something
          </button>
          <button
            type="button"
            className={`toggle-btn ${reportType === 'found' ? 'active' : ''}`}
            onClick={() => setReportType('found')}
          >
            I Found Something
          </button>
        </div>
      </div>

      {potentialMatches.length > 0 && (
        <div className="match-alert-box">
          <div className="match-alert-header">
            <AlertTriangle size={18} />
            <span>
              Wait! Is it already reported? We found {potentialMatches.length} recent{' '}
              {reportType === 'lost' ? 'found' : 'lost'} posts that might match yours:
            </span>
          </div>

          <div className="match-cards-row">
            {potentialMatches.map((m) => (
              <div
                key={m.id}
                className="match-card-mini"
                onClick={() => onOpenDetails(m)}
              >
                {m.imageUrl && (
                  <img src={m.imageUrl} alt={m.title} className="match-thumb" />
                )}
                <div>
                  <div className="match-title">{m.title}</div>
                  <div className="match-loc">{m.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {submitted ? (
        <div
          className="form-card-section"
          style={{ textAlign: 'center', padding: '60px 24px' }}
        >
          <CheckCircle size={64} color="#3bb273" style={{ margin: '0 auto' }} />
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-primary)',
              marginTop: '16px',
            }}
          >
            Report Submitted Successfully!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
            Redirecting to the {reportType} items feed...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="report-page-layout">
            <div className="left-form-column">
              {/* Section 1: Item Information */}
              <div className="form-card-section">
                <h2 className="section-heading">1. Item Information</h2>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">
                    Item Name <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Blue Hydroflask Bottle, Set of Keys"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-grid-2" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">
                      Category <span className="required-star">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tags / Keywords</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Type tag & hit Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </div>
                </div>

                {tags.length > 0 && (
                  <div className="tags-list" style={{ marginBottom: '16px' }}>
                    {tags.map((tag) => (
                      <span key={tag} className="tag-chip">
                        #{tag}{' '}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          style={{ marginLeft: '4px', cursor: 'pointer' }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Detailed Description</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Describe brand, stickers, scratches, unique features..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Section 2: Event & Contact Details */}
              <div className="form-card-section">
                <h2 className="section-heading">2. Event & Contact Details</h2>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      {reportType === 'lost' ? 'Date Lost' : 'Date Found'}{' '}
                      <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Today, 10:30 AM"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Approximate Time</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Around 2:00 PM"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">
                    Last Known Location <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Main Library 2nd floor, Student Union cafeteria"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">
                    Contact Phone Number <span className="required-star">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +1 (555) 234-5678"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                  />
                  <span className="form-help">
                    This phone number will be displayed to students who lost or found items so they can contact you directly.
                  </span>
                </div>
              </div>

              {/* Section 3: Reference Photo */}
              <div className="form-card-section">
                <h2 className="section-heading">3. Reference Photo</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'center' }}>
                  <div className="form-group">
                    <label className="form-label">Upload Local Image File</label>
                    <div 
                      onClick={() => document.getElementById('file-upload-input').click()}
                      style={{
                        border: '2px dashed var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '24px 16px',
                        textAlign: 'center',
                        backgroundColor: 'var(--color-bg)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary-light)';
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-dim)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                      }}
                    >
                      <Upload size={24} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Click to upload file</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>PNG, JPG, WebP up to 5MB</div>
                    </div>
                    <input
                      type="file"
                      id="file-upload-input"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div>
                    <div className="form-group">
                      <label className="form-label">Or Paste Image URL</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Paste image link URL (e.g. https://...)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>

                    <div className="preset-photos-row" style={{ marginTop: '12px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        Presets:
                      </span>
                      {PRESET_PHOTOS.map((p) => (
                        <img
                          key={p.label}
                          src={p.url}
                          alt={p.label}
                          className={`preset-photo-thumb ${
                            imageUrl === p.url ? 'selected' : ''
                          }`}
                          onClick={() => setImageUrl(p.url)}
                          title={p.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions-bar">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate(`/${reportType}`)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit-claim"
                  disabled={!title.trim() || !location.trim()}
                >
                  {reportType === 'lost' ? 'Post Lost Item' : 'Post Found Item'}
                </button>
              </div>
            </div>

            {/* Right Column: Live Preview Card */}
            <div className="preview-sidebar">
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      margin: 0,
                    }}
                  >
                    Live Preview
                  </h3>
                  <span
                    style={{
                      fontSize: '11px',
                      backgroundColor: 'var(--color-surface-dim)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                    }}
                  >
                    Updates in real-time
                  </span>
                </div>

                <div
                  className="item-card"
                  style={{ boxShadow: 'none', border: '1px solid var(--color-border)' }}
                >
                  <div className="item-card-image-wrapper">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="item-card-image" />
                    ) : (
                      <div className="item-card-no-image">
                        <Upload size={32} />
                      </div>
                    )}
                    <div className={`status-badge ${reportType}`}>
                      {reportType === 'lost' ? 'Lost' : 'Found'}
                    </div>
                  </div>

                  <div className="item-card-content">
                    <h3 className="item-title">{title || 'Your Item Title'}</h3>
                    <span className="category-tag">{category}</span>

                    <div className="item-meta">
                      <div className="meta-row">
                        <MapPin size={14} />
                        <span>{location || 'Location specified here'}</span>
                      </div>
                      <div className="meta-row">
                        <Calendar size={14} />
                        <span>{date || 'Date specified here'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tips-box">
                <div className="tips-title">
                  <Lightbulb size={18} color="var(--color-amber)" />
                  Tips for a good post
                </div>
                <ul className="tips-list">
                  <li>Be specific about the location where it was lost or found.</li>
                  <li>Do NOT reveal unique verification answers in the public description!</li>
                  <li>Upload a photo or choose a preset thumbnail to increase responses.</li>
                  <li>Keep notifications enabled to respond to claimant messages promptly.</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
