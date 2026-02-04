const adminRouter = require('express').Router()
const DocumentRequest = require('../models/documentRequest')
const { userExtractor, adminValidator } = require('../utils/middleware')

adminRouter.get('/requests', userExtractor, adminValidator, async (request, response) => {
  const requests = await DocumentRequest.find({})
    .populate('student', { username: 1, name: 1, lrn: 1 })
    
  response.json(requests)
})

adminRouter.patch('/requests/:id', userExtractor, adminValidator, async (request, response) => {
  const { status } = request.body

  const updatedRequest = await DocumentRequest
    .findByIdAndUpdate(
      request.params.id,
      { status },
      { new: true, runValidators: true }
  )

  if (!updatedRequest) {
    return response.status(404).json({ error: 'request not found' })
  }
  
  response.json(updatedRequest)
})

module.exports = adminRouter