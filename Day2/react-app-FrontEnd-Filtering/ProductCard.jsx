// src/components/ProductCard.jsx
// ─────────────────────────────────────────────
// Functional component — displays ONE product
// Receives product object as a prop
// ─────────────────────────────────────────────

function ProductCard({ product }) {

  const { name, price, rating, image } = product;

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>

      <img
        src={image}
        alt={name}
        style={{ width: '100%', height: '160px', objectFit: 'contain' }}
      />

      <p style={{ fontWeight: '600', fontSize: '15px', margin: 0 }}>
        {name}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontWeight: '700', color: '#C8401A' }}>
          ${price.toFixed(2)}
        </span>
        <span style={{ color: '#D4A843' }}>
          ★ {rating}
        </span>
      </div>

    </div>
  );
}

export default ProductCard;
