const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  lrn: {
    type: String,
    unique: true,
    sparse: true,
    minlength: 12,
    maxlength: 12,
    required: function() { return this.role === 'STUDENT' }
  },
  passwordHash: String,
  role: {
    type: String,
    enum: ['STUDENT', 'ADMIN'],
    default: 'STUDENT'
  },
  requests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocumentRequest'
    }
  ]
})