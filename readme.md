# OmneNest Project:




# GitHub Collaborators

| Name | Role | GitHub Profile | Prod URL |
|------|------|----------------|----------| 
| Rockey Kumar | Collaborator | [github.com/rockeykumarmuz](https://github.com/rockeykumarmuz) | https://rockeykumarmuz.github.io/stock-market-project-week-2/ |
| Aditya Adawadkar | Collaborator | [github.com/Adityaa112](https://github.com/Adityaa112) | [adityaa112.github.io/week2day1](https://adityaa112.github.io/week2day1/) |
| Dhruv Mehta | Collaborator | [github.com/Dhruv-Omnenest](https://github.com/Dhruv-Omnenest) | [dhruv-omnenest.github.io/Week2](https://dhruv-omnenest.github.io/Week2/) |
| Sarthak Dhanwate | Collaborator | [github.com/dsarthak0](https://github.com/dsarthak0) | [dsarthak0.github.io/week2-sarthak](https://dsarthak0.github.io/week2-sarthak/) |
| Parth Das | Collaborator | [github.com/ParthOmneNest](https://github.com/ParthOmneNest) | [parthomnenest.github.io/Week2-parth-das](https://parthomnenest.github.io/Week2-parth-das/) |
| Rohit Gomase | Collaborator | [github.com/rohit-gomase25](https://github.com/rohit-gomase25) | [rohit-gomase25.github.io/Week2-Rohit](https://rohit-gomase25.github.io/Week2-Rohit/) |
| Ruta Mangalampalli | Collaborator | [github.com/ruta-m](https://github.com/ruta-m) | [ruta-m.github.io/week2-ruta](https://ruta-m.github.io/week2-ruta/) |
| Sampuran Udeshi | Collaborator | [github.com/Sampuran429Omnenest](https://github.com/Sampuran429Omnenest) | [sampuran429omnenest.github.io/week2-sampuran](https://sampuran429omnenest.github.io/week2-sampuran/) |
| Sanika Sule | Collaborator | [github.com/sanikasule](https://github.com/sanikasule) | [sanikasule.github.io/week2-sanika](https://sanikasule.github.io/week2-sanika/) |
| Tanya Verma | Collaborator | [github.com/tanya017](https://github.com/tanya017) | [tanya017.github.io/week2-tanya](https://tanya017.github.io/week2-tanya/) |



# React JS Sessions - Whiteboards

| Week | Date | Session / Topic | Link |
|------|------|-----------------|------|
| Week 1 | 16-Feb | Day 1: ReactJS — Fundamentals, Components, Props, Router-Dom, useState() - Mini Project | [Link](https://miro.com/app/board/uXjVG_iQp9U=/?share_link_id=913282371338) |
| Week 1 | 17-Feb | Day 2: ReactJS — Form Validation, Dynamic Content Filtering, Spread Operators, FrontEnd Filtering (Groww CaseStudy) - Mini Project | [Link](https://miro.com/app/board/uXjVG_FHgXU=/?share_link_id=842077525278) |
| Week 1 | 18-Feb | Day 3: ReactJS — useEffect(), API Architecture, Filtering / Sorting / Custom Hooks - Mini Project | [Link](https://miro.com/app/board/uXjVG-utRWs=/?share_link_id=521125754174) |
| Week 1 | 19-Feb | Day 4: ReactJS — Advanced Hooks and Custom Hooks - Mini Project | [Link](https://miro.com/app/board/uXjVG-Xfjkc=/?share_link_id=564116410358) |
| Week 1 | 20-Feb | Day 5: ReactJS — Q&A / TypeScript: Fundamentals - Mini Project | [Link](https://miro.com/app/board/uXjVG991WmE=/?share_link_id=144851743651) |
| Week 2 | 23-Feb | Day 1: ReactJS — TypeScript, Omit,pick,Partial, with Project(Groww915) | [Link](https://miro.com/app/board/uXjVG8BFyZ8=/?share_link_id=860521862202) |
| Week 2 | 24-Feb | Day 2: ReactJS — Pagination, Infinite Scrolling, Virtualisation, Lazy Loading, Suspense, Error Bounding & Code Spliting | [Link](https://miro.com/app/board/uXjVG8BFyZ8=/?share_link_id=860521862202) |
| Week 2 | 25-Feb | Day 3: Zustand Fundamentals + Handson + Assingments | [Link](https://miro.com/app/board/uXjVG8BFyZ8=/?share_link_id=860521862202) |
| Week 2 | 26-Feb | Day 4: Zustand - Advance: Handson + Groww915 Mock Tickets| [Link]() |





# Trade, Position & Holdings — Client View Guide

> A sequential breakdown of the three core tables in the portfolio dashboard, and what each one means to the client.

---

## The Sequential Flow

```
Client places a trade
       ↓
  TRADE HISTORY  →  records every BUY/SELL event
       ↓
   POSITIONS     →  shows net open shares + live P&L
       ↓
   HOLDINGS      →  shows total invested $ vs current $ value
```

**In short:** Trades are the events → Positions show the current state → Holdings show the financial outcome.

---

## 1. Trade History — *"What did I do?"*

This is the **action log**. Every time the client places a BUY or SELL order, a record is added here.

### Columns

| Column | Description |
|--------|-------------|
| Symbol | Stock ticker (e.g. AAPL, TSLA) |
| Type | `BUY` (green) or `SELL` (red) |
| Qty | Number of shares traded |
| Price | Price per share at time of trade |
| Date | Date the trade was executed |

### Client Usecase

> *"I want to see every transaction I've ever made — when I bought AAPL, when I sold TSLA, at what price, and how many shares."*

This is essentially an **audit trail** of all activity. It answers the question: *"What actions have I taken?"*

### Key Behaviour
- Infinite scroll — loads 10 trades at a time as the client scrolls down.
- Shows a running count: `X of Y shown`.
- Includes a **Place a Trade** form below the history table.

---

## 2. Positions — *"What do I currently own and how is it doing today?"*

This is the **live snapshot**. It aggregates all trades into a net open position per stock and shows real-time P&L.

### Columns

| Column | Description |
|--------|-------------|
| Symbol | Stock ticker |
| Qty | Net shares currently held |
| Average Price | Weighted average buy price |
| Last Traded Price (LTP) | Current market price |
| P&L ($) | Profit or Loss in dollar terms |
| P&L (%) | Profit or Loss as a percentage |

### Client Usecase

> *"Right now, how many shares of NVDA do I hold? What did I pay on average, and what is it worth at this moment? Am I up or down?"*

This is the **intraday / short-term view**. P&L values are colour-coded: green for profit, red for loss. It answers: *"How is my portfolio performing right now?"*

### Key Behaviour
- Infinite scroll — loads 10 positions at a time.
- Shows a running count: `X of Y shown`.
- P&L and P&L% both render with `+` prefix for gains and a red colour for losses.

---

## 3. Holdings — *"What is my long-term invested value vs current value?"*

This is the **portfolio health view**. It focuses on the total money invested versus what that investment is worth today.

### Columns

| Column | Description |
|--------|-------------|
| Symbol | Stock ticker |
| Qty | Shares held |
| Invested Value | Total cost basis (`qty × avg price`) |
| Current Value | Today's market value (`qty × LTP`) |
| Total Return ($) | `Current Value − Invested Value` |

### Client Usecase

> *"I put $1,750 into AAPL. What is it worth today? Have I made money overall?"*

Unlike Positions (which shows per-share price and LTP), Holdings shows the **big-picture dollar amounts**, making it easier to understand wealth accumulation over time. It answers: *"How has my overall investment performed?"*

### Key Behaviour
- Total Return is displayed in green (`+`) for gains and red for losses.
- Invested Value and Current Value are formatted with `$` and locale-aware number formatting.

---

## Summary Comparison

| | Trade History | Positions | Holdings |
|---|---|---|---|
| **Purpose** | Audit log of all activity | Live snapshot of open positions | Long-term value comparison |
| **Time Focus** | Past events | Present state | Overall investment outcome |
| **Key Question** | What did I do? | What do I own right now? | How much have I made/lost overall? |
| **P&L shown?** | ❌ | ✅ ($ and %) | ✅ (Total Return $) |
| **Price shown?** | Trade price | Avg Price + LTP | Invested $ + Current $ |
| **Scroll** | Infinite (10/page) | Infinite (10/page) | Standard table |

