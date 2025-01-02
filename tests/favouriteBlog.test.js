const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const {listWithOneBlog, listWithMultipleBlogs} = require('./test_helper')

describe('favourite blog tests', () => {
    test('when list has 0 blogs we should return empty object', () => {
        const result = listHelper.favouriteBlog([])
        assert.deepStrictEqual(result, {})
    })

    test('when list has only one blog it\'s also the most liked', () => {
        const result = listHelper.favouriteBlog(listWithOneBlog)
        assert.deepStrictEqual(result, listWithOneBlog[0])
    })

    test('Favourite from multiple blogs', () => {
        const result = listHelper.favouriteBlog(listWithMultipleBlogs)
        assert.deepStrictEqual(result, listWithMultipleBlogs[2])
    })
})