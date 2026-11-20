const { test, describe, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const supertest = require('supertest')
const app = require('../app')
const config = require('../utils/config')
const Blog = require('../schema/blogs')
const User = require('../schema/users')
const api = supertest(app)

const initialBlogs = [
  {
    title: 'First blog post',
    author: 'Cinca Rares',
    url: 'http://example.com/first',
    likes: 5
  },
  {
    title: 'Second blog post',
    author: 'Alexandru',
    url: 'http://example.com/second',
    likes: 10
  }
]

describe('blog API', () => {
  let testUser
  let otherUser
  const authorization = () => `Bearer ${jwt.sign(
    { username: testUser.username, id: testUser._id.toString() },
    process.env.SECRET
  )}`

  before(async () => {
    await mongoose.connect(config.MONGODB_URI, { family: 4 })
  })

  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})
    testUser = await User.create({
      name: 'Rares Cinca',
      username: 'rares',
      passwordHash: 'secret'
    })
    otherUser = await User.create({
      name: 'Alexandru',
      username: 'alex',
      passwordHash: 'secret'
    })
    await Blog.insertMany([
      { ...initialBlogs[0], user: testUser._id },
      { ...initialBlogs[1], user: otherUser._id }
    ])
  })

  test('test reset endpoint removes blogs and users', async () => {
    await api.post('/api/testing/reset').expect(204)

    assert.equal(await Blog.countDocuments({}), 0)
    assert.equal(await User.countDocuments({}), 0)
  })

  test('getting blogs does not require an authentication token', async () => {
    const response = await api.get('/api/blogs').expect(200)
    assert.equal(response.body.length, 2)
  })

  test('blogs are returned as JSON', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', authorization())
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.equal(response.body.length, 2)
  })

  test('blogs include populated user details', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', authorization())
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepEqual(response.body[0].user, {
      id: testUser.id,
      name: 'Rares Cinca',
      username: 'rares'
    })
    assert.equal(response.body[0].user.passwordHash, undefined)
  })

  test('blog IDs are returned as id, not _id', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', authorization())
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.ok(response.body[0].id)
    assert.equal(response.body[0]._id, undefined)
  })

describe('creating, updating and deleting blogs', () => {
test('creating a blog requires an authentication token', async () => {
  await api
    .post('/api/blogs')
    .send({
      title: 'Unauthenticated blog',
      author: 'Alex',
      url: 'https://example.com/unauthenticated'
    })
    .expect(401)
})

test('likes defaults to 0 when omitted from a new blog', async () => {
  const newBlog = {
    title: 'My first API test',
    author: 'Alex',
    url: 'https://example.com/my-first-api-test'
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', authorization())
    .send(newBlog)
    .expect(201)

  assert.equal(response.body.likes, 0)
})
test("400 bad req tst",async()=>{
    const newBlog={
            title: 'My first API test',

    author: 'Alex',

    }
      const response = await api
        .post('/api/blogs')
        .set('Authorization', authorization())
        .send(newBlog)
        .expect(400)


})

test('a blog can be deleted by its id', async () => {
  const blogsAtStart = await api
    .get('/api/blogs')
    .set('Authorization', authorization())
    .expect(200)
  const blogToDelete = blogsAtStart.body[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', authorization())
    .expect(204)

  const blogsAfterDelete = await api
    .get('/api/blogs')
    .set('Authorization', authorization())
    .expect(200)

  assert.equal(blogsAfterDelete.body.length, blogsAtStart.body.length - 1)
  assert.equal(
    blogsAfterDelete.body.some((blog) => blog.id === blogToDelete.id),
    false
  )
})

test('a blog likes count can be updated', async () => {
  const blogsAtStart = await api
    .get('/api/blogs')
    .set('Authorization', authorization())
    .expect(200)
  const blogToUpdate = blogsAtStart.body[0]

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', authorization())
    .send({ ...blogToUpdate, likes: 12 })
    .expect(200)

  assert.equal(response.body.likes, 12)
})
})

  after(async () => {
    await mongoose.disconnect()
  })
})