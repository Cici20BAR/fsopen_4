const mongoose = require('mongoose')
const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

const start = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, { family: 4 })
    logger.info('connected to MongoDB')
    app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`)
    })
  } catch (error) {
    console.error('error connecting to MongoDB:', error.message)
    process.exitCode = 1
  }
}

start()
