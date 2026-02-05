const requestsRouter = require('express').Router()
const Appointment = require('../models/appointment')
const DocumentRequest = require('../models/documentRequest')
const middleware = require('../utils/middleware')
const axios = require('axios')

requestsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { documentType, paymentMethod, amount, appointmentId } = request.body
  const user = request.user

  const existingRequest = await DocumentRequest.findOne({
    student: user._id,
    documentType: documentType,
    status: { $in: ['PENDING', 'PAID', 'PROCESSING', 'READY_FOR_PICKUP'] }
  })

  if (existingRequest) {
    return response.status(400).json({
      error: `You already have an activte request for ${documentType}. Please wait for it to be completed.`
    })
  }

  const newRequest = new DocumentRequest({
    student: user._id,
    documentType,
    paymentMethod,
    amount,
    status: 'PENDING'
  })

  const savedRequest = await newRequest.save()
  user.requests = user.requests.concat(savedRequest._id)
  await user.save()

  response.status(201).json(savedRequest)
})

requestsRouter.post('/webhook', async (request, response) => {
  const payload = request.body

  if (payload.data.attributes.type === 'checkout_session.payment.paid') {
    const sessionId = payload.data.attributes.data.id

    const docRequest = await DocumentRequest.findOne({ paymentSessionId: sessionId })

    if (docRequest) {
      docRequest.status = 'PAID'
      await docRequest.save()
      console.log(`Request ${docRequest._id} marked as PAID automatically.`)
    }
  }

  response.status(200).send('Webhook received')
})

requestsRouter.patch('/:id/book-appointment', middleware.userExtractor, async (request, response) => {
  const { appointmentId } = request.body
  const docRequest = await DocumentRequest.findById(request.params.id)

  if (docRequest.status !== 'READY_FOR_PICKUP') {
    return response.status(400).json({ error: 'Document is not ready for pickup yet.' })
  }

  await Appointment.findByIdAndUpdate(appointmentId, { 
    $addToSet: { bookedStudents: request.user._id } 
  })
  
  docRequest.appointment = appointmentId
  await docRequest.save()

  response.json(docRequest)
})

requestsRouter.post('/:id/pay', middleware.userExtractor, async (request, response) => {
  const docRequest = await DocumentRequest.findById(request.params.id)
  const user = request.user

  if (!docRequest || docRequest.status !== 'PENDING') {
    return response.status(400).json({ error: 'Request cannot be paid at this stage.' })
  }

  try {
    const options = {
      method: 'POST',
      url: 'https://api.paymongo.com/v1/checkout_sessions',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`
      },
      data: {
        data: {
          attributes: {
            payment_method_types: ['gcash', 'card'],
            line_items: [{
              amount: docRequest.amount * 100,
              currency: 'PHP',
              name: docRequest.documentType,
              quantity: 1
            }],
            description: `Payment for ${docRequest.documentType} - LRN: ${user.lrn}`
          }
        }
      }
    }

    const paymongoRes = await axios.request(options)
    
    docRequest.paymentSessionId = paymongoRes.data.data.id
    docRequest.paymentMethod = 'ONLINE'
    await docRequest.save()

    response.json({
      checkoutUrl: paymongoRes.data.data.attributes.checkout_url
    })
  } catch (error) {
    console.error('Paymongo Error:', error.response?.data || error.message)
    response.status(500).json({ error: 'Failed to generate payment link' })
  }
})

module.exports = requestsRouter