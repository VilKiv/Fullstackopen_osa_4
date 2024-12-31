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

blogRouter.delete('/api/blogs/:id', async(request, response) => {
    const result = await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

blogRouter.put('/api/blogs/:id', async(request, response) => {
    const {title,author,url,likes} = request.body
    const updatedBlog =
        await Blog.findByIdAndUpdate(
            request.params.id,
            {title, author, url, likes},
            {new: true, runValidators: true, context: 'query'}
        )
    response.status(200).json(updatedBlog)
})

module.exports = blogRouter