const blogRouter = require('express').Router()
const Blog = require('./../models/blog')

blogRouter.get('/api/blogs',async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogRouter.post('/api/blogs', async (request, response) => {
    const blog = new Blog(request.body)
    const result = await blog.save()
    response.status(201).json(result)
})

module.exports = blogRouter