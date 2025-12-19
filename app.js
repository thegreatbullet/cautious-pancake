/*---------------------------Import---------------------------*/
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

const connectDB = require('./db') // Import DB connection

/*---------------------------Express Connect---------------------------*/
const pokemonRoutes = require('./routes/PokemonRoutes')

const app = express()
const PORT = process.env.PORT || 8080 // Use environment port or default to 3000

/*--------------------------Connect Database--------------------------*/

connectDB()

/*--------------------------Middleware--------------------------*/

app.use(cors({ origin: '*' }))
app.use('/static', express.static(path.join(__dirname, 'static')))
app.use(express.json())

/*---------------------------Mongoose---------------------------*/
const mongoURI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/my_database'

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB')) // Log success message
  .catch((err) => console.error('Could not connect to MongoDB:', err)) // Log error message if connection fails

/*------------------------------------------------------------*/
/*---------------------------Routes---------------------------*/
/*------------------------------------------------------------*/

app.get('/', (req, res) => {
  res.send('Welcome to the Express and MongoDB app!')
})

app.use('/api/v1/pokemon', pokemonRoutes)

/*---------------------------Start Server---------------------------*/
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`) // Log the server URL
})
