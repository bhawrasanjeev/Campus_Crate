import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ItemCard } from '../components/ItemCard';
import { CATEGORIES } from '../data/mockData';
import { Search, Plus, PackageX, ChevronRight } from 'lucide-react';
import './LostItemsPage.css';

export const LostItemsPage = ({ onOpenDetails }) => {
  const navigate = useNavigate();
  const { items, setReportInitialType, globalSearchQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [timeFilter, setTimeFilter] = useState('Any Time');
  const [sortBy, setSortBy] = useState('Newest');
  const [localSearch, setLocalSearch] = useState('');

  const lostItems = items.filter((item) => item.type === 'lost');

  const filteredItems = lostItems.filter((item) => {
    const query = (localSearch || globalSearchQuery).toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === 'All Categories' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleReportLostClick = () => {
    setReportInitialType('lost');
    navigate('/report');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">
            Lost Items{' '}
            <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
              — Showing {filteredItems.length} active listings
            </span>
          </h1>
          <p className="page-subtitle">
            Browse reported missing items on your college campus or submit a lost report.
          </p>
        </div>

        <button className="btn-report" onClick={handleReportLostClick}>
          <Plus size={18} />
          <span>+ I Lost Something</span>
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box-field">
          <Search size={18} className="search-icon-inside" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search lost items by keyword, location..."
            value={localSearch || globalSearchQuery}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        <select
          className="select-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          className="select-filter"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="Any Time">Any Time</option>
          <option value="Today">Today</option>
          <option value="Past Week">Past Week</option>
          <option value="Past Month">Past Month</option>
        </select>

        <select
          className="select-filter"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="Newest">Sort: Newest</option>
          <option value="Oldest">Sort: Oldest</option>
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <PackageX size={56} color="var(--color-text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 className="empty-title" style={{ fontSize: '18px', fontWeight: 700 }}>No lost items found</h3>
          <p className="empty-desc" style={{ color: 'var(--color-text-muted)', marginTop: '6px' }}>
            There are currently no lost item reports matching your filters. Be the first to report a lost item!
          </p>
          <button
            type="button"
            onClick={handleReportLostClick}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + Report Lost Item
          </button>
        </div>
      ) : (
        <>
          <div className="items-grid">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onSelect={onOpenDetails}
              />
            ))}
          </div>

          <div className="pagination">
            <button className="page-btn active">1</button>
            <button className="page-btn" title="Next Page">
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
