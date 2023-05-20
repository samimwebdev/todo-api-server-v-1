const mongoose = require('mongoose')
const profileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 10,
  },
  lastName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 10,
  },
  bio: String,
  website: String,
  image: String,
  social: {
    facebook: String,
    twitter: String,
    linkedin: String,
  },

  profilePic: {
    type: String,
  },
  age: {
    type: Number,
    default: 18,
    min: [18, 'Minors are not allowed'],
    max: [50, 'senior citizens are not allowed'],
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

module.exports = mongoose.model('Profile', profileSchema)
