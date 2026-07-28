import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
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
  ShieldAlert,
} from 'lucide-react';
import './AdminPage.css';

// -------------------------------------------------------------
// Sub-component: Dashboard View
// -------------------------------------------------------------
const AdminDashboard = ({ items, claims }) => {
  return (
    <div>
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
          <div className="metric-number">3</div>
          <span className="metric-sub" style={{ color: 'var(--color-lost)' }}>
            Flagged for review
          </span>
        </div>
      </div>

      <div className="admin-table-card" style={{ marginTop: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px' }}>
          Recent Activity & System Alerts
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--color-bg)' }}>
            <ShieldAlert size={18} color="var(--color-lost)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>New safety report submitted</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>An item "Keys with red tag" was flagged by Student S1029328.</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--color-bg)' }}>
            <FileCheck size={18} color="var(--color-amber)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Pending claim request verification</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Maya Singh submitted verification answer "White" for "Blue Hydro Flask".</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--color-bg)' }}>
            <CheckCircle size={18} color="var(--color-primary)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Claim successfully resolved</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Item "Silver MacBook Air" has been returned to Lina Torres.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Sub-component: Claims View
// -------------------------------------------------------------
const AdminClaims = ({ filteredClaims, searchQuery, setSearchQuery, updateClaimStatus }) => {
  return (
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

      <div style={{ overflowX: 'auto' }}>
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
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                  No pending verification requests found.
                </td>
              </tr>
            ) : (
              filteredClaims.map((c) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Sub-component: Reports View
// -------------------------------------------------------------
const AdminReports = () => {
  const [reports, setReports] = useState([
    { id: 'rep_1', item: 'Spotted Wallet', reporter: 'Ryan Reynolds', reason: 'Abusive listing description', date: 'Today', status: 'Pending' },
    { id: 'rep_2', item: 'Keys near Lab', reporter: 'Emma Watson', reason: 'Spam/duplicate post', date: 'Yesterday', status: 'Resolved' },
    { id: 'rep_3', item: 'Nike Sneakers', reporter: 'Robert Downey', reason: 'Suspicious profile picture/scam risk', date: '2 days ago', status: 'Dismissed' },
  ]);

  const handleResolve = (id, newStatus) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div className="admin-table-card">
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '16px' }}>
        Safety & Abuse Reports Flagged
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Flagged Item</th>
              <th>Reported By</th>
              <th>Reason for Flag</th>
              <th>Report Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.item}</strong></td>
                <td>{r.reporter}</td>
                <td>{r.reason}</td>
                <td>{r.date}</td>
                <td>
                  <span className={`status-pill-badge ${r.status.toLowerCase()}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  {r.status === 'Pending' ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-resolve"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => handleResolve(r.id, 'Resolved')}
                      >
                        Resolve
                      </button>
                      <button
                        className="btn-cancel"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => handleResolve(r.id, 'Dismissed')}
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No action needed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Sub-component: Users View
// -------------------------------------------------------------
const AdminUsers = () => {
  const [users, setUsers] = useState([
    { id: 'u_1', name: 'Aarav Patel', email: 'aarav.patel@campus.edu', role: 'Student', department: 'Computer Science', status: 'Active' },
    { id: 'u_2', name: 'Lina Torres', email: 'lina.torres@campus.edu', role: 'Student', department: 'Electrical Engineering', status: 'Active' },
    { id: 'u_3', name: 'Maya Singh', email: 'maya.singh@campus.edu', role: 'Student', department: 'Chemistry', status: 'Active' },
    { id: 'u_4', name: 'Fake Spammer', email: 'spammer@scam.org', role: 'Student', department: 'Unknown', status: 'Suspended' },
  ]);

  const handleToggleBlock = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return u;
    }));
  };

  return (
    <div className="admin-table-card">
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '16px' }}>
        Registered Campus Directory
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email Address</th>
              <th>System Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.department}</td>
                <td>
                  <span className={`status-pill-badge ${u.status === 'Active' ? 'approved' : 'needs-info'}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <button
                    className={u.status === 'Active' ? 'btn-cancel' : 'btn-resolve'}
                    style={{ padding: '4px 8px', fontSize: '11px', minWidth: '80px' }}
                    onClick={() => handleToggleBlock(u.id)}
                  >
                    {u.status === 'Active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Sub-component: Settings View
// -------------------------------------------------------------
const AdminSettings = () => {
  return (
    <div className="admin-table-card">
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '16px' }}>
        Abuse & Policy Settings
      </h2>
      <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Verification Strictness Level</label>
          <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-surface)', color: 'var(--color-text-main)' }}>
            <option>Strict (Item details require photo + text match answer)</option>
            <option>Standard (Verification question response review only)</option>
            <option>Relaxed (Direct contact link enabled for verified emails)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Auto-Match Threshold</label>
          <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-surface)', color: 'var(--color-text-main)' }}>
            <option>High (Must match 3+ tags and location category)</option>
            <option>Medium (Match 2+ tags and location)</option>
            <option>Low (Match category name only)</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" id="require-id" defaultChecked style={{ width: '18px', height: '18px' }} />
          <label htmlFor="require-id" style={{ fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Require campus Student ID for claim submission</label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" id="auto-moderation" defaultChecked style={{ width: '18px', height: '18px' }} />
          <label htmlFor="auto-moderation" style={{ fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Enable AI description spam filtering</label>
        </div>
        <button className="btn-resolve" style={{ padding: '10px 16px', alignSelf: 'flex-start', marginTop: '10px' }}>
          Save Configuration
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------
export const AdminPage = () => {
  const { claims, updateClaimStatus, items } = useApp();
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
          
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/claims"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <FileCheck size={18} />
            Claims ({claims.length})
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <Flag size={18} />
            Reports Flagged
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <Users size={18} />
            Campus Users
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <Settings size={18} />
            Settings
          </NavLink>
        </div>

        {/* Right Main Content Area */}
        <div className="admin-main-content">
          <Routes>
            {/* Redirect /admin to /admin/dashboard */}
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            
            <Route
              path="dashboard"
              element={<AdminDashboard items={items} claims={claims} />}
            />
            <Route
              path="claims"
              element={
                <AdminClaims
                  filteredClaims={filteredClaims}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  updateClaimStatus={updateClaimStatus}
                />
              }
            />
            <Route
              path="reports"
              element={<AdminReports />}
            />
            <Route
              path="users"
              element={<AdminUsers />}
            />
            <Route
              path="settings"
              element={<AdminSettings />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};
