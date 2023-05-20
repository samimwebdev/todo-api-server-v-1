const express = require('express')
const crypto = require('crypto')
const router = express.Router()
const User = require('../models/User')
const authController = require('../controllers/authController')
const requiredAuth = require('../middlewares/requiredAuth')
const uploadMiddleware = require('../middlewares/fileupload')

router.post('/register', authController.registerController)
router.post('/login', authController.loginController)
router.get('/dashboard', requiredAuth, authController.dashboardController)
router.post(
  '/profile',
  requiredAuth,
  uploadMiddleware,
  authController.updateProfile
)

router.get('/load-img/:imgName', requiredAuth, authController.serveImage)

//send verification email
router.get('/verify-email', requiredAuth, authController.sendVerificationEmail)
//account activation
router.get('/verify-account/:token', authController.verifyAccount)

//forgot password
router.post('/forgot-password', authController.forgotPassword)
//reset password
router.post('/reset-password/:token', authController.resetPassword)

module.exports = router
