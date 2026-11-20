const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../schema/users')
usersRouter.get('/', async (req, res) => {
  const users = await User.find()

  const usersInfo = users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    blogs: user.blogs.length,
  }))

  res.status(200).json(usersInfo)
})
usersRouter.post('/',async(req,res)=>{
    const{name,username,password}=req.body;
    const salt=10;
    const passhash=await bcrypt.hash(password,salt);
    const usr=new User({
        name,
        username,
        passwordHash: passhash
    })
    const saved=await usr.save()
    res.status(201).json(saved)
})
module.exports = usersRouter