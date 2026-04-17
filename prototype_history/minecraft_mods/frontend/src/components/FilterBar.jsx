import React from 'react';

export default function FilterBar({
  searchTerm,
  onSearchChange,
  resolvedFilter,
  onResolvedFilterChange,
}) {
  return (
    <div className="filter-bar">
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search by mod name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            className="search-clear"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${resolvedFilter === null ? 'active' : ''}`}
          onClick={() => onResolvedFilterChange(null)}
        >
          All
        </button>
        <button
          className={`filter-btn filter-btn-unresolved ${resolvedFilter === false ? 'active' : ''}`}
          onClick={() => onResolvedFilterChange(false)}
        >
          ❌ Unresolved
        </button>
        <button
          className={`filter-btn filter-btn-resolved ${resolvedFilter === true ? 'active' : ''}`}
          onClick={() => onResolvedFilterChange(true)}
        >
          ✅ Resolved
        </button>
      </div>
    </div>
  );
}