// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Blog from './Blog'
import BlogForm from './BlogForm'

afterEach(cleanup)

describe('Blog', () => {
  it('links to the details page for its blog', () => {
    const blog = {
      id: 'blog-123',
      title: 'Testing React components',
      author: 'Ada Lovelace',
    }

    render(
      <MemoryRouter>
        <Blog blog={blog} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute(
      'href',
      '/blogs/blog-123',
    )
  })

  it('opens the details route when its link is selected', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Blog
                blog={{ id: 'blog-123', title: 'Router test', author: 'Ada' }}
              />
            }
          />
          <Route path="/blogs/:id" element={<p>Blog details page</p>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: 'View details' }))

    expect(screen.getByText('Blog details page')).toBeInTheDocument()
  })
})

describe('BlogForm', () => {
  it('calls onCreate with the entered blog details', async () => {
    const user = userEvent.setup()
    const mockHandler = vi.fn().mockResolvedValue(true)
    const blog = {
      title: 'Testing React components',
      author: 'Ada Lovelace',
      url: 'https://example.com/blog',
    }

    render(<BlogForm onCreate={mockHandler} />)

    await user.type(screen.getByLabelText('Title'), blog.title)
    await user.type(screen.getByLabelText('Author'), blog.author)
    await user.type(screen.getByLabelText('URL'), blog.url)
    await user.click(screen.getByRole('button', { name: 'Add blog' }))

    expect(mockHandler).toHaveBeenCalledWith(blog)
  })
})
