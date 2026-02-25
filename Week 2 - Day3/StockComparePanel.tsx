// FILE: src/components/StockComparePanel.tsx
//
// PURPOSE: Fixed bottom panel that shows a side-by-side metric comparison
//          for every stock in useStockStore.compareList.
//
// BEHAVIOUR:
//   - Renders NOTHING when compareList has fewer than 2 stocks
//   - Auto-appears when the user adds a 2nd stock via the StockCard toggle
//   - Highlights the highest numeric value in each metric row (green)
//   - Each column header has an ✕ button to remove that stock individually
//   - "Clear All" button empties the entire compareList

import React from 'react';
import { useStockStore } from '../stores/useStockStore';
import type { Stock }    from '../types/stock.types';

// ── Metric row definitions ──────────────────────────────────────────────────
// Each entry declares:
//   label   — the row header shown on the left
//   key     — which field on the Stock object to read
//   format  — optional function to convert the raw number to a display string
//
// keyof Stock ensures TypeScript will error if we ever typo a field name.
const COMPARE_ROWS: {
  label:   string;
  key:     keyof Stock;
  format?: (v: unknown) => string;
}[] = [
  {
    label:  'Price',
    key:    'price',
    format: function (v) { return '$' + Number(v).toFixed(2); },
  },
  {
    label:  'Change',
    key:    'change',
    format: function (v) { return '$' + Number(v).toFixed(2); },
  },
  {
    label:  'Change %',
    key:    'changePct',
    format: function (v) { return Number(v).toFixed(2) + '%'; },
  },
  {
    label:  'Volume',
    key:    'volume',
    format: function (v) { return Number(v).toLocaleString(); },
  },
  {
    label:  'Market Cap',
    key:    'marketCap',
    format: function (v) { return '$' + (Number(v) / 1_000_000_000).toFixed(1) + 'B'; },
  },
  {
    // Sector is a string — no format function needed, no "best" highlight
    label: 'Sector',
    key:   'sector',
  },
];

// ── Component ───────────────────────────────────────────────────────────────
const StockComparePanel: React.FC = () => {

  // Subscribe to only the three values this component needs.
  // Each selector is independent — re-renders only when its value changes.
  const compareList   = useStockStore(function (s) { return s.compareList; });
  const clearCompare  = useStockStore(function (s) { return s.clearCompare; });
  const toggleCompare = useStockStore(function (s) { return s.toggleCompare; });

  // Guard: show nothing until 2 or more stocks have been toggled
  if (compareList.length < 2) return null;

  return (
    <div
      style={{
        // Fixed positioning pins this to the bottom of the browser window.
        // It stays visible no matter how far the user scrolls.
        position:    'fixed',
        bottom:      0,
        left:        0,
        right:       0,
        background:  '#fff',
        borderTop:   '2px solid #1E40AF',
        padding:     '16px 24px',
        // zIndex: 1000 ensures the panel renders on top of all other content
        zIndex:      1000,
        boxShadow:   '0 -4px 12px rgba(0,0,0,0.12)',
        // maxHeight + overflowY allows the panel to scroll internally
        // when many stocks or many metrics are shown
        maxHeight:   '40vh',
        overflowY:   'auto',
      }}
    >

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginBottom:   12,
        }}
      >
        <h3 style={{ margin: 0, color: '#1E3A8A', fontSize: 16 }}>
          Comparing {compareList.length} Stock{compareList.length > 1 ? 's' : ''}
        </h3>

        <button
          onClick={clearCompare}
          style={{
            background:   '#FEE2E2',
            color:        '#991B1B',
            border:       'none',
            borderRadius: 4,
            padding:      '6px 14px',
            cursor:       'pointer',
            fontSize:     13,
            fontWeight:   'bold',
          }}
        >
          Clear All
        </button>
      </div>

      {/* ── Comparison table ────────────────────────────────────────── */}
      <table
        style={{
          width:           '100%',
          borderCollapse:  'collapse',
          fontSize:        13,
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#1E3A8A', color: '#fff' }}>

            {/* First column header: empty — this column shows metric names */}
            <th
              style={{
                padding:   '8px 12px',
                textAlign: 'left',
                width:     130,
                fontWeight: 'bold',
              }}
            >
              Metric
            </th>

            {/* One column per stock in compareList */}
            {compareList.map(function (stock) {
              return (
                <th
                  key={stock.id}
                  style={{
                    padding:   '8px 12px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    minWidth:  110,
                  }}
                >
                  {/* Symbol */}
                  <span>{stock.symbol}</span>

                  {/* ✕ removes only this one stock from the comparison */}
                  <button
                    onClick={function () { toggleCompare(stock); }}
                    style={{
                      marginLeft:  8,
                      background:  'rgba(255,255,255,0.15)',
                      border:      '1px solid rgba(255,255,255,0.4)',
                      color:       '#fff',
                      borderRadius: 3,
                      padding:     '1px 5px',
                      cursor:      'pointer',
                      fontSize:    10,
                      lineHeight:  '14px',
                    }}
                  >
                    ✕
                  </button>

                  {/* Show the full company name in smaller text below */}
                  <div style={{ fontSize: 10, fontWeight: 'normal', opacity: 0.8, marginTop: 2 }}>
                    {stock.name}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {COMPARE_ROWS.map(function (row, rowIndex) {
            return (
              <tr
                key={row.key}
                style={{
                  // Zebra striping for readability
                  backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#F8FAFC',
                }}
              >
                {/* Metric label — left column */}
                <td
                  style={{
                    padding:    '7px 12px',
                    fontWeight: 'bold',
                    color:      '#374151',
                    borderRight: '1px solid #E5E7EB',
                  }}
                >
                  {row.label}
                </td>

                {/* One data cell per stock */}
                {compareList.map(function (stock) {
                  const rawValue    = stock[row.key];
                  const displayText = row.format
                    ? row.format(rawValue)
                    : String(rawValue);

                  // ── Best-value highlight logic ─────────────────────
                  // Only numeric rows get a "best" highlight.
                  // We compare the raw numbers across all stocks in the
                  // list, then highlight whichever cell has the maximum.
                  const isNumeric = typeof rawValue === 'number';
                  const allNums   = isNumeric
                    ? compareList.map(function (s) { return s[row.key] as number; })
                    : [];
                  const maxVal    = isNumeric ? Math.max(...allNums) : null;
                  const isBest    = isNumeric && rawValue === maxVal;

                  return (
                    <td
                      key={stock.id}
                      style={{
                        padding:         '7px 12px',
                        textAlign:       'center',
                        color:           isBest ? '#166534' : '#111827',
                        fontWeight:      isBest ? 'bold'    : 'normal',
                        backgroundColor: isBest ? '#D1FAE5' : 'transparent',
                        borderRight:     '1px solid #F3F4F6',
                        // Smooth background transition when stocks are added/removed
                        transition:      'background-color 0.2s ease',
                      }}
                    >
                      {/* Show a green arrow next to the best numeric value */}
                      {isBest && <span style={{ marginRight: 4 }}>▲</span>}
                      {displayText}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  );
};

export default StockComparePanel;
