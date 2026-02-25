// FILE: src/components/StockCard.tsx
//
// CHANGES vs Module 2:
//   - Added useStockStore import
//   - Added compare toggle button (top-right of card)
//   - Added position: 'relative' to outer div
//   - Props interface (StockCardProps) is UNCHANGED
//   - All existing card content is UNCHANGED

import type { Stock } from '../types/stock.types';
import { useStockStore } from '../stores/useStockStore';

// Props interface is unchanged from Module 2
interface StockCardProps {
  stock:       Stock;
  onSelect?:   (stock: Stock) => void;
  isSelected?: boolean;
}

const StockCard: React.FC<StockCardProps> = ({
  stock,
  onSelect,
  isSelected = false,
}) => {

  // ── NEW: read compare state from the store ──────────────────────────
  // We only subscribe to the two functions we need — no re-render
  // from unrelated state changes (e.g. searchQuery changing).
  const toggleCompare = useStockStore(function (s) { return s.toggleCompare; });
  const isInCompare   = useStockStore(function (s) { return s.isInCompare; });

  // isInCompare is a helper that reads compareList inside the store.
  // Calling it here gives us a plain boolean for this specific stock.
  const inCompare = isInCompare(stock.id);

  // ── Existing logic — unchanged ─────────────────────────────────────
  const isPositive = stock.change >= 0;

  return (
    <div
      onClick={function () { onSelect?.(stock); }}
      style={{
        // position: 'relative' is NEW — required so the compare button
        // can use position: 'absolute' to sit in the top-right corner
        position:        'relative',
        border:          isSelected ? '2px solid #1E40AF' : '1px solid #D1D5DB',
        borderRadius:    8,
        padding:         16,
        cursor:          'pointer',
        backgroundColor: isSelected ? '#DBEAFE' : '#fff',
      }}
    >

      {/* ── NEW: Compare toggle button ─────────────────────────────── */}
      {/* Sits in the top-right corner, absolutely positioned.          */}
      {/* e.stopPropagation() stops the click from bubbling up to the   */}
      {/* outer div's onClick, which would also fire onSelect.          */}
      <button
        onClick={function (e) {
          e.stopPropagation();
          toggleCompare(stock);
        }}
        style={{
          position:     'absolute',
          top:          8,
          right:        8,
          background:   inCompare ? '#1E40AF' : '#E5E7EB',
          color:        inCompare ? '#fff'    : '#374151',
          border:       'none',
          borderRadius: 4,
          padding:      '2px 8px',
          fontSize:     11,
          cursor:       'pointer',
          fontWeight:   inCompare ? 'bold' : 'normal',
        }}
      >
        {inCompare ? '✓ Compare' : '+ Compare'}
      </button>

      {/* ── Existing card content — completely unchanged ───────────── */}
      <h3 style={{ margin: '0 0 8px 0', paddingRight: 80 }}>
        {/* paddingRight: 80 stops the title overlapping the compare button */}
        {stock.symbol} - {stock.name}
      </h3>

      <p style={{ margin: '4px 0' }}>
        Price: ${stock.price.toFixed(2)}
      </p>

      <p style={{ margin: '4px 0', color: isPositive ? 'green' : 'red' }}>
        {isPositive ? '+' : ''}{stock.change.toFixed(2)}
        ({stock.changePct.toFixed(2)}%)
      </p>

      <small style={{ color: '#6B7280' }}>
        Sector: {stock.sector}
      </small>

    </div>
  );
};

export default StockCard;
