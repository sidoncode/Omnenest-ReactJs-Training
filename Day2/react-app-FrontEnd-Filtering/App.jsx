// src/App.jsx
// ─────────────────────────────────────────────
// Root component — thin, just wires things together
// Logic  → useSorting hook
// Sort UI → SortControls component
// Cards  → ProductCard component
// ─────────────────────────────────────────────

import { products }   from './data/products';
import useSorting      from './hooks/useSorting';
import SortControls    from './components/SortControls';
import ProductCard     from './components/ProductCard';

function App() {

  // Get sorting logic + state from the custom hook
  const { sortBy, setSortBy, sortedProducts } = useSorting(products);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', fontFamily: 'sans-serif' }}>

      <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '24px' }}>
        E-commerce Product Catalog
      </h1>

      {/* Sort UI — passes state down as props */}
      <SortControls
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Product Grid — maps sortedProducts from the hook */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px',
      }}>
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  );
}

export default App;
