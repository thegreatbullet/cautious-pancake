/*---------------------------Imports---------------------------*/
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

const connectDB = require('./db') // DB connection
const pokemonRoutes = require('./routes/pokemonRoutes')

/*---------------------------App Setup---------------------------*/
const app = express()
const PORT = process.env.PORT || 8080

/*---------------------------Middleware---------------------------*/
app.use(cors({ origin: '*' }))
app.use('/static', express.static(path.join(__dirname, 'static')))
app.use(express.json())

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
