const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  description: String,
  duration: Number,
  date: String,
  // date: {
  //   type: Date,
  //   default: new Date()
  // },
  count: Number,
  log : [Object],
})

module.exports = mongoose.model('user', userSchema);