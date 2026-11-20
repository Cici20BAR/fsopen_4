const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../schema/users')

loginRouter.post('/', async (req, res, next) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' })
    }

    const user = await User.findOne({ username })
    const passwordCorrect = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false

    if (!passwordCorrect) {
      return res.status(401).json({ error: 'invalid username or password' })
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    }
    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: '60h' })
    return res.status(200).json({
      token,
      username: user.username,
      name: user.name,
      id: user._id.toString()
    })
  } catch (error) {
    return next(error)
  }
})

module.exports = loginRouter