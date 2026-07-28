import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ItemCard } from '../components/ItemCard';
import { CATEGORIES } from '../data/mockData';
import { Plus, PackageX, Sparkles, ChevronRight } from 'lucide-react';
import './FoundItemsPage.css';

export const FoundItemsPage = ({ onOpenClaim, onOpenDetails }) => {
  const { items, setReportInitialType, globalSearchQuery } = useApp();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const foundItems = items.filter((item) => item.type === 'found');

  const filteredItems = foundItems.filter((item) => {
    const query = globalSearchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === 'All Categories' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleReportFoundClick = () => {
    setReportInitialType('found');
    navigate('/report');
  };

  return (
    <div className="page-container">
      <div className="banner-match">
        <Sparkles size={18} color="var(--color-amber-dark)" />
        <span>
          <strong>Automated Match System:</strong> When you submit a found item, we automatically cross-reference existing lost reports and notify matching owners!
        </span>
      </div>

      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Found Items</h1>
          <p className="page-subtitle">
            Browse items recovered across your college campus by students, staff, and safety officials.
          </p>
        </div>

        <button className="btn-report" onClick={handleReportFoundClick}>
          <Plus size={18} />
          <span>+ I Found Something</span>
        </button>
      </div>

      <div className="category-pills-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`pill-filter-btn ${
              selectedCategory === cat ? 'active' : ''
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <PackageX size={48} color="var(--color-text-muted)" style={{ margin: '0 auto' }} />
          <h3 className="empty-title">No found items in this category</h3>
          <p className="empty-desc">
            Try selecting another category or report a new found item.
          </p>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onSelect={onOpenDetails}
              onClaim={onOpenClaim}
            />
          ))}
        </div>
      )}

      <div className="pagination">
        <button className="page-btn active">1</button>
        <button className="page-btn">2</button>
        <button className="page-btn" title="Next Page">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
