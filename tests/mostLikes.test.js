const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const {listWithOneBlog, listWithMultipleBlogs} = require('./test_helper')

describe('Most likes', () => {
    const mostInSingleBlog = {author:"Edsger W. Dijkstra", likes: 5}
    const MostInMultipleBlogsList = {author:"Edsger W. Dijkstra", likes: 17}

    test('when list has 0 blogs we should return empty object', () => {
        const result = listHelper.mostLikes([])
        assert.deepStrictEqual(result, {})
    })

    test('when list has only one author they have also the most blogs', () => {
        const result = listHelper.mostLikes(listWithOneBlog)
        assert.deepStrictEqual(result, mostInSingleBlog)
    })

    test('Favourite from multiple blogs', () => {
        const result = listHelper.mostLikes(listWithMultipleBlogs)
        assert.deepStrictEqual(result, MostInMultipleBlogsList)
    })
})