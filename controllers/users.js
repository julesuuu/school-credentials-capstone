const bcrypt = require('bcrypt')
const User = require('../models/user')

const register = async (request, response) => {
  const { username, name, email, password, role, lrn } = request.body

  if (!password || password.length < 6) {
    return response.status(400).json({ error: 'password must be atleast 6 characters long' })
  }

  if (role === 'STUDENT') {
    if (!lrn || lrn.length !== 12) {
      return response.status(400).json({ error: 'LRN must be exactly 12 digits' })
    }
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    email,
    passwordHash,
    role: role || 'STUDENT',
    lrn: role === 'ADMIN' ? undefined : lrn
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
}

module.exports = { register } 