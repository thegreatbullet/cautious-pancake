/*---------------------------Imports---------------------------*/
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const errorMiddleware = require('./middleware/errorMiddleware')
const logger = require('./utils/logger') // Winston logger=
const promClient = require('prom-client')

const connectDB = require('./db') // DB connection
const pokemonRoutes = require('./routes/pokemonRoutes')

/*---------------------------App Setup---------------------------*/
const app = express()
const PORT = process.env.PORT || 8080

/*---------------------------Middleware---------------------------*/
// Security headers
app.use(helmet())

// CORS - restrict to your frontend URL in production
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))

// JSON parsing
app.use(express.json())

// Static files
app.use('/static', express.static(path.join(__dirname, 'static')))

/*---------------------------Rate Limiting---------------------------*/
// Global rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
})
app.use(globalLimiter)

/*---------------------------Prometheus Metrics---------------------------*/
// Collect default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics()

// Counter for HTTP requests
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'statusCode'],
})

// Middleware to count requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.path,
      statusCode: res.statusCode,
    })
  })
  next()
})

// Expose metrics at /metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType)
  res.end(await promClient.register.metrics())
})

/*---------------------------Database Connection---------------------------*/
const mongoURI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/my_database'

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('✅ Connected to MongoDB'))
  .catch((err) => logger.error('❌ Could not connect to MongoDB: %o', err))

/*---------------------------Routes---------------------------*/
app.get('/', (req, res) => {
  logger.info('GET / called from IP %s', req.ip)
  res.send('Welcome to the Express and MongoDB app!')
})

// Versioned API route
app.use('/api/v1/pokemon', pokemonRoutes)

// Custom error middleware
app.use(errorMiddleware)

/*---------------------------Start Server---------------------------*/
app.listen(PORT, () => {
  logger.info('🚀 Server running at http://localhost:%d', PORT)
})

module.exports = app
