// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { removeUser, saveUser } from './services/persistentUser'
import { MemoryRouter, useLocation } from 'react-router-dom'
import App from './App'
import NotificationProvider from './contexts/NotificationProvider'
import { UserProvider } from './contexts/UserContext'
import blogService from './services/blogs'
import userService from './services/users'
import login from './services/login'

vi.mock('./services/blogs', () => ({
  default: {
    getAll: vi.fn(),
    create: vi.fn(),
    like: vi.fn(),
    remove: vi.fn(),
    comment: vi.fn(),
  },
}))

vi.mock('./services/users', () => ({
  default: {
    getAll: vi.fn(),
  },
}))

vi.mock('./services/login', () => ({
  default: vi.fn(),
}))

const user = {
  id: 'user-1',
  username: 'testuser',
  name: 'Test User',
  token: 'test-token',
}

const blog = {
  id: 'blog-1',
  title: 'Router blog',
  author: 'Test Author',
  url: 'https://example.com/router-blog',
  likes: 3,
  user: { id: user.id, name: user.name, username: user.username },
}

const Location = () => {
  const location = useLocation()
  return <output aria-label="Current path">{location.pathname}</output>
}

const renderApp = (initialPath = '/') =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false } },
        })
      }
    >
      <MemoryRouter initialEntries={[initialPath]}>
        <NotificationProvider>
          <UserProvider>
            <App />
            <Location />
          </UserProvider>
        </NotificationProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )

beforeEach(() => {
  removeUser()
  blogService.getAll.mockResolvedValue([blog])
  userService.getAll.mockResolvedValue([])
  blogService.create.mockResolvedValue({
    ...blog,
    id: 'blog-2',
    title: 'New blog',
  })
  blogService.like.mockResolvedValue({ ...blog, likes: 4 })
  blogService.remove.mockResolvedValue(undefined)
  blogService.comment.mockResolvedValue({ ...blog, comments: ['Test comment'] })
  login.mockResolvedValue(user)
  window.confirm = vi.fn().mockReturnValue(true)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('App routes and navigation', () => {
  it('shows all blogs by default and opens a blog details route', async () => {
    const userEvents = userEvent.setup()
    renderApp()

    expect(
      await screen.findByRole('heading', { name: 'All blogs' }),
    ).toBeInTheDocument()
    await userEvents.click(
      await screen.findByRole('link', { name: 'View details' }),
    )

    expect(
      await screen.findByText('https://example.com/router-blog'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Current path')).toHaveTextContent(
      '/blogs/blog-1',
    )
    expect(
      screen.queryByRole('button', { name: 'Like' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument()
  })

  it('shows login for a protected route and Add in the navigation after login', async () => {
    const userEvents = userEvent.setup()
    renderApp('/my-blogs/new')

    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Add blog' }),
    ).not.toBeInTheDocument()

    await userEvents.click(screen.getByRole('link', { name: 'Sign in' }))
    await userEvents.type(screen.getByLabelText('Username'), user.username)
    await userEvents.type(screen.getByLabelText('Password'), 'password123')
    await userEvents.click(
      screen.getByRole('button', { name: 'Sign in' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Hello, Test User!' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Add blog' })).toHaveAttribute(
      'href',
      '/my-blogs/new',
    )
    await userEvents.click(screen.getByRole('link', { name: 'Add blog' }))
    expect(
      await screen.findByRole('heading', { name: 'Add a blog' }),
    ).toBeInTheDocument()
    expect(login).toHaveBeenCalledWith({
      username: user.username,
      password: 'password123',
    })
  })

  it('shows a login error as a notification', async () => {
    const userEvents = userEvent.setup()
    login.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    })
    renderApp('/login')

    await userEvents.type(screen.getByLabelText('Username'), user.username)
    await userEvents.type(screen.getByLabelText('Password'), 'wrong-password')
    await userEvents.click(
      screen.getByRole('button', { name: 'Sign in' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid credentials',
    )
  })

  it('creates a blog and redirects to all blogs', async () => {
    const userEvents = userEvent.setup()
    saveUser(user)
    blogService.getAll
      .mockResolvedValueOnce([blog])
      .mockResolvedValue([{ ...blog, id: 'blog-2', title: 'New blog' }, blog])
    renderApp('/my-blogs/new')

    await userEvents.type(await screen.findByLabelText('Title'), 'New blog')
    await userEvents.type(screen.getByLabelText('Author'), 'Test Author')
    await userEvents.type(
      screen.getByLabelText('URL'),
      'https://example.com/new-blog',
    )
    await userEvents.click(screen.getByRole('button', { name: 'Add blog' }))

    expect(
      await screen.findByRole('heading', { name: 'All blogs' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Current path')).toHaveTextContent('/')
    expect(screen.getAllByRole('link', { name: 'View details' })).toHaveLength(
      2,
    )
    expect(blogService.create).toHaveBeenCalledWith(
      {
        title: 'New blog',
        author: 'Test Author',
        url: 'https://example.com/new-blog',
      },
      user.token,
    )
  })

  it('likes a blog for a logged-in user', async () => {
    const userEvents = userEvent.setup()
    saveUser(user)
    blogService.getAll
      .mockResolvedValueOnce([blog])
      .mockResolvedValue([{ ...blog, likes: 4 }])
    renderApp('/blogs/blog-1')

    await userEvents.click(await screen.findByRole('button', { name: 'Like' }))

    expect(blogService.like).toHaveBeenCalledWith(blog, user.token)
    await waitFor(() =>
      expect(screen.getByText('4 likes')).toBeInTheDocument(),
    )
  })

  it('deletes a blog and redirects to all blogs', async () => {
    const userEvents = userEvent.setup()
    saveUser(user)
    renderApp('/blogs/blog-1')

    await userEvents.click(
      await screen.findByRole('button', { name: 'Delete' }),
    )

    expect(blogService.remove).toHaveBeenCalledWith(blog, user.token)
    expect(
      await screen.findByRole('heading', { name: 'All blogs' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Current path')).toHaveTextContent('/')
  })
})
