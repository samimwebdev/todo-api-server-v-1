const nodemailer = require('nodemailer')

//smtp (mailtrap)

const isDevelopment = process.env.NODE_ENV === 'development'
const emailConfig = {
  host: isDevelopment
    ? process.env.EMAIL_DEV_HOST
    : process.env.EMAIL_PROD_HOST,
  port: isDevelopment
    ? process.env.EMAIL_DEV_PORT
    : process.env.EMAIL_PROD_PORT,
  auth: {
    user: isDevelopment
      ? process.env.EMAIL_DEV_USERNAME
      : process.env.EMAIL_PROD_USERNAME,
    pass: isDevelopment
      ? process.env.EMAIL_DEV_PASSWORD
      : process.env.EMAIL_PROD_PASSWORD,
  },
}

//abc@gmail.com- mailtrap(trapping)- bcd@gmail.com
const transporter = nodemailer.createTransport(emailConfig)

module.exports = { transporter }
