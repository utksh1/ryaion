# API Endpoints Contract

## AI Stock Intelligence Platform

---

## 1. API Design Principles

- RESTful architecture
- JSON request/response format
- Stateless authentication using JWT
- Clear separation between public, user, and AI endpoints
- Versioned APIs for future scalability

Base URL:
```
/api/v1
```

---

## 2. Authentication APIs

### 2.1 Register User

**Endpoint**
```
POST /auth/register
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "strongpassword",
  "risk_profile": "medium",
  "trading_style": "swing"
}
```

**Response**
```json
{
  "message": "User registered successfully"
}
```

---

### 2.2 Login User

**Endpoint**
```
POST /auth/login
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "strongpassword"
}
```

**Response**
```json
{
  "token": "jwt_token_here"
}
```

---

## 3. Market Data APIs

### 3.1 Get Live Market Overview

**Endpoint**
```
GET /market/overview
```

**Response**
```json
{
  "market_status": "OPEN",
  "indices": [
    { "name": "NIFTY 50", "value": 19820, "change": 0.45 }
  ]
}
```

---

### 3.2 Get Live Stock Price

**Endpoint**
```
GET /stocks/{symbol}/live
```

**Response**
```json
{
  "symbol": "TCS",
  "price": 3840.5,
  "change": 1.2,
  "volume": 1200345
}
```

---

## 4. Stock Detail APIs

### 4.1 Get Stock Details

**Endpoint**
```
GET /stocks/{symbol}
```

**Response**
```json
{
  "symbol": "TCS",
  "name": "Tata Consultancy Services",
  "sector": "IT",
  "exchange": "NSE"
}
```

---

### 4.2 Get Stock Charts Data

**Endpoint**
```
GET /stocks/{symbol}/chart?timeframe=1D
```

**Response**
```json
{
  "candles": [
    { "t": "2026-02-01T09:15", "o": 3800, "h": 3850, "l": 3790, "c": 3840 }
  ]
}
```

---

## 5. AI Analysis APIs

### 5.1 Run AI Analysis on Stock

**Endpoint**
```
POST /ai/analyze
```

**Request Body**
```json
{
  "symbol": "TCS",
  "horizon": "swing"
}
```

**Response**
```json
{
  "ai_score": 82,
  "risk_level": "low",
  "confidence": 74,
  "expected_move": 4.2,
  "explanation": "Strong momentum with positive sentiment"
}
```

---

### 5.2 Get AI Suggestions

**Endpoint**
```
GET /ai/suggestions?horizon=swing
```

**Response**
```json
[
  {
    "symbol": "INFY",
    "ai_score": 85,
    "confidence": 78
  }
]
```

---

## 6. Stocks Arena APIs

### 6.1 Compare Two Stocks

**Endpoint**
```
POST /arena/compare
```

**Request Body**
```json
{
  "stock_a": "TCS",
  "stock_b": "INFY",
  "horizon": "swing"
}
```

**Response**
```json
{
  "winner": "TCS",
  "reason": "Higher momentum and lower volatility",
  "scores": {
    "TCS": 82,
    "INFY": 76
  }
}
```

---

## 7. Watchlist APIs

### 7.1 Add to Watchlist

**Endpoint**
```
POST /watchlist
```

**Request Body**
```json
{
  "symbol": "TCS"
}
```

---

### 7.2 Get User Watchlist

**Endpoint**
```
GET /watchlist
```

---

## 8. Paper Trading APIs

### 8.1 Place Paper Trade

**Endpoint**
```
POST /paper-trade
```

**Request Body**
```json
{
  "symbol": "TCS",
  "type": "buy",
  "quantity": 10
}
```

---

### 8.2 Get Paper Trading Portfolio

**Endpoint**
```
GET /paper-trade/portfolio
```

---

## 9. Performance & Backtesting APIs

### 9.1 Get AI Performance Metrics

**Endpoint**
```
GET /performance/ai
```

**Response**
```json
{
  "accuracy": 68,
  "total_predictions": 420
}
```

---

## 10. Error Handling

Standard error format:
```json
{
  "error": "Invalid request",
  "code": 400
}
```

---

## 11. Security Notes

- JWT required for protected routes
- Rate limiting applied
- Input validation enforced

---

## 12. Academic Notes

- APIs clearly map to system modules
- Separation of concerns demonstrated
- Ready for OpenAPI/Swagger conversion

---

End of Document

