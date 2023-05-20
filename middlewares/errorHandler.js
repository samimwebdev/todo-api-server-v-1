//Middleware
const errorHandler = (err, req, res, next) => {
  console.log('errors', err.errors)
  console.log({ err })
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((error) => error.message)
    res.status(400).json({ success: false, err: message })
  } else if (err.name === 'CastError') {
    res.status(400).json({ success: false, err: 'Invalid Resource ID' })
  } else {
    console.log(err)
    res.status(500).json({ success: false, err: 'Internal Server error' })
  }
}

module.exports = errorHandler
