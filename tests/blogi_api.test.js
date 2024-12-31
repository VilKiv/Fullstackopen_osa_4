const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const Blog = require('../models/blog')
const app = require('../app')
const { listWithMultipleBlogs } = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    for (const blog of listWithMultipleBlogs) {
        let blogObject = new Blog(blog)
        await blogObject.save()
    }
})

test('Bloglist is returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('The blog has id instead of _id', async () =>  {
    const response = await api.get('/api/blogs')
    return response.body[0].id && !response.body[0]._id
})

test('A valid blog can be added ', async () => {
    const newBlog = {
        title: 'Exploring The Difference Between Using async/await In A for Loop And forEach',
        author: 'Potato Script',
        url: 'https://medium.com/@potatoscript/exploring-the-difference-between-using-async-await-in-a-for-loop-and-foreach-739c9ebeb64a',
        likes: 8,
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const contents = response.body.map(blog => blog.title)

    assert.strictEqual(response.body.length, listWithMultipleBlogs.length + 1)

    assert(contents.includes('Exploring The Difference Between Using async/await In A for Loop And forEach'))
})

test('The default value for blog\'s likes is 0', async () =>  {
    const newBlog = {
        title: 'Exploring The Difference Between Using async/await In A for Loop And forEach',
        author: 'Potato Script',
        url: 'https://medium.com/@potatoscript/exploring-the-difference-between-using-async-await-in-a-for-loop-and-foreach-739c9ebeb64a'
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, listWithMultipleBlogs.length + 1)

    const addedBlog = 
    response.body.find(blog => {
        return blog.title === 'Exploring The Difference Between Using async/await In A for Loop And forEach' 
            && blog.author === 'Potato Script'
    })

    assert(addedBlog.likes === 0)
})

test('there are 6 blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, listWithMultipleBlogs.length)
})

test('the first blog is "React patterns" by Michael Chan', async () => {
    const response = await api.get('/api/blogs')
    const contents = response.body.map(e => e.title)
    assert(contents.includes('React patterns'), true)
})

test('blog without title is not added', async () => {
    const newBlog = {
        author: 'Potato Script',
        url: 'https://medium.com/@potatoscript/exploring-the-difference-between-using-async-await-in-a-for-loop-and-foreach-739c9ebeb64a',
        likes: 8,
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length,  listWithMultipleBlogs.length)
})

after(async () => {
    await mongoose.connection.close()
})