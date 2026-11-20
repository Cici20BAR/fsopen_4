const isTestEnv = process.env.NODE_ENV === 'test'

const info = (...args) => {
  if (!isTestEnv) console.log(...args)
}

const error = (...args) => {
  if (!isTestEnv) console.error(...args)
}

module.exports = { info, error }
