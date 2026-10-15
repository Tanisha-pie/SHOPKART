import React from "react";

const CATEGORIES = ["All Categories", "Electronics", "Fashion", "Books", "Home"];

const SearchBar = ({ search, setSearch, category, setCategory, sort, setSort }) => {
  return (
    <div className="search-filter-wrapper">
      {/* Search Input */}
      <div className="search-input-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search products by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="clear-search-btn"
            onClick={() => setSearch("")}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="filter-controls">
        {/* Category Dropdown */}
        <div className="filter-group">
          <label htmlFor="category-select" className="filter-label">
            Category:
          </label>
          <select
            id="category-select"
            className="filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown (Bonus Challenge) */}
        <div className="filter-group">
          <label htmlFor="sort-select" className="filter-label">
            Sort by:
          </label>
          <select
            id="sort-select"
            className="filter-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Featured / Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
