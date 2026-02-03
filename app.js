const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const usersRouter = require('./routes/users')
const loginRouter = require('./routes/login')
const requestsRouter = require('./controllers/requests')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/requests', requestsRouter)

app.get('/api/users/me', middleware.userExtractor, (request, response) => {
  response.json(request.user)
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app