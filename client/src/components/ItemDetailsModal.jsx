import React, { useState } from 'react';
import { X, MapPin, Calendar, Tag, Info, Phone, MessageSquare, CheckCircle2, Trash2, Check, Flag, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ItemDetailsModal = ({ item, onClose }) => {
  const navigate = useNavigate();
  const { startChatWithUser, currentUser, markItemAsClaimed, deleteItemPost, submitReport, submitGuestInquiry } = useApp();
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [guestReportName, setGuestReportName] = useState('');
  const [guestReportEmail, setGuestReportEmail] = useState('');
  const [reportStatusMsg, setReportStatusMsg] = useState('');

  const [showGuestInquiry, setShowGuestInquiry] = useState(false);
  const [guestMsgName, setGuestMsgName] = useState('');
  const [guestMsgEmail, setGuestMsgEmail] = useState('');
  const [guestMsgBody, setGuestMsgBody] = useState('');
  const [inquiryStatusMsg, setInquiryStatusMsg] = useState('');
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);

  if (!item) return null;

  const isLost = item.type === 'lost';
  const isClaimed = item.status === 'claimed' || item.status === 'resolved';
  const posterName = item.reporterName || item.postedBy?.name || (isLost ? 'Item Owner' : 'Item Finder');
  const phone = item.contactPhone || (isLost ? '+91 98765 43210' : '+91 98123 45678');
  const isAdmin = currentUser?.role === 'admin';

  const currentUserId = currentUser?._id || currentUser?.id;
  const posterId = typeof item.postedBy === 'object' ? (item.postedBy?._id || item.postedBy?.id) : item.postedBy;
  
  const isOwner = Boolean(
    (currentUserId && posterId && String(currentUserId) === String(posterId)) ||
    (currentUser?.name && item.reporterName && currentUser.name.trim().toLowerCase() === item.reporterName.trim().toLowerCase())
  );

  const handleRequireAuth = (actionName) => {
    if (!currentUser) {
      if (window.confirm(`Please sign in or register to ${actionName}. Would you like to go to the login page now?`)) {
        onClose();
        navigate('/login');
      }
      return false;
    }
    return true;
  };

  const handleStartChat = () => {
    if (!handleRequireAuth('message the item owner/finder')) return;
    const ownerId = typeof item.postedBy === 'object' ? item.postedBy?._id : item.postedBy;
    const itemId = item._id || item.id;
    startChatWithUser(posterName, item.title, item.reporterAvatar || '/user-avatar.svg', ownerId, itemId);
    onClose();
    navigate('/messages');
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!handleRequireAuth('submit a report')) return;
    setReportStatusMsg('');
    const res = await submitReport(item.id || item._id, reportReason);
    if (res.success) {
      setReportStatusMsg('✅ Report submitted to campus admin for safety review.');
      setTimeout(() => {
        setShowReportModal(false);
        setReportStatusMsg('');
      }, 2000);
    } else {
      setReportStatusMsg(`❌ Report error: ${res.message || 'Server error'}`);
    }
  };

  const handleMarkClaimed = () => {
    if (!handleRequireAuth('mark items as claimed')) return;
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
                    borderRadius: '18px',
                    backgroundColor: 'var(--color-surface-dim)',
                    aspectRatio: '4 / 3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  No Image Attached
                </div>
              )}
            </div>
          </div>

          {/* SAFETY REPORT MODAL INLINE (Logged-In Users Only) */}
          {showReportModal && (
            <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b' }}>🚩 Report Listing for Moderation</h3>
                <button type="button" onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              {reportStatusMsg && <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: 600 }}>{reportStatusMsg}</div>}
              <form onSubmit={handleReportSubmit} style={{ display: 'grid', gap: '10px' }}>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #fca5a5', outline: 'none' }}
                >
                  <option value="">-- Select Reason for Report --</option>
                  <option value="Inappropriate or Offensive Content">Inappropriate or Offensive Content</option>
                  <option value="Misleading or Fake Listing">Misleading or Fake Listing</option>
                  <option value="Duplicate Listing">Duplicate Listing</option>
                  <option value="Privacy Violation">Privacy Violation</option>
                  <option value="Other Safety Issue">Other Safety Issue</option>
                </select>
                <button
                  type="submit"
                  style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  Submit Flag Report
                </button>
              </form>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              onClick={() => handleRequireAuth('report a listing') && setShowReportModal(!showReportModal)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                color: '#ef4444',
                fontWeight: 600,
                border: '1px solid #fca5a5',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
              }}
            >
              <Flag size={14} /> Report Listing
            </button>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
              {(isOwner || isAdmin) ? (
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
                    <Trash2 size={16} /> {isAdmin ? 'Delete Listing (Admin)' : 'Delete Post'}
                  </button>
                </div>
              ) : (
                <>
                  {currentUser ? (
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
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRequireAuth('view contact details and call')}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--color-primary-bg)',
                        color: 'var(--color-primary)',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        border: 'none',
                      }}
                    >
                      <Phone size={16} /> Call (Sign in to view)
                    </button>
                  )}

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
    </div>
  );
};
