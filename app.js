const config = require('./utils/config')

const express = require('express')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const mongoose = require('mongoose')
const Blog = require('./models/blog')

mongoose.connect(config.MONGODB_URI)

app.use(cors())
app.use(express.json())

app.use('',blogsRouter)
module.exports = app 