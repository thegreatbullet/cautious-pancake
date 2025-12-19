/*---------------------------Imports---------------------------*/
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')

const connectDB = require('./db') // DB connection
const pokemonRoutes = require('./routes/pokemonRoutes')

/*---------------------------App Setup---------------------------*/
const app = express()
const PORT = process.env.PORT || 8080

/*---------------------------Middleware---------------------------*/
// Security headers
app.use(helmet())

// CORS - for production, restrict to your frontend URL
app.use(cors({ origin: '*' }))

// JSON parsing
app.use(express.json())

// Static files
app.use('/static', express.static(path.join(__dirname, 'static')))

/*---------------------------Rate Limiting---------------------------*/
// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP per window
  message: 'Too many requests from this IP, please try again later.',
})
app.use(globalLimiter)

/*---------------------------Database Connection---------------------------*/
const mongoURI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/my_database'

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ Could not connect to MongoDB:', err))

/*---------------------------Routes---------------------------*/
app.get('/', (req, res) => {
  res.send('Welcome to the Express and MongoDB app!')
})

// Versioned API route
app.use('/api/v1/pokemon', pokemonRoutes)

/*---------------------------Start Server---------------------------*/
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})
