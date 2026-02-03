const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  maxCapacity: {
    type: Number,
    default: 10
  },
  bookedStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

appointmentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Appointment = mongoose.model('Appointment', appointmentSchema)

module.exports = Appointment