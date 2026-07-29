import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Package,
  Flag,
  Users,
  Settings,
  Search,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  BellRing,
  RefreshCw,
} from 'lucide-react';
import './AdminPage.css';

export const AdminPage = () => {
  const { items, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock list of campus users for management tab
  const [usersList, setUsersList] = useState([
    { id: 'usr_1', name: 'Sanjeev Bhawra', email: 'sanjeev@college.edu', role: 'admin', dept: 'Computer Science', status: 'Active' },
    { id: 'usr_2', name: 'Ananya Sharma', email: 'ananya@college.edu', role: 'student', dept: 'Electrical Eng.', status: 'Active' },
    { id: 'usr_3', name: 'Rohan Verma', email: 'rohan@college.edu', role: 'student', dept: 'Mechanical Eng.', status: 'Active' },
    { id: 'usr_4', name: 'Priya Patel', email: 'priya@college.edu', role: 'student', dept: 'Biotechnology', status: 'Blocked' },
  ]);

  // Mock list of safety reports
  const [reportsList, setReportsList] = useState([
    { id: 'rep_1', itemTitle: 'iPhone 13 Pro', reporter: 'Priya Patel', reason: 'Misleading description', date: 'Yesterday', status: 'Pending' },
    { id: 'rep_2', itemTitle: 'Car Keys with Remote', reporter: 'Rohan Verma', reason: 'Duplicate listing', date: '3 days ago', status: 'Resolved' },
  ]);

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(itemSearchQuery.toLowerCase());

    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const toggleBlockUser = (userId) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' }
          : u
      )
    );
  };

  const toggleUserRole = (userId) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role: u.role === 'admin' ? 'student' : 'admin' }
          : u
      )
    );
  };

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="admin-header-banner">
        <div>
          <h1 className="admin-header-title">Campus Safety & Admin Portal</h1>
          <p className="admin-header-subtitle">
            System administration, item listings moderation, user access controls & system analytics.
          </p>
        </div>
        <div className="admin-status-badge">
          <ShieldCheck size={16} color="#4ade80" />
          <span>Logged in as Admin: {currentUser?.name || 'Administrator'}</span>
        </div>
      </div>

      <div className="admin-layout-container">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            <Package size={18} />
            <span>Manage Items</span>
            <span className="admin-badge-count">{items.length}</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <Flag size={18} />
            <span>Flagged Reports</span>
            <span className="admin-badge-count">{reportsList.length}</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Campus Users</span>
            <span className="admin-badge-count">{usersList.length}</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>System Settings</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1 }}>
          {/* Top Metrics Cards */}
          <div className="admin-metrics-grid">
            <div className="admin-metric-card">
              <div className="metric-top">
                <span>Total Active Items</span>
                <Package size={16} color="var(--color-primary)" />
              </div>
              <div className="metric-val">{items.length}</div>
              <div className="metric-trend" style={{ color: '#10b981' }}>
                <TrendingUp size={14} /> +12% this week
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="metric-top">
                <span>Resolved & Returned</span>
                <CheckCircle size={16} color="#10b981" />
              </div>
              <div className="metric-val">342</div>
              <div className="metric-trend" style={{ color: '#10b981' }}>
                91% match success rate
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="metric-top">
                <span>Flagged Reports</span>
                <AlertCircle size={16} color="#ef4444" />
              </div>
              <div className="metric-val">{reportsList.length}</div>
              <div className="metric-trend" style={{ color: '#ef4444' }}>
                Action required
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="metric-top">
                <span>Registered Students</span>
                <Users size={16} color="#f59e0b" />
              </div>
              <div className="metric-val">{usersList.length + 1420}</div>
              <div className="metric-trend" style={{ color: 'var(--color-text-muted)' }}>
                Active campus network
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="admin-panel-card">
              <div className="panel-header">
                <h2 className="panel-title">System Activity Overview</h2>
                <button
                  type="button"
                  className="btn-admin-action"
                  onClick={() => alert('Refreshed real-time analytics!')}
                >
                  <RefreshCw size={14} /> Refresh Data
                </button>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-surface-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>Auto-Matching Engine Status</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Scanning lost and found descriptions for text similarity.
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#ecfdf5', color: '#10b981', fontWeight: 700, fontSize: '12px' }}>
                    ONLINE
                  </span>
                </div>

                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-surface-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>Direct Messaging System</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Real-time WebSockets enabled for finder-owner chat.
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#ecfdf5', color: '#10b981', fontWeight: 700, fontSize: '12px' }}>
                    CONNECTED
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE ITEMS */}
          {activeTab === 'items' && (
            <div className="admin-panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Item Directory Moderation</h2>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="search-container" style={{ position: 'relative', width: '220px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Filter items..."
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 12px 6px 30px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      fontSize: '13px',
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="lost">Lost Only</option>
                    <option value="found">Found Only</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Contact Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700 }}>{item.title}</td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              backgroundColor: item.type === 'lost' ? '#fef2f2' : '#ecfdf5',
                              color: item.type === 'lost' ? '#ef4444' : '#10b981',
                            }}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td>{item.category}</td>
                        <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{item.location}</td>
                        <td style={{ fontSize: '13px' }}>{item.contactPhone || '+1 (555) 234-5678'}</td>
                        <td>
                          <div className="action-btn-group">
                            <button
                              type="button"
                              className="btn-admin-action"
                              onClick={() => alert(`Item details: ${item.title}`)}
                            >
                              <Eye size={12} /> View
                            </button>
                            <button
                              type="button"
                              className="btn-admin-action danger"
                              onClick={() => alert(`Removed item: ${item.title}`)}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FLAGGED REPORTS */}
          {activeTab === 'reports' && (
            <div className="admin-panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Safety & Flagged Content Review</h2>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reported Item</th>
                      <th>Reporter</th>
                      <th>Reason Flagged</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsList.map((rep) => (
                      <tr key={rep.id}>
                        <td style={{ fontWeight: 700 }}>{rep.itemTitle}</td>
                        <td>{rep.reporter}</td>
                        <td style={{ color: '#ef4444', fontWeight: 600 }}>{rep.reason}</td>
                        <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{rep.date}</td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: rep.status === 'Pending' ? '#fef3c7' : '#ecfdf5',
                              color: rep.status === 'Pending' ? '#d97706' : '#10b981',
                            }}
                          >
                            {rep.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-btn-group">
                            <button
                              type="button"
                              className="btn-admin-action success"
                              onClick={() => alert(`Dismissed report for ${rep.itemTitle}`)}
                            >
                              Dismiss
                            </button>
                            <button
                              type="button"
                              className="btn-admin-action danger"
                              onClick={() => alert(`Taken down post for ${rep.itemTitle}`)}
                            >
                              Take Down
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CAMPUS USERS */}
          {activeTab === 'users' && (
            <div className="admin-panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Campus User Accounts Management</h2>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr.id}>
                        <td style={{ fontWeight: 700 }}>{usr.name}</td>
                        <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{usr.email}</td>
                        <td>{usr.dept}</td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: usr.role === 'admin' ? '#fef2f2' : 'var(--color-primary-bg)',
                              color: usr.role === 'admin' ? '#ef4444' : 'var(--color-primary)',
                            }}
                          >
                            {usr.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: usr.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                              color: usr.status === 'Active' ? '#10b981' : '#ef4444',
                            }}
                          >
                            {usr.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-btn-group">
                            <button
                              type="button"
                              className="btn-admin-action"
                              onClick={() => toggleUserRole(usr.id)}
                            >
                              <UserCheck size={12} /> Toggle Role
                            </button>
                            <button
                              type="button"
                              className={`btn-admin-action ${usr.status === 'Active' ? 'danger' : 'success'}`}
                              onClick={() => toggleBlockUser(usr.id)}
                            >
                              <UserX size={12} /> {usr.status === 'Active' ? 'Block' : 'Unblock'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="admin-panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Platform Configuration</h2>
              </div>

              <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                    Campus Institution Name
                  </label>
                  <input
                    type="text"
                    defaultValue="University Campus"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                    Emergency Broadcast Banner
                  </label>
                  <input
                    type="text"
                    placeholder="Enter broadcast alert to display to all students..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => alert('Settings saved successfully!')}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#fff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    width: 'fit-content',
                  }}
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
