const dummy = (blogs) => {
    console.log(1)
    return 1
}

const totalLikes = (blogs) => {
    const total = blogs.reduce((accumLikes, blog) => accumLikes += blog.likes, 0)
    return total
}

const favouriteBlog = (blogs) => {
    const favourite = blogs.reduce((currentFavourite, blog) => {
        if (!currentFavourite.likes || blog.likes > currentFavourite.likes) {
            currentFavourite = {...blog}
        }
        return currentFavourite;
    }, {})
    return favourite
}

const mostBlogs = (blogs) => {
    const BlogsPerAuthor = (blogsByAuthor, blog) => {
        if (!blogsByAuthor[blog.author]) {
            blogsByAuthor[blog.author]  = {author:blog.author,blogs:0}
        }
        blogsByAuthor[blog.author].blogs += 1
        if (!blogsByAuthor.mostBlogsBy.blogs || blogsByAuthor[blog.author].blogs > blogsByAuthor.mostBlogsBy.blogs) {
            blogsByAuthor.mostBlogsBy = {...blogsByAuthor[blog.author]}
        }
        return blogsByAuthor;
    }
    const result = blogs.reduce(BlogsPerAuthor, {mostBlogsBy:{}})["mostBlogsBy"]
    return result
}

const mostLikes = (blogs) => {
    const likesPerAuthor = (likesByAuthor, blog) => {
        if (!likesByAuthor[blog.author]) {
            likesByAuthor[blog.author]  = {author:blog.author,likes:0}
        }
        likesByAuthor[blog.author].likes += blog.likes
        if (!likesByAuthor.mostLikesBy.likes || likesByAuthor[blog.author].likes > likesByAuthor.mostLikesBy.likes) {
            likesByAuthor.mostLikesBy = {...likesByAuthor[blog.author]}
        }
        return likesByAuthor
    }
    const result = blogs.reduce(likesPerAuthor, {mostLikesBy:{}})["mostLikesBy"]
    return result
}

module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
    mostBlogs,
    mostLikes
}