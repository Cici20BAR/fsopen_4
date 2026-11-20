const mongoose = require('mongoose')
const testingRouter = require('express').Router()
const Blog = require('../schema/blogs')
const User = require('../schema/users')
const config = require('../utils/config')

const databaseNameFromUri = (uri) => new URL(uri).pathname.slice(1)

testingRouter.post('/reset', async (req, res, next) => {
  try {
    const testDatabaseName = databaseNameFromUri(config.MONGODB_URI)
    const productionDatabaseName = process.env.MONGODB_URI
      ? databaseNameFromUri(process.env.MONGODB_URI)
      : null

    if (
      process.env.NODE_ENV !== 'test' ||
      config.MONGODB_URI !== process.env.TEST_MONGODB_URI ||
      !testDatabaseName ||
      testDatabaseName === productionDatabaseName ||
      mongoose.connection.name !== testDatabaseName
    ) {
      return res.status(403).json({ error: 'reset requires an isolated test database' })
    }

    await Promise.all([
      Blog.deleteMany({}),
      User.deleteMany({})
    ])

    return res.status(204).end()
  } catch (error) {
    return next(error)
  }
})

module.exports = testingRouter
