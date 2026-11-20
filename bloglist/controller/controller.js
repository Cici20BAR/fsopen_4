const blogRouter = require('express').Router()
const Blog = require('../schema/blogs')
const middleware = require('../utils/middleware')

blogRouter.get('/', async (req, res, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', {
      name: 1,
      username: 1
    })
    res.json(blogs)
  } catch (error) {
    next(error)
  }
})
blogRouter.post('/:id/comments', async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ error: 'blog not found' })
    }

    if (typeof req.body.comment !== 'string' || !req.body.comment.trim()) {
      return res.status(400).json({ error: 'comment is required' })
    }

    blog.comments.push(req.body.comment.trim())
    await blog.save()

    return res.json(blog)
  } catch (error) {
    return next(error)
  }
})

blogRouter.post('/', middleware.userExtractor, async (req, res, next) => {
  try {
    const body = req.body
    const user = req.user

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes ?? 0,
      ...(user && { user: user._id })
    })

    const savedBlog = await blog.save()

    if (user) {
      user.blogs = user.blogs.concat(savedBlog._id)
      await user.save()
    }

    res.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogRouter.put('/:id', middleware.userExtractor, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ error: 'blog not found' })
    }

    const { title, author, url, likes } = req.body
    const isOwner = blog.user && blog.user.toString() === req.user._id.toString()
    const isLikesOnlyUpdate =
      Object.keys(req.body).length === 1 && likes !== undefined

    if (!isOwner && !isLikesOnlyUpdate) {
      return res.status(403).json({ error: 'not authorized' })
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined && { title }),
        ...(author !== undefined && { author }),
        ...(url !== undefined && { url }),
        ...(likes !== undefined && { likes })
      },
      { new: true, runValidators: true }
    ).populate('user', {
      name: 1,
      username: 1
    })
    res.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

blogRouter.delete('/:id', middleware.userExtractor, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({ error: 'blog not found' })
    }

    if (!blog.user || blog.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'not authorized' })
    }

    await blog.deleteOne()
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = blogRouter
