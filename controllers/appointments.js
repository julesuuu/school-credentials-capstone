const appointmentsRouter = require('express').Router()
const Appointment = require('../models/appointment')
const { userExtractor, adminValidator } = require('../utils/middleware')

appointmentsRouter.get('/', async (request, response) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const appointments = await Appointment.find({ date: { $gte: today } })
  
  const availableSlots = appointments.filter(app => 
    app.bookedStudents.length < app.maxCapacity
  )
  
  response.json(availableSlots)
})

appointmentsRouter.post('/', userExtractor, adminValidator, async (request, response) => {
  const { date, session, maxCapacity } = request.body

  const newAppointment = new Appointment({
    date: new Date(date),
    session,
    maxCapacity: maxCapacity || 50,
    bookedStudents: []
  })

  const saved = await newAppointment.save()
  response.status(201).json(saved)
})

module.exports = appointmentsRouter