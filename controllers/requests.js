const requestsRouter = require('express').Router()
const DocumentRequest = require('../models/documentRequest')
const middleware = require('../utils/middleware')
const axios = require('axios')

requestsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { documentType, paymentMethod, amount } = request.body
  const user = request.user

  let checkoutUrl = null

  if (paymentMethod === 'ONLINE') {
    checkoutUrl = 'https://pm.link/mock-payment-page'
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

  response.status(201).json({
    message: paymentMethod === 'ONLINE' ? 'Payment link generated' : 'Request submitted for cash payment',
    request: savedRequest,
    checkoutUrl
  })
})

module.exports = requestsRouter