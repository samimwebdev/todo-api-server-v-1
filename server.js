require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')

const connectDB = require('./config/connectDB')
const errorHandler = require('./middlewares/errorHandler')
const todoRoutes = require('./routes/todos')
const authRoutes = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 3000

//CORS(cross origin resource sharing) communication with 3rd party and exchanging data
app.use(cors())

//serve static file
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

//Parsing incoming request body JSON
app.use(express.json())

//handling Form Data
app.use(express.urlencoded({ extended: false }))

//connect DB
connectDB()

//Todo API
app.use('/api/v1/todos', todoRoutes)

//Auth API
app.use('/api/v1/auth', authRoutes)

//Error Handling Middleware
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Express JS is Running on port ${PORT}`)
})
