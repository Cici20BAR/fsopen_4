import { useEffect, useMemo } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import './App.css'
import login from './services/login'
import blogService from './services/blogs'
import userService from './services/users'
import BlogDetails from './components/BlogDetails'
import UserBlogs from './components/UserBlogs'
import ErrorBoundary from './components/ErrorBoundary'
import Notification from './components/Notification'
import useNotification from './hooks/useNotification'
import { useUser } from './contexts/UserContext'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

const blogUserId = (blog) =>
  typeof blog.user === 'string' ? blog.user : blog.user?.id

const App = () => {
  const { user, login: saveUser, logout } = useUser()
  const { clearNotification, showNotification } = useNotification()
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const {
    data: blogs = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => blogService.getAll(),
  })
  const {
    data: users = [],
    isPending: usersPending,
    isError: usersError,
  } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  })

  const createBlogMutation = useMutation({
    mutationFn: (blog) => blogService.create(blog, user.token),
  })

  useEffect(() => {
    if (isError) {
      showNotification(
        'Could not load blogs. Please try again.',
        'error',
      )
    }
  }, [isError, error, showNotification])

  const sortedBlogs = useMemo(
    () => [...blogs].sort((a, b) => b.likes - a.likes),
    [blogs],
  )

  const handleCreateBlog = async (blog) => {
    try {
      await createBlogMutation.mutateAsync(blog)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['blogs'] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
      ])
      clearNotification()
      navigate('/')
      return true
    } catch (requestError) {
      showNotification(
        requestError.response?.data?.error || 'Could not add the blog.',
        'error',
      )
      return false
    }
  }

  const handleLike = async (blog) => {
    try {
      await blogService.like(blog, user.token)
      await queryClient.invalidateQueries({ queryKey: ['blogs'] })
      clearNotification()
    } catch (requestError) {
      showNotification(
        requestError.response?.data?.error || 'Could not save your like.',
        'error',
      )
    }
  }

  const handleDelete = async (blog) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${blog.title}"?`,
    )
    if (!confirmed) {
      return
    }

    try {
      await blogService.remove(blog, user.token)
      await queryClient.invalidateQueries({ queryKey: ['blogs'] })
      clearNotification()
      navigate('/')
    } catch (requestError) {
      showNotification(
        requestError.response?.data?.error || 'Could not delete the blog.',
        'error',
      )
    }
  }

  const handleLogin = async (credentials) => {
    try {
      const loggedInUser = await login(credentials)
      saveUser(loggedInUser)
      clearNotification()
      navigate('/my-blogs')
    } catch (requestError) {
      showNotification(
        requestError.response?.data?.error ||
          'Sign in failed. Please try again.',
        'error',
      )
    }
  }

  const handleLogout = () => {
    logout()
    clearNotification()
    navigate('/')
  }
  const handleComment = async (blog, comment) => {
    try {
      await blogService.comment(blog.id, comment)
      await queryClient.invalidateQueries({ queryKey: ['blogs'] })
      clearNotification()
      return true
    } catch (requestError) {
      showNotification(
        requestError.response?.data?.error ||
          'Could not post your comment.',
        'error',
      )
      return false
    }
  }
  const renderBlogItems = (items) =>
    items.map((blog) => (
      <Blog
        key={blog.id}
        blog={blog}
        currentUserId={user?.id}
        onLike={handleLike}
        onDelete={handleDelete}
      />
    ))

  return (
    <>
      <header className="app-header">
        <nav className="app-nav" aria-label="Main navigation">
          <Link to="/">blogs</Link>
          <Link to="/users">users</Link>
          <Link to={user ? '/my-blogs' : '/login'}>
            {user ? 'My blogs' : 'Sign in'}
          </Link>
          {user && <Link to="/my-blogs/new">Add blog</Link>}
        </nav>
        {user && (
          <button className="logout-button" onClick={handleLogout}>
            Sign out
          </button>
        )}
      </header>

      <ErrorBoundary>
        <Notification />
        <Routes>
          <Route
            path="/"
            element={
              <main className="blogs-page">
                <section aria-labelledby="blogs-title">
                  <h1 id="blogs-title">All blogs</h1>
                  {isPending ? (
                    <p role="status">Loading blogs...</p>
                  ) : sortedBlogs.length > 0 ? (
                    renderBlogItems(sortedBlogs)
                  ) : (
                    <p>No blogs yet.</p>
                  )}
                </section>
              </main>
            }
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/my-blogs" replace />
              ) : (
                <LoginForm onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/users"
            element={
              <main className="blogs-page">
                <section aria-labelledby="users-title">
                  <h1 id="users-title">Users</h1>
                  {usersPending ? (
                    <p role="status">Loading users...</p>
                  ) : usersError ? (
                    <p role="alert">Could not load users.</p>
                  ) : users.length === 0 ? (
                    <p>No users yet.</p>
                  ) : (
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th scope="col">Username</th>
                          <th scope="col">Blogs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((listedUser) => (
                          <tr key={listedUser.id}>
                            <td><Link to={`/users/${listedUser.id}`}>{listedUser.name}</Link></td>
                            <td>{listedUser.blogs}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>
              </main>
            }
          />
          <Route
            path="/users/:id"
            element={
              usersPending || isPending ? (
                <p className="blogs-page" role="status">
                  Loading blogs...
                </p>
              ) : usersError || isError ? (
                <p className="blogs-page" role="alert">
                  Could not load user data.
                </p>
              ) : (
                <UserBlogs users={users} blogs={blogs} />
              )
            }
          />
          <Route
            path="/my-blogs"
            element={
              user ? (
                <main className="blogs-page">
                  <section aria-labelledby="my-blogs-title">
                    <h1 id="my-blogs-title">
                      Hello, {user.name || user.username}!
                    </h1>
                    <h2>Your blogs</h2>
                    {isPending ? (
                      <p role="status">Loading blogs...</p>
                    ) : (
                      renderBlogItems(
                        sortedBlogs.filter(
                          (blog) => blogUserId(blog) === user.id,
                        ),
                      )
                    )}
                  </section>
                </main>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/blogs/:id"
            element={
              isPending ? (
                <p className="blogs-page" role="status">
                  Loading blog...
                </p>
              ) : (
                <BlogDetails
                  blogs={blogs}
                  user={user}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onComment={handleComment}
                />
              )
            }
          />
          <Route
            path="/my-blogs/new"
            element={
              user ? (
                <main className="blogs-page">
                  <section aria-labelledby="add-blog-title">
                    <h1 id="add-blog-title">Add a blog</h1>
                    <BlogForm onCreate={handleCreateBlog} />
                  </section>
                </main>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="*"
            element={<p className="not-found-message">404-PAGE NOT FOUND</p>}
          />
        </Routes>
      </ErrorBoundary>
    </>
  )
}

export default App
