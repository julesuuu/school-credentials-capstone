const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    enum: ['Report Card', 'Transcript of Records', 'Good Moral', 'Diploma']
  },
  paymentMethod: {
    type: String,
    enum: ['ONLINE', 'CASH_ON_PICKUP'],
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: [
      'PENDING',
      'PROCESSING',
      'READY_FOR_PICKUP',
      'COMPLETED'
    ],
    default: 'PENDING'
  },
  paymentSessionId: String,
  amount: Number,
  dateRequested: {
    type: Date,
    default: Date.now
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }
})

requestSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Request =  mongoose.model('DocumentRequest', requestSchema)

module.exports = Request