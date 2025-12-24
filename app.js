import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import promClient from 'prom-client';

import errorMiddleware from './middleware/errorMiddleware.js';
import logger from './utils/logger.js';
import connectDB from './db.js';
import pokemonRoutes from './routes/pokemonRoutes.js';

/*---------------------------App Setup---------------------------*/
const app = express();
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

// __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*---------------------------Middleware---------------------------*/
app.use(helmet());

// CORS dynamically from env
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

/*---------------------------Rate Limiting---------------------------*/
app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: 'Too many requests from this IP, please try again later.',
  }),
);

/*---------------------------Prometheus Metrics---------------------------*/
promClient.collectDefaultMetrics();

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'statusCode'],
});

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

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

/*---------------------------Database---------------------------*/
// Only auto-connect if NOT in test mode
if (NODE_ENV !== 'test') {
  await connectDB(process.env.MONGO_URI);
}

/*---------------------------Logging---------------------------*/
logger.level = process.env.LOG_LEVEL || 'info';
logger.defaultMeta = { service: process.env.LOG_SERVICE_NAME || 'pokemon-backend' };

/*---------------------------Routes---------------------------*/
app.get('/', (req, res) => {
  logger.info('GET / from %s', req.ip);
  res.send('Welcome to the Express and MongoDB app!');
});

app.use('/api/v1/pokemon', pokemonRoutes);
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

/*---------------------------Auth Config---------------------------*/
const jwtSecret = process.env.JWT_SECRET || 'default_secret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

/*---------------------------Swagger---------------------------*/
if (process.env.ENABLE_SWAGGER === 'true') {
  import('./utils/swagger.js').then(({ setupSwagger }) => {
    setupSwagger(app);
  });
}

/*---------------------------Error Handler---------------------------*/
app.use(errorMiddleware);

/*---------------------------Start Server---------------------------*/
if (NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running in ${NODE_ENV} mode at http://localhost:${PORT}`);
  });
}

export default app;
