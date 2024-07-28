import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [cityState, setCityState] = useState('');
  const [radius, setRadius] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(cityState, radius);
  };

  return (
    <form id="search-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={cityState}
        onChange={(e) => setCityState(e.target.value)}
        placeholder="Enter City and State (e.g., Syracuse, NY)"
        required
      />
      <select value={radius} onChange={(e) => setRadius(e.target.value)} required>
        <option value="" disabled>Select distance</option>
        <option value="5">5 miles</option>
        <option value="10">10 miles</option>
        <option value="20">20 miles</option>
        <option value="50">50 miles</option>
      </select>
      <button type="submit">Search</button>
      <button>Sign Up</button>
    </form>
  );
};

export default SearchBar;