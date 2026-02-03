require('dotenv').config()

const PORT = process.env.PORT || 3001
const MONGODB_URI = process.env.MONGODB_URI
const SECRET = process.env.SECRET
//PayMongo keys here
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY

module.exports = {
  MONGODB_URI,
  PORT,
  SECRET,
  PAYMONGO_SECRET_KEY
}