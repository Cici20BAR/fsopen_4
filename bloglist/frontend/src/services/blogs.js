import axios from 'axios'

const baseUrl = '/api/blogs'

const authorization = (token) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {}

const getAll = async (token) => {
  const response = await axios.get(baseUrl, authorization(token))
  return response.data
}

const create = async (blog, token) => {
  const response = await axios.post(baseUrl, blog, authorization(token))
  return response.data
}
const like = async (blog, token) => {
  const response = await axios.put(
    `${baseUrl}/${blog.id}`,
    { likes: (blog.likes || 0) + 1 },
    authorization(token),
  )
  return response.data
}

const remove = async (blog, token) => {
  await axios.delete(`${baseUrl}/${blog.id}`, authorization(token))
}
const comment = async (blogId, commentText) => {
  const response = await axios.post(`${baseUrl}/${blogId}/comments`, {
    comment: commentText,
  })
  return response.data
}

export default { getAll, create, like, remove, comment }
