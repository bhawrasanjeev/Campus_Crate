import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, CheckCircle2, Trash2, Plus, AlertCircle } from 'lucide-react';
import './MyPostsPage.css';

export const MyPostsPage = ({ onOpenDetails }) => {
  const { items, setReportInitialType } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const myItems = items.filter((item) => {
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
            Manage your active lost and found reports, resolve returned items, or update details.
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
          All Posts ({items.length})
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
          <p className="empty-desc">You haven't posted any items yet.</p>
        </div>
      ) : (
        myItems.map((item) => (
          <div key={item.id} className="my-post-card">
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
                onClick={() => onOpenDetails(item)}
              >
                View
              </button>
              <button
                className="btn-resolve"
                onClick={() => alert(`Marked "${item.title}" as returned/resolved!`)}
              >
                <CheckCircle2 size={16} /> Mark Resolved
              </button>
              <button className="btn-delete" title="Delete Post">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
