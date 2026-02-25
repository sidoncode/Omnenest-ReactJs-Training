// FILE: src/App.tsx  — Module 3: Zustand State Management
//
// ── WHAT CHANGED vs Module 2 ────────────────────────────────────────────────
//
//   REMOVED:
//     - useState import (no local state at all in this file now)
//     - const [selectedStock,  setSelectedStock]  = useState(...)
//     - const [searchQuery,    setSearchQuery]    = useState(...)
//     - const [sectorFilter,   setSectorFilter]   = useState(...)
//     - const [tradeHistory,   setTradeHistory]   = useState(...)
//     - filteredStocks computation (moved into useStockStore)
//     - handleNewTrade function (moved into useTradeStore as addTrade)
//     - All props from every feature component
//     - stocks / trades / positions / holdings imports from stockData
//       (each store seeds itself from stockData directly)
//
//   ADDED:
//     - import StockComparePanel (eager — NOT lazy, must render immediately)
//     - <StockComparePanel /> at the bottom of the JSX
//     - paddingBottom: 80 on the outer div (prevents content sitting
//       behind the fixed compare panel when it is visible)
//
// ── WHAT DID NOT CHANGE ──────────────────────────────────────────────────────
//
//   - lazy() imports for all 5 feature components
//   - SuspenseBoundary wrappers around every feature
//   - Skeleton fallbacks (CardGridSkeleton, TableSkeleton, FormSkeleton)
//   - JSX structure and page-level styling
//
// ── HOW STATE IS MANAGED NOW ────────────────────────────────────────────────
//
//   App.tsx renders features only. Each feature reads directly from its store:
//     LiveQuotesFeature  → useStockStore
//     PortfolioFeature   → usePortfolioStore  (reads allStocks from useStockStore)
//     PositionsFeature   → usePositionsStore
//     HoldingsFeature    → (unchanged — still receives holdings prop)
//     TradeFeature       → useTradeStore  +  useStockStore (for selectedStock)
//     StockComparePanel  → useStockStore  (compareList)

import { lazy } from 'react';
// useState is completely gone — this file holds zero local state

// ── Boundary and skeleton imports (unchanged) ────────────────────────────────
import SuspenseBoundary from './boundaries/SuspenseBoundary';
import TableSkeleton    from './skeletons/TableSkeleton';
import CardGridSkeleton from './skeletons/CardGridSkeleton';
import FormSkeleton     from './skeletons/FormSkeleton';

// ── NEW: StockComparePanel ────────────────────────────────────────────────────
// Imported eagerly (not lazy) because:
//   1. It is a small component — no meaningful bundle-size reason to lazy-load it
//   2. It must be ready to render the moment the user adds a second stock to
//      compareList — a Suspense boundary would show a flash of loading state
import StockComparePanel from './components/StockComparePanel';

// ── Lazy feature imports (unchanged from Module 2) ───────────────────────────
// Each feature is code-split into its own chunk.
// React downloads the chunk on first render, then caches it.
const LiveQuotesFeature  = lazy(() => import('./features/quotes/LiveQuotesFeature'));
const PortfolioFeature   = lazy(() => import('./features/portfolio/PortfolioFeature'));
const PositionsFeature   = lazy(() => import('./features/positions/PositionFeature'));
const HoldingsFeature    = lazy(() => import('./features/holdings/HoldingsFeature'));
const TradeFeature       = lazy(() => import('./features/trades/TradeFeature'));

function App() {

  // ── ZERO STATE ──────────────────────────────────────────────────────────────
  // App.tsx is now a pure layout component.
  // All state (stocks, trades, portfolio, positions, compare) lives in stores.
  // No props are drilled to any feature — each feature reads what it needs.

  return (
    <div
      style={{
        maxWidth:    1100,
        margin:      '0 auto',
        padding:     24,
        // paddingBottom: 80 reserves space at the bottom of the page.
        // When StockComparePanel is visible (position: fixed, bottom: 0),
        // the last feature on the page would otherwise be hidden behind it.
        paddingBottom: 80,
        fontFamily:  'Arial, sans-serif',
      }}
    >
      <h1 style={{ color: '#1E3A8A' }}>Stock Market Dashboard</h1>

      {/* ── FEATURE 1: Live Quotes ──────────────────────────────────────── */}
      {/* Uses TWO skeleton types: card grid + table                         */}
      {/* LiveQuotesFeature reads: filteredStocks, selectedStock, actions    */}
      {/* from useStockStore — zero props needed                             */}
      <SuspenseBoundary
        fallback={
          <>
            <CardGridSkeleton count={3} />
            <TableSkeleton rows={5} cols={6} title="Live Quotes" />
          </>
        }
      >
        <LiveQuotesFeature />
      </SuspenseBoundary>

      {/* ── FEATURE 2: Portfolio Summary ────────────────────────────────── */}
      {/* PortfolioFeature reads allStocks from useStockStore internally,    */}
      {/* then calls usePortfolioStore.loadPortfolio() — zero props needed   */}
      <SuspenseBoundary
        fallback={<TableSkeleton rows={3} cols={3} title="Portfolio Summary" />}
      >
        <PortfolioFeature />
      </SuspenseBoundary>

      {/* ── FEATURE 3: Positions ────────────────────────────────────────── */}
      {/* PositionFeature reads positions from usePositionsStore.            */}
      {/* Each row now has a Remove button wired to removePosition(id).      */}
      <SuspenseBoundary
        fallback={<TableSkeleton rows={5} cols={6} title="Positions" />}
      >
        <PositionsFeature />
      </SuspenseBoundary>

      {/* ── FEATURE 4: Holdings ─────────────────────────────────────────── */}
      {/* HoldingsFeature is not yet migrated to a store.                    */}
      {/* It still receives its data internally from stockData (or a store   */}
      {/* you may have added). The component renders with zero props here.   */}
      <SuspenseBoundary
        fallback={<TableSkeleton rows={5} cols={5} title="Holdings" />}
      >
        <HoldingsFeature />
      </SuspenseBoundary>

      {/* ── FEATURE 5: Trade History + Trade Form ───────────────────────── */}
      {/* TradeFeature reads tradeHistory and addTrade from useTradeStore,   */}
      {/* and selectedStock + allStocks from useStockStore — zero props      */}
      <SuspenseBoundary
        fallback={
          <>
            <TableSkeleton rows={3} cols={5} title="Trade History" />
            <FormSkeleton />
          </>
        }
      >
        <TradeFeature />
      </SuspenseBoundary>

      {/* ── Stock Compare Panel ─────────────────────────────────────────── */}
      {/* Fixed to the bottom of the screen.                                 */}
      {/* Renders nothing (returns null) when compareList.length < 2.        */}
      {/* Auto-appears the moment the user toggles a second StockCard.       */}
      {/* No SuspenseBoundary needed — this is an eager (non-lazy) import.   */}
      <StockComparePanel />

    </div>
  );
}

export default App;
