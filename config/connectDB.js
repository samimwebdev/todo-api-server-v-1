const mongoose = require('mongoose')
const url =
  process.env.NODE_ENV === 'development'
    ? process.env.DEVELOPMENT_DB
    : process.env.PRODUCTION_DB

console.log('env', process.env.NODE_ENV)
const connectDB = async () => {
  try {
    await mongoose.connect(url)
    console.log('connected Database MOngoDB')
  } catch (err) {
    console.log(err.message)
  }
}

module.exports = connectDB
