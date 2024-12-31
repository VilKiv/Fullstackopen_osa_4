const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const {listWithOneBlog, listWithMultipleBlogs} = require('./test_helper')

describe('Most blogs', () => {
    const mostInSingleBlog = {author:"Edsger W. Dijkstra", blogs: 1}
    const MostInMultipleBlogsList = {author:"Robert C. Martin", blogs: 3}

    test('when list has 0 blogs we should return empty object', () => {
        const result = listHelper.mostBlogs([])
        assert.deepStrictEqual(result, {})
    })

    test('when list has only one author they have also the most blogs', () => {
        const result = listHelper.mostBlogs(listWithOneBlog)
        assert.deepStrictEqual(result, mostInSingleBlog)
    })

    test('Favourite from multiple blogs', () => {
        const result = listHelper.mostBlogs(listWithMultipleBlogs)
        assert.deepStrictEqual(result, MostInMultipleBlogsList)
    })
})