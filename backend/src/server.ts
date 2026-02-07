import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config(); // From process.cwd()
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // From backend root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // From project root (dev)

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.routes';
import stockRoutes from './routes/stock.routes';
import marketRoutes from './routes/market.routes';
import aiRoutes from './routes/ai.routes';
import arenaRoutes from './routes/arena.routes';
import watchlistRoutes from './routes/watchlist.routes';
import paperTradeRoutes from './routes/paperTrade.routes';
import performanceRoutes from './routes/performance.routes';

import { startMarketSimulation } from './services/marketSimulator';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins for dev
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// Start Simulation with Socket.io
startMarketSimulation(io);

app.use(cors());
app.use(express.json());

// Global Rate Limiter
import { apiLimiter } from './middleware/rateLimit';
app.use('/api/', apiLimiter);

// Routes - API v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stocks', stockRoutes);
app.use('/api/v1/market', marketRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/arena', arenaRoutes);
app.use('/api/v1/watchlist', watchlistRoutes);
app.use('/api/v1/paper-trade', paperTradeRoutes);
app.use('/api/v1/performance', performanceRoutes);

// Legacy/Health
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Use httpServer.listen instead of app.listen
httpServer.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
    console.log(`WebSocket Server initialized`);
});
