const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const middleware = require('../utils/middleware')


usersRouter.post('/', middleware.userNamePasswordValidator, async (request, response) => {
  const { username, name, password } = request.body

  // if (!username || username.length < 3) {
  //   return response.status(400).json({error:'The minimum length for username is 3'})
  // } 
  // else if (!password || password.length < 3) {
  //   return response.status(400).json({error:'The minimum length for password is 3'})
  // }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs',{title:1,author:1,url:1,likes:1})
    response.json(users)
})

module.exports = usersRouter