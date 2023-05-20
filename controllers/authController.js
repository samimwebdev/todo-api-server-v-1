const User = require('../models/User')
const Profile = require('../models/Profile')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { transporter } = require('../config/email')
const { cloudinary } = require('../config/upload')

const registerController = async (req, res, next) => {
  const { firstName, lastName, age, gender, email, password } = req.body
  try {
    //check if the email already exists
    //if exists
    const isUserEmailExists = await User.findOne({ email })
    if (isUserEmailExists) {
      return res
        .status(400)
        .json({ success: false, error: 'User already exists' })
    }

    //before saving user to database has the password
    /*
    process to convert a value to another 
    one way process
    */

    //create a profile for the user
    const profile = await Profile.create({
      firstName,
      lastName,
      age,
      gender,
    })

    const user = await User.create({
      email,
      password,
      profile: profile._id,
    })

    // await Profile.updateOne({
    //   user: user._id
    // })

    res.status(200).json({
      sucess: true,
    })
  } catch (err) {
    next(err)
  }
}

const loginController = async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: 'Email or password is Missing' })
  }

  try {
    //check id the emnail associate user exists or not
    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid Email or Password' })
    }

    const isMatch = await user.checkPassword(password)
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid email or Password' })
    }
    //provide a key(jwt - json web token)
    const token = jwt.sign(
      { email: user.email, userId: user._id, roles: user.roles },
      process.env.JSON_WEB_TOKEN,
      {
        expiresIn: '10d',
      }
    )

    const data = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      gender: user.gender,
      token,
    }
    res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

const dashboardController = async (req, res, next) => {
  const email = req.user.email
  const user = await User.find({ email })
  res.json({ success: true, data: user })
}

const updateProfile = async (req, res, next) => {
  //https://facebook.com/imageDirectory/image
  try {
    const { firstName, lastName, gender } = req.body
    const filePath = req.file.path

    const result = await cloudinary.uploader.upload(filePath)
    //deleting after deleting from cloudinary
    await fs.promises.unlink(filePath)
    const profile = new Profile({
      firstName,
      lastName,
      gender,
      profilePic: result.secure_url,
      user: req.user.userId,
    })

    await profile.save()

    return res.status(201).json({
      success: true,
      data: profile,
    })
  } catch (err) {
    next(err)
  }
}

const serveImage = async (req, res, next) => {
  try {
    const { imgName } = req.params
    const imageExists = await Profile.findOne({
      profilePic: imgName,
    })

    //check if the image exists or not
    if (!imageExists) {
      return res.status(404).json({
        success: false,
        err: 'Image Not Found',
      })
    }

    const filePath = path.join(__dirname, '..', 'images', imgName)

    res.sendFile(filePath)
  } catch (err) {
    next(err)
  }
}

const sendVerificationEmail = async (req, res, next) => {
  const userId = req.user.userId
  console.log(req.user)
  const user = await User.findById(userId).populate('profile')
  console.log({ user })
  if (!user) {
    return res.status(400).json({ success: false, data: 'User not found' })
  }
  //check if the account verrification is done
  if (user.isVerified) {
    return res
      .status(400)
      .json({ success: false, data: 'Account already verified' })
  }

  try {
    //generate token account activation
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JSON_ACCOUNT_ACTIVATION_TOKEN,
      {
        expiresIn: '24h',
      }
    )

    //forming account activation link
    const activationLink = `${process.env.BASE_URL}/api/v1/auth/verify-account/${token}`
    //snding emial
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Activate your account',
      html: `
    <p>Hi ${user.profile.firstName},</p>
    <p>Thanks for signing up! To activate your account, click the link below:</p>
    <p><a href="${activationLink}">${activationLink}</a></p>
    <p>This link will expire in 24 hours.</p>
  `,
    }

    await transporter.sendMail(mailOptions)
    return res.json({
      sucess: true,
      data: 'Account activation email sent successfully',
    })
  } catch (err) {
    next(err)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const token = req.params.token
    const decodedToken = jwt.verify(
      token,
      process.env.JSON_ACCOUNT_ACTIVATION_TOKEN
    )

    const userId = decodedToken.userId

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, data: 'User not found' })
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, data: 'Account already verified' })
    }

    user.isVerified = true
    await user.save()
    res
      .status(200)
      .json({ success: true, data: ' account activated succfully' })
  } catch (err) {
    next(err)
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email }).populate('profile')

    if (!user) {
      return res.status(400).json({ success: false, data: 'User not Found' })
    }
    const token = crypto.randomBytes(20).toString('hex')

    user.resetToken = token
    user.resetTokenExpiry = Date.now() + 60 * 60 * 10000 //1 hour
    await user.save()
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password reset request',
      html: `
        <p>Hi ${user.profile.firstName},</p>
        <p>You requested a password reset for your account. Please click the link below to reset your password.</p>
        <a href="${process.env.CLIENT_URL}/reset-password/${token}">${process.env.CLIENT_URL}/reset-password/${token}</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    res.status(200).json({
      success: true,
      message: 'Reset Password Link sent to Your email',
    })
  } catch (err) {
    next(err)
  }
}
const resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token
    const { password } = req.body

    //find the the to reset the password
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    }).populate('profile')

    console.log({ user })
    if (!user) {
      return res
        .status(400)
        .json({ success: false, data: 'Invalid or expired token' })
    }
    user.password = password
    user.resetToken = null
    user.resetTokenExpiry = null
    await user.save()
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password reset successful',
      html: `
         <p>Hi ${user.profile.firstName},</p>
         <p>Your password has been successfully reset.</p>
         <p>If you did not perform this action, please contact us immediately at ${process.env.SUPPORT_EMAIL}.</p>
       `,
    }
    await transporter.sendMail(mailOptions)

    res
      .status(200)
      .json({ success: true, message: 'password reset successful' })
  } catch (err) {
    next(err)
  }
}
module.exports = {
  registerController,
  sendVerificationEmail,
  forgotPassword,
  resetPassword,
  verifyAccount,
  loginController,
  updateProfile,
  serveImage,
  dashboardController,
}
