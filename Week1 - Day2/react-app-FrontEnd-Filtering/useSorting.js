// src/hooks/useSorting.js
// ─────────────────────────────────────────────
// Custom hook — contains ONLY sorting logic
// No JSX, no UI, no styles
// Can be reused in any component that needs sorting
// ─────────────────────────────────────────────

import { useState } from 'react';

function useSorting(products) {

  // sortBy state lives here — not in App, not in UI
  const [sortBy, setSortBy] = useState('default');

  // Pure sorting function — takes products array, returns sorted copy
  const getSortedProducts = (items) => {

    // Always spread to avoid mutating the original array
    const copy = [...items];

    if (sortBy === 'price-low-high') {
      return copy.sort((a, b) => a.price - b.price);
    }

    if (sortBy === 'price-high-low') {
      return copy.sort((a, b) => b.price - a.price);
    }

    if (sortBy === 'name-az') {
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === 'rating') {
      return copy.sort((a, b) => b.rating - a.rating);
    }

    return copy; // default — original order
  };

  // Run sort and expose the result
  const sortedProducts = getSortedProducts(products);

  // Return everything App needs
  return {
    sortBy,          // current sort value  — for the dropdown
    setSortBy,       // update sort value   — for the dropdown onChange
    sortedProducts,  // sorted array        — for the product grid
  };
}

export default useSorting;
