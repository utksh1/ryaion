# Database Schema & ER Diagram

## AI Stock Intelligence Platform

---

## 1. Database Design Goals

- Support real-time and historical stock data
- Store AI-generated insights and explanations
- Enable comparisons (Stocks Arena)
- Track user behavior, preferences, and simulations
- Ensure scalability and clear relationships

The design follows **normalized relational structure** with selective denormalization for performance.

---

## 2. Core Entities Overview

Main entities:
- Users
- Stocks
- Stock Prices
- Technical Indicators
- AI Analysis Results
- News & Sentiment
- Stocks Arena Comparisons
- Watchlists
- Paper Trading
- AI Performance Logs

---

## 3. Table Schemas

---

## 3.1 users

Stores user account and preference information.

| Column | Type | Description |
|------|------|------------|
| id | UUID (PK) | Unique user ID |
| email | VARCHAR | Login email |
| password_hash | VARCHAR | Hashed password |
| risk_profile | ENUM | low / medium / high |
| trading_style | ENUM | intraday / swing / long |
| created_at | TIMESTAMP | Account creation time |

---

## 3.2 stocks

Master table for all supported stocks.

| Column | Type | Description |
|------|------|------------|
| id | UUID (PK) | Stock ID |
| symbol | VARCHAR | Stock ticker |
| name | VARCHAR | Company name |
| exchange | VARCHAR | NSE / BSE / Global |
| sector | VARCHAR | Industry sector |

---

## 3.3 stock_prices

Time-series table for price data.

| Column | Type | Description |
|------|------|------------|
| id | UUID (PK) | Price record ID |
| stock_id | UUID (FK) | Reference to stocks |
| timestamp | TIMESTAMP | Time of price |
| open | DECIMAL | Open price |
| high | DECIMAL | High price |
| low | DECIMAL | Low price |
| close | DECIMAL | Close price |
| volume | BIGINT | Traded volume |

---

## 3.4 technical_indicators

Computed technical indicators per stock and timeframe.

| Column | Type | Description |
|------|------|------------|
| id | UUID (PK) | Indicator ID |
| stock_id | UUID (FK) | Related stock |
| timeframe | VARCHAR | 1D / 1W / 1M |
| rsi | DECIMAL | RSI value |
| macd | DECIMAL | MACD value |
| ema | DECIMAL | EMA value |
| sma | DECIMAL | SMA value |
| calculated_at | TIMESTAMP | Calculation time |

---

## 3.5 ai_analysis

Stores AI-generated analysis and outcomes.

| Column | Type | Description |
|------|------|------------|
| id | UUID (PK) | Analysis ID |
| stock_id | UUID (FK) | Related stock |
| ai_score | INTEGER | Score (0–100) |
| risk_level | ENUM | low / medium / high |
| confidence | DECIMAL | Probability % |
| horizon | ENUM | intraday / swing / long |
| expected_move | DECIMAL | % move |
| explanation | TEXT | AI reasoning |
| created_at | TIMESTAMP | Generated time |

---

## 3.6 news_sentiment

Stores news articles and sentiment impact.

| Column | Type | Description |
|------|------|------------|
| id | UUID (PK) | News ID |
| stock_id | UUID (FK) | Related stock |
| headline | TEXT | News title |
| sentiment | ENUM | positive / neutral / negative |
| impact_score | DECIMAL | Impact magnitude |
| published_at | TIMESTAMP | Publish time |

---

## 3.7 stocks_arena

Stores stock comparison sessions.

| Column | Type | Description |
|------|------|------------|
| id | UUID (PK) | Arena session ID |
| stock_a_id | UUID (FK) | Stock A |
| stock_b_id | UUID (FK) | Stock B |
| winner_stock_id | UUID (FK) | AI-selected winner |
| reason | TEXT | Comparison explanation |
| created_at | TIMESTAMP | Comparison time |

---

## 3.8 watchlists

User-saved stocks.

| Column | Type | Description |
|------|------|------------|
| id | UUID (PK) | Watchlist ID |
| user_id | UUID (FK) | Owner |
| stock_id | UUID (FK) | Watched stock |
| created_at | TIMESTAMP | Added time |

---

## 3.9 paper_trades

Virtual trading simulation records.

| Column | Type | Description |
|------|------|------------|
| id | UUID (PK) | Trade ID |
| user_id | UUID (FK) | Trader |
| stock_id | UUID (FK) | Traded stock |
| trade_type | ENUM | buy / sell |
| quantity | INTEGER | Units |
| price | DECIMAL | Execution price |
| created_at | TIMESTAMP | Trade time |

---

## 3.10 ai_performance_logs

Tracks AI accuracy and performance.

| Column | Type | Description |
|------|------|------------|
| id | UUID (PK) | Log ID |
| ai_analysis_id | UUID (FK) | Related analysis |
| actual_move | DECIMAL | Actual % move |
| result | ENUM | correct / incorrect |
| evaluated_at | TIMESTAMP | Evaluation time |

---

## 4. Entity Relationship (ER) Diagram

```
users ────< watchlists >──── stocks
  │                          │
  │                          ├──< stock_prices
  │                          ├──< technical_indicators
  │                          ├──< ai_analysis ───< ai_performance_logs
  │                          └──< news_sentiment
  │
  └──< paper_trades >──── stocks

stocks ───< stocks_arena >─── stocks
```

---

## 5. Relationship Summary

- One user can watch many stocks
- One stock has many price records
- One stock has multiple AI analyses over time
- One AI analysis can generate multiple performance logs
- Stocks Arena compares two stocks per session
- Users can simulate multiple trades

---

## 6. Scalability Notes

- Stock prices stored in time-series optimized tables
- AI results cached for quick retrieval
- Read-heavy endpoints optimized via Redis

---

## 7. Academic Notes

- Schema supports explainable AI
- Clear separation of raw data vs derived intelligence
- ER diagram demonstrates normalized design
- Suitable for real-world fintech systems

---

End of Document

