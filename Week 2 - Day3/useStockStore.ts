// FILE: src/stores/useStockStore.ts
//
// PURPOSE:
//   Central store for everything related to stocks in the dashboard.
//   Replaces four separate useState hooks that previously lived in App.tsx:
//     - searchQuery    + setSearchQuery
//     - sectorFilter   + setSectorFilter
//     - selectedStock  + setSelectedStock
//     - filteredStocks (inline computation)
//   Also adds the compare feature (compareList, toggleCompare, clearCompare)
//   which is brand new — it did not exist in App.tsx before.
//
// WHAT COMPONENTS READ FROM THIS STORE:
//   LiveQuotesFeature  → filteredStocks, selectedStock, setSelectedStock,
//                        setSearchQuery, setSectorFilter
//   StockCard          → toggleCompare, isInCompare
//   StockComparePanel  → compareList, clearCompare, toggleCompare
//   TradeFeature       → allStocks, selectedStock
//   PortfolioSummary   → allStocks (to call loadPortfolio)

import { create } from 'zustand';
// create() is the only function you need from Zustand.
// It accepts a setup function and returns a custom React hook.

import type { Stock } from '../types/stock.types';
// "import type" is erased at build time — zero runtime cost.
// TypeScript uses it to type-check every selector and action.

import { stocks as allStocksData } from '../data/stockData';
// The store seeds itself from stockData on startup.
// No prop or argument needed from App.tsx.

// ── 1. INTERFACE ─────────────────────────────────────────────────────────────
//
// The interface defines the complete shape of the store.
// Every piece of STATE and every ACTION must be listed here.
// TypeScript will enforce this contract in every file that imports the store.

interface StockStore {

  // ── State ───────────────────────────────────────────────────────────
  allStocks:      Stock[];       // full master list — never filtered, never changes
  searchQuery:    string;        // the text currently in the SearchBar input
  sectorFilter:   string;        // the currently selected sector dropdown value
                                 // empty string '' means "All Sectors"
  selectedStock:  Stock | null;  // the StockCard the user last clicked
                                 // null means nothing is selected
  filteredStocks: Stock[];       // DERIVED state — allStocks after applying
                                 // searchQuery and sectorFilter
                                 // re-computed every time either filter changes
  compareList:    Stock[];       // stocks the user has toggled for comparison
                                 // shown in StockComparePanel when length >= 2
                                 // max 4 stocks allowed

  // ── Actions ─────────────────────────────────────────────────────────
  // Naming convention: verb + noun  (setX, toggleX, clearX)
  // All actions return void — they update state, not return values.

  setSearchQuery:   (query: string)        => void; // called by SearchBar onChange
  setSectorFilter:  (sector: string)       => void; // called by sector dropdown
  setSelectedStock: (stock: Stock | null)  => void; // called by StockCard onClick
  toggleCompare:    (stock: Stock)         => void; // add if absent, remove if present
  clearCompare:     ()                     => void; // empty the compareList
  isInCompare:      (id: string)           => boolean; // read-only helper for StockCard
}

// ── 2. HELPER FUNCTION ───────────────────────────────────────────────────────
//
// Kept OUTSIDE create() for two reasons:
//   1. Easy to unit test — it is a pure function with no side effects
//   2. Keeps the store setup function clean and readable
//
// Called by both setSearchQuery and setSectorFilter to re-derive filteredStocks.

function computeFiltered(
  stocks: Stock[],
  query:  string,
  sector: string,
): Stock[] {
  return stocks.filter(function (stock) {

    // Normalise the query to lowercase once, reuse for both checks
    const q = query.toLowerCase();

    // A stock matches the search if EITHER its symbol OR its name
    // contains the query string anywhere (not just at the start)
    const matchesSearch =
      stock.symbol.toLowerCase().includes(q) ||
      stock.name.toLowerCase().includes(q);

    // An empty sector string means "All Sectors" — skip the sector check
    // Otherwise the stock's sector must exactly match the selected value
    const matchesSector = sector === '' || stock.sector === sector;

    // Both conditions must be true for the stock to appear
    return matchesSearch && matchesSector;
  });
}

// ── 3. CREATE THE STORE ──────────────────────────────────────────────────────
//
// create<StockStore>() returns a hook: useStockStore
// The function you pass receives:
//   set → updates state (shallow merge by default)
//   get → reads the CURRENT state at the moment it is called
//
// export const makes this importable in any component file.

export const useStockStore = create<StockStore>(function (set, get) {
  return {

    // ── Initial State ──────────────────────────────────────────────────
    allStocks:      allStocksData,   // full 25-stock list from stockData.ts
    searchQuery:    '',              // blank on startup — no search active
    sectorFilter:   '',              // '' = "All Sectors" — no filter active
    selectedStock:  null,            // nothing selected on startup
    filteredStocks: allStocksData,   // starts as the full list (no filters yet)
    compareList:    [],              // starts empty — no stocks in comparison

    // ── setSearchQuery ─────────────────────────────────────────────────
    // Called by SearchBar's onChange handler every time the user types.
    // Steps:
    //   1. Save the new query string to state
    //   2. Read the CURRENT sectorFilter (using get()) — it may have changed
    //      since the last call
    //   3. Re-compute filteredStocks using the NEW query + current sector
    setSearchQuery: function (query) {
      set({ searchQuery: query });
      // get() reads the store's current values at this exact moment.
      // We need sectorFilter to re-run the filter correctly.
      const { allStocks, sectorFilter } = get();
      set({ filteredStocks: computeFiltered(allStocks, query, sectorFilter) });
    },

    // ── setSectorFilter ────────────────────────────────────────────────
    // Called by the sector <select> dropdown in SearchBar.
    // Same two-step pattern as setSearchQuery — save then re-derive.
    setSectorFilter: function (sector) {
      set({ sectorFilter: sector });
      // Read the current searchQuery so the text filter is preserved
      // while we switch sectors
      const { allStocks, searchQuery } = get();
      set({ filteredStocks: computeFiltered(allStocks, searchQuery, sector) });
    },

    // ── setSelectedStock ───────────────────────────────────────────────
    // Called by StockCard's onClick.
    // A simple flat set() — the new value does not depend on old state.
    // Passing null deselects everything (e.g. when a card is clicked again).
    setSelectedStock: function (stock) {
      set({ selectedStock: stock });
    },

    // ── toggleCompare ──────────────────────────────────────────────────
    // Called by the "+ Compare" button on each StockCard.
    // Uses the function form of set() because the new compareList depends
    // on what is already in compareList (prev).
    //
    // Logic:
    //   - If stock is already in compareList → remove it
    //   - If compareList already has 4 stocks → warn and do nothing
    //   - Otherwise → add the stock to the end of compareList
    toggleCompare: function (stock) {
      set(function (prev) {
        const alreadyIn = prev.compareList.some(function (s) {
          return s.id === stock.id;
        });

        if (alreadyIn) {
          // Remove: filter() returns a NEW array without the matching item.
          // Never mutate the existing array directly — Zustand needs a new
          // reference to detect the change.
          return {
            compareList: prev.compareList.filter(function (s) {
              return s.id !== stock.id;
            }),
          };
        }

        if (prev.compareList.length >= 4) {
          // Hard limit — the comparison panel works best with ≤ 4 columns
          alert('You can compare up to 4 stocks at a time.');
          return prev; // return unchanged state — no update
        }

        // Add: spread the old list into a new array, then append the stock
        return {
          compareList: [...prev.compareList, stock],
        };
      });
    },

    // ── clearCompare ───────────────────────────────────────────────────
    // Called by the "Clear All" button in StockComparePanel.
    // Simple flat set() — replaces compareList with an empty array.
    clearCompare: function () {
      set({ compareList: [] });
    },

    // ── isInCompare ────────────────────────────────────────────────────
    // A read-only helper — does NOT update state.
    // Called by StockCard to decide which label to show:
    //   true  → show "✓ Compare" with blue background
    //   false → show "+ Compare" with grey background
    //
    // Uses get() to read the live compareList at call time.
    // This is safe to call inside a Zustand selector because Zustand
    // re-runs the selector whenever state changes.
    isInCompare: function (id) {
      return get().compareList.some(function (s) {
        return s.id === id;
      });
    },

  };
});
