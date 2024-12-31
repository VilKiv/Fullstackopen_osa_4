const morgan = require('morgan')

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
  next(error)
}

module.exports = {
  morgan,
  unknownEndpoint,
  errorHandler
}