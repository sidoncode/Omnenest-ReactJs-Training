## Zustand


# Zustand Global State Management — Problem Statements

**Project:** Stock Market Dashboard · React + TypeScript  
**Module:** 3 — Global State with Zustand  
**Prerequisite:** `npm install zustand`


---

## Part 1 — Stock Comparison Feature

**Files to create/update:** `src/components/StockComparePanel.tsx`, `src/components/StockCard.tsx`, `src/App.tsx`

The `compareList`, `toggleCompare`, and `clearCompare` fields were already added to `useStockStore` in Part 1. They are not yet wired to any UI.

**Your task:**

- Add a `+ Compare` toggle button to each `StockCard` — clicking it should add the stock to `compareList`; clicking again should remove it. The button click must **not** trigger the card's existing `onSelect` behaviour
- A stock already in `compareList` should show `✓ Compare` on its button instead of `+ Compare`
- Create a `StockComparePanel` component that renders as a **fixed panel at the bottom of the screen**
- The panel must only appear when **2 or more** stocks are in `compareList` — it should render nothing otherwise
- The panel must show a side-by-side metric table comparing: Price, Change, Change %, Volume, Market Cap, and Sector for each selected stock
- The **highest numeric value** in each metric row must be highlighted in green
- Each stock column in the panel header must have an `✕` button that removes only that stock from the comparison
- A `Clear All` button must empty the entire `compareList`
- Add `<StockComparePanel />` to `App.tsx` as an **eager** (non-lazy) import
- Add `paddingBottom: 80` to the outer `div` in `App.tsx` so page content is not obscured by the fixed panel

**Acceptance criteria:**

- Each StockCard shows a compare toggle button that does not interfere with card selection
- Selecting fewer than 2 stocks shows nothing at the bottom
- Selecting 2 or more stocks reveals the comparison panel
- The best numeric value per row is highlighted
- Individual stocks and `Clear All` correctly update the panel

---

## Part 2 — DevTools Integration

**Files to update:** All four store files

Zustand ships with a `devtools` middleware that integrates with the Redux DevTools browser extension. Currently none of the stores use it, so state changes are invisible to debugging tools.

**Your task:**

- Wrap all four stores with the `devtools` middleware imported from `zustand/middleware`
- Give each store a clear name that appears in the DevTools panel: `stockStore`, `tradeStore`, `portfolioStore`, `positionsStore`
- Add a descriptive action name as the third argument to every `set()` call in all four stores, following the convention `storeName/actionName` — for example: `'tradeStore/addTrade'`, `'portfolioStore/loadStart'`, `'portfolioStore/loadSuccess'`
- The `replace` argument (second argument to `set()`) must always be `false`

**Acceptance criteria:**

- Opening Redux DevTools in the browser shows four separate store instances by their given names
- Every state change triggered by a user action (typing, clicking, submitting) appears as a named entry in the DevTools action log
- Time-travel debugging works — stepping back through actions restores the correct state
- No `npm install` is required — `devtools` ships with Zustand

---

## Part 3 — useStockStore

**File to create:** `src/stores/useStockStore.ts`

Currently, `App.tsx` owns `searchQuery`, `sectorFilter`, and `selectedStock` as separate `useState` hooks. The `filteredStocks` list is computed inline inside the component body. All of this is then manually passed down as props to `LiveQuotesFeature`, which passes `onSearch` and `onFilterChange` further down to `SearchBar`.

**Your task:**

- Create a Zustand store that holds `searchQuery`, `sectorFilter`, `selectedStock`, `filteredStocks` (derived), and `compareList` (for the comparison feature in Part 5)
- Move the `filteredStocks` filter logic out of `App.tsx` and into the store — it should re-run automatically whenever `searchQuery` or `sectorFilter` changes
- Update `App.tsx` to remove the three `useState` declarations and the inline filter computation
- Update `LiveQuotesFeature.tsx` to read directly from the store — it should have **zero props**
- `SearchBar.tsx` and `StockCard.tsx` must **not** be changed

**Acceptance criteria:**

- `App.tsx` contains no `useState` for search, filter, or selected stock
- `<LiveQuotesFeature />` is rendered in `App.tsx` with no props
- Typing in the search box still filters the stock list in real time
- Selecting a sector in the dropdown still filters by sector

---

## Part 4 — useTradeStore

**File to create:** `src/stores/useTradeStore.ts`

Currently, `tradeHistory` lives in `App.tsx` as a `useState<Trade[]>`. The `handleNewTrade` function also lives in `App.tsx` — it generates the `id` and `date` fields and prepends the new trade to the list. Both the list and the function are passed down as props to `TradeFeature`, which passes `onSubmitTrade` further down to `TradeForm`.

**Your task:**

- Create a Zustand store that holds `tradeHistory` and an `addTrade` action
- The `addTrade` action must accept only `Omit<Trade, 'id' | 'date'>` — the store generates `id` and `date` internally
- Update `App.tsx` to remove the `tradeHistory` `useState` and the `handleNewTrade` function
- Update `TradeFeature.tsx` to read from both `useTradeStore` (for trade data) and `useStockStore` (for `selectedStock` to pre-fill the form) — it should have **zero props**
- `TradeForm.tsx` must **not** be changed

**Acceptance criteria:**

- `App.tsx` contains no `useState` for trade history and no `handleNewTrade` function
- `<TradeFeature />` is rendered in `App.tsx` with no props
- Submitting a trade via the form adds it to the top of the Trade History table
- The trade form still pre-fills when a StockCard is clicked

---

## Part 5 — usePortfolioStore

**File to create:** `src/stores/usePortfolioStore.ts`

Currently, `PortfolioSummary.tsx` contains a local `useState` with five fields (`holdings`, `totalValue`, `gainLoss`, `isLoading`, `error`). A `useEffect` with `setTimeout` runs the portfolio calculation and calls `setPortfolio`. The component also receives `availableStocks` as a prop passed from `App.tsx` through `PortfolioFeature`.

**Your task:**

- Create a Zustand store that holds the five portfolio fields and a `loadPortfolio` action
- The `loadPortfolio` action must replicate the existing `setTimeout` calculation logic — keep the same 800ms delay
- Update `PortfolioSummary.tsx` to remove the `useState` and `useEffect` blocks — use a `useEffect` that calls the store action instead, and read `allStocks` from `useStockStore` directly
- Update `PortfolioFeature.tsx` to remove the `availableStocks` prop — it should have **zero props**
- Update `App.tsx` to remove the `availableStocks` prop from `<PortfolioFeature />`
- The local `selectedSector` dropdown state in `PortfolioSummary.tsx` must **stay as local `useState`** — it does not need to be shared

**Acceptance criteria:**

- `PortfolioSummary.tsx` has no `useState` for portfolio data and no `useEffect` with `setTimeout`
- `<PortfolioFeature />` is rendered in `App.tsx` with no props
- The loading state still shows while the calculation runs
- The portfolio summary still displays correctly after loading

---

## Part 6 — usePositionsStore

**File to create:** `src/stores/usePositionsStore.ts`

Currently, `PositionFeature.tsx` is read-only — it receives `positionData` as a prop from `App.tsx` and only displays it. There is no way to add or remove positions from the UI.

**Your task:**

- Create a Zustand store that holds `positions` and provides three actions: `addPosition`, `removePosition`, and `updatePosition`
- The `addPosition` action must handle the case where a position for the same stock symbol already exists — instead of creating a duplicate row, it should merge the quantities and recalculate the average price using a weighted average
- The `removePosition` action must remove a position by `id` — never mutate the existing array
- The `updatePosition` action must accept a partial update — only the provided fields should change
- Update `PositionFeature.tsx` to remove the `positionData` prop and read from the store — add a **Remove** button column to the `DataTable` that calls `removePosition`
- Update `App.tsx` to remove the `positionData` prop from `<PositionsFeature />`

**Acceptance criteria:**

- `<PositionsFeature />` is rendered in `App.tsx` with no props
- Each row in the Positions table has a Remove button
- Clicking Remove instantly deletes that row from the table
- Adding a position for a stock that already exists merges it rather than duplicating

---

## Migration Checklist

### Setup
- [ ] `npm install zustand`
- [ ] Create folder `src/stores/`

### Part 1 — useStockStore
- [ ] Create `src/stores/useStockStore.ts`
- [ ] Remove `selectedStock`, `searchQuery`, `sectorFilter` `useState` from `App.tsx`
- [ ] Remove `filteredStocks` computation from `App.tsx`
- [ ] Remove all props from `<LiveQuotesFeature />` in `App.tsx`
- [ ] Update `LiveQuotesFeature.tsx` — remove props interface, read from store

### Part 2 — useTradeStore
- [ ] Create `src/stores/useTradeStore.ts`
- [ ] Remove `tradeHistory` `useState` from `App.tsx`
- [ ] Remove `handleNewTrade` function from `App.tsx`
- [ ] Remove all props from `<TradeFeature />` in `App.tsx`
- [ ] Update `TradeFeature.tsx` — remove props interface, read from both stores

### Part 3 — usePortfolioStore
- [ ] Create `src/stores/usePortfolioStore.ts`
- [ ] Update `PortfolioSummary.tsx` — remove `useState` + `useEffect`, read from store
- [ ] Update `PortfolioFeature.tsx` — remove `availableStocks` prop
- [ ] Remove `availableStocks` prop from `<PortfolioFeature />` in `App.tsx`

### Part 4 — usePositionsStore
- [ ] Create `src/stores/usePositionsStore.ts`
- [ ] Update `PositionFeature.tsx` — remove `positionData` prop, add Remove button column
- [ ] Remove `positionData` prop from `<PositionsFeature />` in `App.tsx`
- [ ] Remove unused `positions` import from `App.tsx`

### Part 5 — Stock Comparison
- [ ] Update `StockCard.tsx` — add compare toggle button
- [ ] Create `src/components/StockComparePanel.tsx`
- [ ] Add `StockComparePanel` to `App.tsx` JSX
- [ ] Add `paddingBottom: 80` to outer `div` in `App.tsx`

### Part 6 — DevTools
- [ ] Install Redux DevTools browser extension
- [ ] Wrap `useStockStore.ts` with `devtools` middleware + action names
- [ ] Wrap `useTradeStore.ts` with `devtools` middleware + action names
- [ ] Wrap `usePortfolioStore.ts` with `devtools` middleware + action names
- [ ] Wrap `usePositionsStore.ts` with `devtools` middleware + action names

### Browser Tests
- [ ] Search input filters the stock list in real time
- [ ] Sector dropdown filters the stock list
- [ ] Clicking a StockCard pre-fills the trade form symbol and price
- [ ] Submitting TradeForm adds the trade at the top of Trade History
- [ ] Clicking `+ Compare` on 2+ cards shows the compare panel
- [ ] Best metric value per row is highlighted green in the compare panel
- [ ] Clicking ✕ on a stock in the compare panel removes it
- [ ] Clicking `Clear All` empties the compare panel
- [ ] Clicking `Remove` on a Positions row deletes it instantly
- [ ] All actions appear correctly named in Redux DevTools
