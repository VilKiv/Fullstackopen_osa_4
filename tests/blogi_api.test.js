const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const Blog = require('../models/blog')
const app = require('../app')

const { listWithMultipleBlogs, nonExistingId, blogsInDb } = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    for (const blog of listWithMultipleBlogs) {
        let blogObject = new Blog(blog)
        await blogObject.save()
    }
})

describe('The blogs can be retrieved', () => {
    test('Bloglist is returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
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

describe('The blogs are validated before saving into database and retrieval from there', () => {
    test('The blog has id instead of _id', async () => {
        const response = await api.get('/api/blogs')
        return response.body[0].id && !response.body[0]._id
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

        assert.strictEqual(response.body.length, listWithMultipleBlogs.length)
    })

    test('blog without url is not added', async () => {
        const newBlog = {
            title: 'Exploring The Difference Between Using async/await In A for Loop And forEach',
            author: 'Potato Script',
            likes: 8,
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, listWithMultipleBlogs.length)
    })

    test('The default value for blog\'s likes is 0', async () => {
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
})

describe('Individual blogs can be updated and deleted. Trying to access nonexisting blog gives 404', () => {
    describe('deletion of a blog', () => {
        test('succeeds with status code 204 if id is valid', async () => {
            const blogsAtStart = await blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(204)

            const blogsAtEnd = await blogsInDb()

            assert.strictEqual(blogsAtEnd.length, listWithMultipleBlogs.length - 1)

            const titles = blogsAtEnd.map(r => r.title)
            assert(!titles.includes(blogToDelete.title))
        })
    })

    describe('Updating blog\'s information', () => {
        test('Blog\'s likes can be changed', async () => {
            const blogsAtStart = await blogsInDb()
            const oldVersionOfBlog = { ...blogsAtStart[0] }

            const result = await api
                .put(`/api/blogs/${oldVersionOfBlog.id}`)
                .send({ ...blogsAtStart[0], likes: blogsAtStart[0].likes + 10 })
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const updatedBlog = result.body

            assert.strictEqual(oldVersionOfBlog.id, updatedBlog.id)
            assert.strictEqual(oldVersionOfBlog.title, updatedBlog.title)
            assert.strictEqual(oldVersionOfBlog.author, updatedBlog.author)
            assert.strictEqual(updatedBlog.likes, oldVersionOfBlog.likes + 10)
        })
    })

    test('Trying to access nonexisting blog gives 404', async () => {
        const validNonExistingId = await nonExistingId()

        await api
            .get(`/api/blogs/${validNonExistingId}`)
            .expect(404)
    })
})


after(async () => {
    await mongoose.connection.close()
})