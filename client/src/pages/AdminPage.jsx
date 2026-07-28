import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FileCheck,
  Flag,
  Users,
  Settings,
  Search,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import './AdminPage.css';

export const AdminPage = () => {
  const { claims, updateClaimStatus, items } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClaims = claims.filter(
    (c) =>
      c.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Admin Safety & Verification Portal</h1>
          <p className="page-subtitle">
            System management, claim verification review, lost & found logs audit.
          </p>
        </div>
      </div>

      <div className="admin-layout">
        {/* Left Navigation */}
        <div className="admin-sidebar-nav">
          <span className="admin-sidebar-title">System Management</span>
          <button
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'claims' ? 'active' : ''}`}
            onClick={() => setActiveTab('claims')}
          >
            <FileCheck size={18} />
            Claims ({claims.length})
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <Flag size={18} />
            Reports Flagged
          </button>

          <button className="admin-nav-item">
            <Users size={18} />
            Campus Users
          </button>

          <button className="admin-nav-item">
            <Settings size={18} />
            Settings
          </button>
        </div>

        {/* Right Main Content Area */}
        <div className="admin-main-content">
          {/* Top Metrics Cards */}
          <div className="admin-metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <span>Total Items Active</span>
                <TrendingUp size={16} color="#3bb273" />
              </div>
              <div className="metric-number">{items.length + 1240}</div>
              <span className="metric-sub">+2.4% this week</span>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span>Pending Claims</span>
                <FileCheck size={16} color="var(--color-amber)" />
              </div>
              <div className="metric-number">{claims.length}</div>
              <span className="metric-sub" style={{ color: 'var(--color-amber)' }}>
                Action required
              </span>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span>Items Resolved (30d)</span>
                <CheckCircle size={16} color="var(--color-primary)" />
              </div>
              <div className="metric-number">342</div>
              <span className="metric-sub" style={{ color: 'var(--color-primary)' }}>
                89% owner match rate
              </span>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span>Active Reports</span>
                <AlertCircle size={16} color="var(--color-lost)" />
              </div>
              <div className="metric-number">12</div>
              <span className="metric-sub" style={{ color: 'var(--color-lost)' }}>
                Flagged for review
              </span>
            </div>
          </div>

          {/* Claims Table */}
          <div className="admin-table-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                }}
              >
                Verification & Claim Requests
              </h2>

              <div className="search-box-field" style={{ maxWidth: '280px' }}>
                <Search size={16} className="search-icon-inside" />
                <input
                  type="text"
                  className="search-input-field"
                  placeholder="Filter claims..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '34px' }}
                />
              </div>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item Details</th>
                  <th>Claimant</th>
                  <th>Verification Answer</th>
                  <th>Status</th>
                  <th>Submitted On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {c.itemImage && (
                          <img
                            src={c.itemImage}
                            alt=""
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '4px',
                              objectFit: 'cover',
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 700 }}>{c.itemTitle}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            {c.location}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="claimant-cell">
                        <span className="claimant-name">{c.claimantName}</span>
                        <span className="claimant-id">{c.claimantRole}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '13px', fontStyle: 'italic' }}>
                        "{c.answer}"
                      </div>
                      {c.message && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-text-muted)',
                            marginTop: '2px',
                          }}
                        >
                          Note: {c.message}
                        </div>
                      )}
                    </td>

                    <td>
                      <span
                        className={`status-pill-badge ${
                          c.status === 'Approved'
                            ? 'approved'
                            : c.status === 'Needs Info'
                            ? 'needs-info'
                            : 'under-review'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {c.submittedOn}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn-resolve"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => updateClaimStatus(c.id, 'Approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-cancel"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => updateClaimStatus(c.id, 'Needs Info')}
                        >
                          Info
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
