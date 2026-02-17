// src/components/SortControls.jsx
// ─────────────────────────────────────────────
// Functional component — ONLY the sort dropdown UI
// No sorting logic here at all
// Receives sortBy + setSortBy as props from App
// ─────────────────────────────────────────────

function SortControls({ sortBy, setSortBy }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>

      <label style={{ fontWeight: '600', fontSize: '14px' }}>
        Sort By:
      </label>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        style={{
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        <option value="default">Default</option>
        <option value="price-low-high">Price: Low to High</option>
        <option value="price-high-low">Price: High to Low</option>
        <option value="name-az">Name: A to Z</option>
        <option value="rating">Rating: High to Low</option>
      </select>

    </div>
  );
}

export default SortControls;
