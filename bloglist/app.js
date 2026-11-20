const express = require('express')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controller/controller')
const usersRouter = require('./controller/user')
const loginRouter = require('./controller/login')
const app = express()

app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)
if (process.env.NODE_ENV === 'test') {
  app.use('/api/testing', require('./controller/testing'))
}
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app
