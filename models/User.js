const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Value is Required'],
    unique: [true, 'Email Must be Unique'],
    trim: true,
    lowercase: true,
    validate: {
      validator: (value) => {
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(value)
      },
      message: (props) => `${props.value} is not a valid email`,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'please Provide a password of at least 8 character'],
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetToken: {
    type: String,
  },
  resetTokenExpiry: {
    type: Date,
  },
  todos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Todo',
    },
  ],
  roles: {
    type: [
      {
        type: String,
        enum: ['user', 'admin'],
      },
    ],
    default: ['user'],
  },
})

//hasing password before saving
userSchema.pre('save', async function (next) {
  const user = this
  if (!user.isModified('password')) return next()
  const salt = await bcrypt.genSalt()
  const hash = await bcrypt.hash(user.password, salt)
  user.password = hash
  next()
})

userSchema.methods.checkPassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password)
  return isMatch
}
//users collection
module.exports = mongoose.model('User', userSchema)
