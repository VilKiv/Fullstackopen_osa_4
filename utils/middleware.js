const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


morgan.token('postBody', (request) => {
  return JSON.stringify(request.body)
})
morgan.format('custom', ':method :url :status :res[content-length] - :response-time ms :postBody')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  }
  else if (error.name === 'JsonWebTokenError') {
    return response.status(400).json({ error: 'token missing or invalid' })
  }
  else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }
  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  request.token = 
  (authorization && authorization.startsWith('Bearer ')) 
    ? authorization.replace('Bearer ', '') 
    : null
  next()
}

const userExtractor = (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.secret)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'Unauthorized' })
  }
  request.user = decodedToken
  next()
}

const userNamePasswordValidator = (request, response,next) => {
  const { username, name, password } = request.body

  if (!username || username.length < 3) {
    return response.status(400).json({error:'The minimum length for username is 3'})
  } 
  else if (!password || password.length < 3) {
    return response.status(400).json({error:'The minimum length for password is 3'})
  }
  next()
}

module.exports = {
  morgan,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
  userNamePasswordValidator
}