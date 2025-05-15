const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: '/images/avatars/avatar1.png'
  },
  bio: {
    type: String,
    default: ''
  },
  userLevel: {
    type: String,
    default: 'Noob Camper'
  }
});

module.exports = mongoose.model('User', userSchema);
