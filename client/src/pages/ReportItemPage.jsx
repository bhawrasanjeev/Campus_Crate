import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import {
  Upload,
  Search,
  Gift,
  MapPin,
  Calendar,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Phone,
} from 'lucide-react';
import './ReportItemPage.css';

const PRESET_PHOTOS = [
  { label: 'Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80' },
  { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80' },
  { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80' },
];

export const ReportItemPage = ({ onOpenDetails }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { addItem, currentUser, reportInitialType, items } = useApp();

  const [reportType, setReportType] = useState(reportInitialType || 'lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(['blue', 'campus']);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('Today, 10:30 AM');
  const [time, setTime] = useState('10:30 AM');
  const [imageUrl, setImageUrl] = useState('');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [submitted, setSubmitted] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  // Local File Upload Handler
  const processSelectedFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    processSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
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
      contactPhone: contactPhone.trim() || '+91 98123 45678',
      reporterName: currentUser?.name || 'Sanjeev Bhawra',
      reporterAvatar: currentUser?.avatar || '/user-avatar.svg',
      reporterRole: currentUser?.role === 'admin' ? 'Campus Admin' : 'Student',
    });

    setSubmitted(true);
    setTimeout(() => {
      navigate(reportType === 'lost' ? '/lost' : '/found');
    }, 1500);
  };

  return (
    <div className="page-container">
      {/* Header & Toggle */}
      <div className="page-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
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
            <Search size={15} style={{ marginRight: '6px' }} /> I Lost Something
          </button>
          <button
            type="button"
            className={`toggle-btn ${reportType === 'found' ? 'active' : ''}`}
            onClick={() => setReportType('found')}
          >
            <Gift size={15} style={{ marginRight: '6px' }} /> I Found Something
          </button>
        </div>
      </div>

      {/* Match Alert */}
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
                onClick={() => onOpenDetails && onOpenDetails(m)}
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
          <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto' }} />
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
              
              {/* SECTION 1: ITEM INFORMATION */}
              <div className="form-card-section">
                <h2 className="section-number-title">1. Item Information</h2>

                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label">
                    Item Name <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Blue Hydroflask Bottle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-grid-2" style={{ marginBottom: '18px' }}>
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
                  <div className="tags-list" style={{ marginBottom: '18px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tags.map((tag) => (
                      <span key={tag} className="tag-chip" style={{ padding: '5px 12px', borderRadius: '9999px', backgroundColor: 'var(--color-surface-dim)', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          style={{ cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 700, fontSize: '14px', color: 'var(--color-text-muted)' }}
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

              {/* SECTION 2: EVENT & CONTACT DETAILS */}
              <div className="form-card-section">
                <h2 className="section-number-title">2. Event & Contact Details</h2>

                <div className="form-grid-2" style={{ marginBottom: '18px' }}>
                  <div className="form-group">
                    <label className="form-label">
                      {reportType === 'lost' ? 'Date Lost' : 'Date Found'}{' '}
                      <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Today, 10:30 AM"
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
                      placeholder="10:30 AM"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label">
                    Last Known Location <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Main Library 2nd floor"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Contact Phone Number <span className="required-star">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px', display: 'block', lineHeight: 1.5 }}>
                    This phone number will be displayed to students who lost or found items so they can contact you directly.
                  </span>
                </div>
              </div>

              {/* SECTION 3: REFERENCE PHOTO */}
              <div className="form-card-section">
                <h2 className="section-number-title">3. Reference Photo</h2>

                <div className="photo-section-grid">
                  {/* Left: Local File Upload Dropzone */}
                  <div>
                    <label className="form-label">Upload Local Image File</label>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />

                    <div
                      className={`image-upload-dropzone ${dragActive ? 'drag-active' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {imageUrl && imageUrl.startsWith('data:image/') ? (
                        <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <img
                            src={imageUrl}
                            alt="Uploaded preview"
                            style={{ width: '120px', height: '90px', borderRadius: '8px', objectFit: 'cover', marginBottom: '8px' }}
                          />
                          <span className="upload-title" style={{ color: '#10b981' }}>Photo Selected!</span>
                          <button
                            type="button"
                            onClick={(evt) => {
                              evt.stopPropagation();
                              setImageUrl('');
                            }}
                            style={{
                              marginTop: '6px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#fee2e2',
                              color: '#ef4444',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            Remove Photo
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="upload-icon-circle">
                            <Upload size={22} />
                          </div>
                          <div className="upload-title">Click to upload file</div>
                          <div className="upload-subtitle">PNG, JPG, WebP up to 5MB</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Paste Image URL & Presets */}
                  <div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label">Or Paste Image URL</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Paste image link URL (e.g. https://...)"
                        value={imageUrl.startsWith('data:image/') ? '' : imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>

                    <div>
                      <span className="form-label" style={{ fontSize: '13px', display: 'block' }}>
                        Presets:
                      </span>
                      <div className="preset-photos-row">
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
              </div>

              {/* Form Actions */}
              <div className="form-actions-bar">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate(reportType === 'lost' ? '/lost' : '/found')}
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
                    Real-time
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
                      <div className="meta-row contact-phone-row" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                        <Phone size={14} />
                        <span>Contact: {contactPhone || '+91 98765 43210'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tips-box">
                <div className="tips-title">
                  <Lightbulb size={18} color="var(--color-amber)" />
                  Posting Guidelines
                </div>
                <ul className="tips-list">
                  <li>Specify the exact campus location (building, room, landmark).</li>
                  <li>Mention unique features like stickers, brand marks, or scratches.</li>
                  <li>Direct messaging will open as soon as another student clicks Message.</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
