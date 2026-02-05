const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  session: {
    type: String,
    enum: ['AM', 'PM'] ,
    required: true
  },
  maxCapacity: {
    type: Number,
    default: 50
  },
  bookedStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

appointmentSchema.index({ date: 1, session: 1 }, { unique: true })

appointmentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Appointment', appointmentSchema)