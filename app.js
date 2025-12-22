/*---------------------------Imports---------------------------*/
import 'dotenv/config'; // automatically loads .env
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import errorMiddleware from './middleware/errorMiddleware.js';
import logger from './utils/logger.js'; // Winston logger
import promClient from 'prom-client';

import connectDB from './db.js'; // DB connection
import pokemonRoutes from './routes/pokemonRoutes.js';

/*---------------------------App Setup---------------------------*/
const app = express();
const PORT = process.env.PORT || 8080;

// __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*---------------------------Middleware---------------------------*/
// Security headers
app.use(helmet());

// CORS - restrict to your frontend URL in production
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

// JSON parsing
app.use(express.json());

// Static files
app.use('/static', express.static(path.join(__dirname, 'static')));

/*---------------------------Rate Limiting---------------------------*/
// Global rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(globalLimiter);

/*---------------------------Prometheus Metrics---------------------------*/
// Collect default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics();

// Counter for HTTP requests
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'statusCode'],
});

// Middleware to count requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.path,
      statusCode: res.statusCode,
    });
  });
  next();
});

// Expose metrics at /metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

/*---------------------------Database Connection---------------------------*/
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/my_database';

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('✅ Connected to MongoDB'))
  .catch((err) => logger.error('❌ Could not connect to MongoDB: %o', err));

/*---------------------------Routes---------------------------*/
app.get('/', (req, res) => {
  logger.info('GET / called from IP %s', req.ip);
  res.send('Welcome to the Express and MongoDB app!');
});

// Versioned API route
app.use('/api/v1/pokemon', pokemonRoutes);

// Custom error middleware
app.use(errorMiddleware);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

/*---------------------------Start Server---------------------------*/
app.listen(PORT, () => {
  logger.info('🚀 Server running at http://localhost:%d', PORT);
});

export default app;
