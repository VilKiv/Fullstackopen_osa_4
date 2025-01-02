const { test, after, beforeEach, describe, it } = require('node:test')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const supertest = require('supertest')
const assert = require('node:assert')
const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app')
const helper = require('./test_helper')
const { listWithMultipleBlogs, nonExistingId, blogsInDb } = require('./test_helper')

const api = supertest(app)


describe('The blogs can be retrieved', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        await Blog.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'blogTestUser', passwordHash })
        await user.save()
    
        const initialBlogs = listWithMultipleBlogs.map(b => {return {...b,user: user._id}})
        await Blog.insertMany(initialBlogs)
    })

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
    beforeEach(async () => {
        await User.deleteMany({})
        await Blog.deleteMany({})
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'blogTestUser', passwordHash })
        await user.save()
    
        const initialBlogs = listWithMultipleBlogs.map(b => {return {...b,user: user._id}})
        // console.log(initialBlogs[0])
        await Blog.insertMany(initialBlogs)
    })

    const newBlog = {
        title: 'Exploring The Difference Between Using async/await In A for Loop And forEach',
        author: 'Potato Script',
        url: 'https://medium.com/@potatoscript/exploring-the-difference-between-using-async-await-in-a-for-loop-and-foreach-739c9ebeb64a',
        likes: 0,
    }

    const user = await User.findOne({ username: 'blogTestUser' })
    const userForToken = {
        username: user.username,
        id: user._id,
    }

    const token = jwt.sign(
        userForToken,
        process.env.SECRET,
        { expiresIn: 60 }
    )

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const contents = response.body.map(blog => blog.title)

    assert.strictEqual(response.body.length, listWithMultipleBlogs.length + 1)

    assert(contents.includes('Exploring The Difference Between Using async/await In A for Loop And forEach'))
})

describe('The blogs are validated before saving into database and retrieval from there', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        await Blog.deleteMany({})
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'blogTestUser', passwordHash })
        await user.save()
    
        const initialBlogs = listWithMultipleBlogs.map(b => {return {...b,user: user._id}})
        await Blog.insertMany(initialBlogs)
    })

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

        const user = await User.findOne({ username: 'blogTestUser' })
        const userForToken = {
            username: user.username,
            id: user._id,
        }

        const token = jwt.sign(
            userForToken,
            process.env.SECRET,
            { expiresIn: 60 }
        )

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
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

        const user = await User.findOne({ username: 'blogTestUser' })
        const userForToken = {
            username: user.username,
            id: user._id,
        }

        const token = jwt.sign(
            userForToken,
            process.env.SECRET,
            { expiresIn: 60 }
        )

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
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

        const user = await User.findOne({ username: 'blogTestUser' })
        const userForToken = {
            username: user.username,
            id: user._id,
        }

        const token = jwt.sign(
            userForToken,
            process.env.SECRET,
            { expiresIn: 60 }
        )

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
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

describe('deletion of a blog', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        await Blog.deleteMany({})
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'blogTestUser', passwordHash })
        await user.save()
    
        const initialBlogs = listWithMultipleBlogs.map(b => {return {...b,user: user._id}})
        await Blog.insertMany(initialBlogs)
    })

    test('Deletion succeeds with status code 204 if blog with given id exists and is deleted by valid user', async () => {
        const blogsAtStart = await blogsInDb()
        const blogToDelete = blogsAtStart[0]

        const user = await User.findOne({ username: 'blogTestUser' })
        const userForToken = {
            username: user.username,
            id: user._id,
        }

        const token = jwt.sign(
            userForToken,
            process.env.SECRET,
            { expiresIn: 60 }
        )

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const blogsAtEnd = await blogsInDb()

        assert.strictEqual(blogsAtEnd.length, listWithMultipleBlogs.length - 1)

        const titles = blogsAtEnd.map(r => r.title)
        assert(!titles.includes(blogToDelete.title))
    })

    test('Deletion fails if the userID in blog differs from the user\'s doing request', async () => {
        const blogsAtStart = await blogsInDb()
        const blogToDelete = blogsAtStart[0]

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'maliciousone', passwordHash })
        await user.save()


        const userForToken = {
            username: user.username,
            id: user._id,
        }

        const token = jwt.sign(
            userForToken,
            process.env.SECRET,
            { expiresIn: 60 }
        )

        const result = await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(401)

        const blogsAtEnd = await blogsInDb()

        assert(result.body.error.includes('User can only delete the blogs they have created'))
        assert.strictEqual(blogsAtEnd.length, listWithMultipleBlogs.length)
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

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        await Blog.deleteMany({})
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'blogTestUser', passwordHash })
        await user.save()
    
        const initialBlogs = listWithMultipleBlogs.map(b => {return {...b,user: user._id}})
        await Blog.insertMany(initialBlogs)
    })

    test('creation succeeds with a fresh username', async () => {

        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'VilKiv',
            name: 'Ville Kivioja',
            password: 'salasana123',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })

    test('User creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'blogTestUser',
            name: 'Superuser',
            password: 'salasana123',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        console.log(usersAtEnd.length)
        assert(result.body.error.includes('expected `username` to be unique'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('User creation fails with proper statuscode and message if username is too short or doesn\'t exist', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            name: 'Superuser',
            password: 'salasana123',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('The minimum length for username is 3'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('User creation fails with proper statuscode and message if password is too short or doesn\'t exist', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Admin',
            name: 'Superuser',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('The minimum length for password is 3'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

after(async () => {
    await User.deleteMany({})
    await mongoose.connection.close()
})