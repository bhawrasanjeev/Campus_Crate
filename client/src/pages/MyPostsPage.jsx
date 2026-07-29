import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MapPin, Calendar, CheckCircle2, Trash2, Plus, AlertCircle, Check } from 'lucide-react';
import './MyPostsPage.css';

export const MyPostsPage = ({ onOpenDetails }) => {
  const navigate = useNavigate();
  const { items, setReportInitialType, currentUser, markItemAsClaimed, deleteItemPost } = useApp();
  const [activeTab, setActiveTab] = useState('all');

  const currentUserId = currentUser?._id || currentUser?.id;

  const myItems = items.filter((item) => {
    const posterId = typeof item.postedBy === 'object' ? (item.postedBy?._id || item.postedBy?.id) : item.postedBy;
    const isOwner = Boolean(
      (currentUserId && posterId && String(currentUserId) === String(posterId)) ||
      (currentUser?.name && item.reporterName && currentUser.name.trim().toLowerCase() === item.reporterName.trim().toLowerCase())
    );

    if (!isOwner) return false;
    if (activeTab === 'lost') return item.type === 'lost';
    if (activeTab === 'found') return item.type === 'found';
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">My Reported Posts</h1>
          <p className="page-subtitle">
            Manage your active lost and found reports, mark items as claimed, or delete finished posts.
          </p>
        </div>

        <button
          className="btn-report"
          onClick={() => {
            setReportInitialType('lost');
            navigate('/report');
          }}
        >
          <Plus size={18} />
          <span>+ Create New Post</span>
        </button>
      </div>

      <div className="posts-tabs-bar">
        <button
          className={`post-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All My Posts ({myItems.length})
        </button>
        <button
          className={`post-tab-btn ${activeTab === 'lost' ? 'active' : ''}`}
          onClick={() => setActiveTab('lost')}
        >
          Lost Items
        </button>
        <button
          className={`post-tab-btn ${activeTab === 'found' ? 'active' : ''}`}
          onClick={() => setActiveTab('found')}
        >
          Found Items
        </button>
      </div>

      {myItems.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-title">No posts found</h3>
          <p className="empty-desc">You haven't created any item reports yet.</p>
        </div>
      ) : (
        myItems.map((item) => {
          const isClaimed = item.status === 'claimed' || item.status === 'resolved';

          return (
            <div key={item.id || item._id} className="my-post-card">
              <div className="my-post-info">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="my-post-img"
                  />
                ) : (
                  <div
                    className="my-post-img"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    <AlertCircle size={24} />
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className={`status-badge ${item.type}`}
                      style={{ position: 'static' }}
                    >
                      {item.type === 'lost' ? 'Lost' : 'Found'}
                    </span>
                    {isClaimed && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                        }}
                      >
                        CLAIMED
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        fontWeight: 600,
                      }}
                    >
                      {item.category}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--color-text-main)',
                      marginTop: '4px',
                    }}
                  >
                    {item.title}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '13px',
                      color: 'var(--color-text-muted)',
                      marginTop: '4px',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {item.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {item.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="my-post-actions">
                <button
                  className="btn-cancel"
                  onClick={() => onOpenDetails && onOpenDetails(item)}
                >
                  View
                </button>

                {isClaimed ? (
                  <div
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      fontWeight: 700,
                      fontSize: '13px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Check size={14} /> Claimed
                  </div>
                ) : (
                  <button
                    className="btn-resolve"
                    onClick={() => markItemAsClaimed(item.id || item._id)}
                  >
                    <CheckCircle2 size={16} /> Mark Claimed
                  </button>
                )}

                <button
                  className="btn-delete"
                  title="Delete Post"
                  onClick={() => {
                    if (window.confirm(`Delete post "${item.title}"?`)) {
                      deleteItemPost(item.id || item._id);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
