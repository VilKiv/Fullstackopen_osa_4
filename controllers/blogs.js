const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('./../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')



blogRouter.get('/',async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogRouter.post('/',middleware.userExtractor,async (request, response) => {
    const user = await User.findById(request.user.id)
    const blog = new Blog({...request.body,user:user._id})

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})

blogRouter.delete('/:id',middleware.userExtractor, async(request, response) => {
    const blogToBeDeleted = await Blog.findById(request.params.id).populate('user')
    if (!blogToBeDeleted) {
        return response.status(400).json({error: 'The blog with given id doesn\'t exist or has already been deleted'})
    }
    const userIdInBlog = blogToBeDeleted.user.id.toString()

    const user = await User.findById(request.user.id)
    if (!user) {
        return response.status(400).json({error: 'The user doesn\'t exist'})
    }
    const deletersId = user.id.toString()

    if (userIdInBlog !== deletersId) {
        return response.status(401).json({error: 'User can only delete the blogs they have created'})
    }
    await Blog.findByIdAndDelete(request.params.id)

    user.blogs = user.blogs.filter(blog => blog._id.toString() !== request.params.id)
    await user.save()

    response.status(204).end()
})

blogRouter.put('/:id', async(request, response) => {
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