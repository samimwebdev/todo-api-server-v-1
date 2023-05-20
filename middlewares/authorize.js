const jwt = require('jsonwebtoken')
const Todo = require('../models/Todo')

const authorizeTodo =
  (...allowedRoles) =>
  async (req, res, next) => {
    const userRoles = req.user.roles

    const isAllowed = allowedRoles.some((allowedRole) =>
      userRoles.includes(allowedRole)
    )

    if (isAllowed) return next()
    return res.status(403).json({ success: false, err: 'Forbidden' })
  }

module.exports = authorizeTodo
