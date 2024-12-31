const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')
const Blog = require('./models/blog')

app.use(cors())
app.use(express.json())
// app.use(middleware.morgan('custom'))

mongoose.connect(config.MONGODB_URI)

app.use('',blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app