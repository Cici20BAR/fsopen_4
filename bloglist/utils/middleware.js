const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../schema/users')

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method)
  logger.info('Path:  ', req.path)
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? { ...req.body }
    : req.body
  if (body && Object.prototype.hasOwnProperty.call(body, 'password')) {
    body.password = '[REDACTED]'
  }
  logger.info('Body:  ', body)
  logger.info('---')
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: 'unknown endpoint' })
}
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.slice(7).trim()
    if (token) {
      req.token = token
    }
  }
  next()
}

const userExtractor = async (req, res, next) => {
  if (!req.token) {
    return res.status(401).json({ error: 'token missing' })
  }

  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    if (!decodedToken || typeof decodedToken !== 'object' || typeof decodedToken.id !== 'string') {
      return res.status(401).json({ error: 'token invalid' })
    }

    const user = await User.findById(decodedToken.id)

    if (!user) {
      return res.status(401).json({ error: 'user not found' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'token invalid' })
    }
    next(error)
  }
}

const errorHandler = (error, req, res, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  return res.status(500).json({ error: 'internal server error' })
}

module.exports = { tokenExtractor, userExtractor, requestLogger, unknownEndpoint, errorHandler }
