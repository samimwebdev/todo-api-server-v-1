const jwt = require('jsonwebtoken')

const requiredAuth = (req, res, next) => {
  // Bearer token
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ success: false, err: 'UnAuthorized' })
  }

  jwt.verify(token, process.env.JSON_WEB_TOKEN, async (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ success: false, err: 'UnAuthorized' })
    }
    req.user = decodedToken
    next()
  })
}

module.exports = requiredAuth
