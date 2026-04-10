import React from 'react';
import './FilterBar.css';

const FilterBar = ({ filters, options, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleReset = () => {
    onFilterChange({ type: 'All', year: 'All', genre: 'All' });
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Content Type</label>
        <select 
          className={`filter-select ${filters.type !== 'All' ? 'filter-select-active' : ''}`}
          name="type" 
          value={filters.type} 
          onChange={handleChange}
        >
          <option value="All">All Types</option>
          {options.types?.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Release Year</label>
        <select 
          className={`filter-select ${filters.year !== 'All' ? 'filter-select-active' : ''}`}
          name="year" 
          value={filters.year} 
          onChange={handleChange}
        >
          <option value="All">All Years</option>
          {options.years?.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Genre</label>
        <select 
          className={`filter-select ${filters.genre !== 'All' ? 'filter-select-active' : ''}`}
          name="genre" 
          value={filters.genre} 
          onChange={handleChange}
        >
          <option value="All">All Genres</option>
          {options.genres?.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <button className="filter-reset" onClick={handleReset}>Reset Filters</button>
    </div>
  );
};

export default FilterBar;
