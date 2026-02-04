const requestsRouter = require('express').Router()
const DocumentRequest = require('../models/documentRequest')
const middleware = require('../utils/middleware')
const axios = require('axios')

requestsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { documentType, paymentMethod, amount } = request.body
  const user = request.user

  const newRequest = new DocumentRequest({
    student: user._id,
    documentType,
    paymentMethod,
    amount,
    status: 'PENDING'
  })

  let checkoutUrl = null

  if (paymentMethod === 'ONLINE') {
    try {
      const options = {
        method: 'POST',
        url: 'https://api.paymongo.com/v1/checkout_sessions',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString('base64')}`
        },
        data: {
          data: {
            attributes: {
              send_email_receipt: true,
              show_description: true,
              show_line_items: true,
              line_items: [
                {
                  amount: amount * 100,
                  currency: 'PHP',
                  name: documentType,
                  quantity: 1
                }
              ],
              payment_method_types: ['gcash', 'paymaya', 'card'],
              description: `request for ${documentType} - Student LRN: ${user.lrn}`
            }
          } 
        }
      }

      const paymongoRes = await axios.request(options)
      checkoutUrl = paymongoRes.data.data.attributes.checkout_url
      newRequest.paymentSessionId = paymongoRes.data.data.id
    }
    catch (error) {
      console.error('Paymongo Error: ', error.response ? error.response.data : error.message)
      return response.status(500).json({ error: 'Failed to create payment session' })
    }
  }

  const savedRequest = await newRequest.save()

  user.requests = user.requests.concat(savedRequest._id)
  await user.save()

  response.status(201).json({
    message: paymentMethod === 'ONLINE' ? 'Payment link generated' : 'Request submitted for cash payment',
    request: savedRequest,
    checkoutUrl
  })
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

module.exports = requestsRouter