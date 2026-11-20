import { useParams } from 'react-router-dom'
import Blog from './Blog'

const blogUserId = (blog) =>
  typeof blog.user === 'string' ? blog.user : blog.user?.id

const UserBlogs = ({ users, blogs }) => {
  const { id } = useParams()
  const selectedUser = users.find((listedUser) => listedUser.id === id)

  if (!selectedUser) {
    return <p className="blogs-page">User not found.</p>
  }

  const userBlogs = blogs.filter((blog) => blogUserId(blog) === id)

  return (
    <main className="blogs-page">
      <section aria-labelledby="user-blogs-title">
        <h1 id="user-blogs-title">{selectedUser.name}</h1>
        {userBlogs.length > 0 ? (
          userBlogs.map((blog) => <Blog key={blog.id} blog={blog} />)
        ) : (
          <p>No blogs by this user yet.</p>
        )}
      </section>
    </main>
  )
}

export default UserBlogs
