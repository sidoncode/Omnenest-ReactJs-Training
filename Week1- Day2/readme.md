# 📈 Stock Market Dataset — Frontend Filtering Guide

---

## 1. Dataset

| Field | Details |
|-------|---------|
| **Source** | Kaggle — Jackson Crow |
| **URL** | [https://www.kaggle.com/datasets/jacksoncrow/stock-market-dataset](https://www.kaggle.com/datasets/jacksoncrow/stock-market-dataset) |
| **Format** | CSV (one file per ticker symbol) |
| **Coverage** | All ETFs and stocks listed on NYSE, NASDAQ, NYSE MKT |

### Schema

| Column | Type | Description |
|--------|------|-------------|
| `Date` | string | Trading date (`YYYY-MM-DD`) |
| `Open` | float | Opening price |
| `High` | float | Daily high price |
| `Low` | float | Daily low price |
| `Close` | float | Closing price |
| `Adj Close` | float | Adjusted closing price |
| `Volume` | integer | Number of shares traded |

---

## 2. Sample Data (`stock_data.csv`)

```csv
Date,Open,High,Low,Close,Adj Close,Volume
2020-01-02,296.24,300.60,295.19,300.35,300.35,33870100
2020-01-03,297.15,300.58,296.50,297.43,297.43,36580400
2020-01-06,293.79,299.96,292.75,299.80,299.80,29596500
2020-01-07,299.84,300.90,297.10,298.39,298.39,27073600
2020-01-08,295.17,301.30,293.98,301.21,301.21,30336400
2020-01-09,301.43,304.92,301.38,303.19,303.19,25048400
2020-01-10,304.92,304.97,301.88,303.74,303.74,22841500
2020-01-13,306.20,310.43,305.08,309.63,309.63,28251100
2020-01-14,310.87,311.55,306.20,308.52,308.52,30035600
2020-01-15,309.58,311.50,308.05,311.32,311.32,22783100
2020-01-16,312.42,313.30,309.80,313.05,313.05,24139400
```

---

## 3. Frontend Filtering — JSX Component

### Filter Fields

| Filter | Input Type | Filters On |
|--------|-----------|------------|
| **Date Range** | `date` (From / To) | `Date` column |
| **Price Low** | `number` | `Low` column ≥ value |
| **Price High** | `number` | `High` column ≤ value |
| **Volume** | `number` | `Volume` ≥ value |

---

## 4. How the Filters Work

```
dateFrom  →  row.Date >= dateFrom
dateTo    →  row.Date <= dateTo
priceLow  →  row.Low  >= priceLow    (minimum of the day's low)
priceHigh →  row.High <= priceHigh   (maximum of the day's high)
volume    →  row.Volume >= volume     (minimum share volume)
```

All filters are applied simultaneously using `useMemo` — no re-render unless filter state changes.

---

## 5. Usage

```bash
# 1. Copy StockFilter.jsx into your React project
# 2. Import and render it anywhere
```

```jsx
import StockFilter from "./StockFilter";

function App() {
  return <StockFilter />;
}
```

> **Tip:** To load real CSV data, replace `RAW_DATA` with parsed rows from `papaparse`:
>
> ```js
> import Papa from "papaparse";
> const { data } = Papa.parse(csvText, { header: true, dynamicTyping: true });
> ```

---

*Dataset credit: [Jackson Crow on Kaggle](https://www.kaggle.com/datasets/jacksoncrow/stock-market-dataset)*
