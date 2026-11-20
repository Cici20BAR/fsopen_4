import { useState } from 'react'
import { useParams } from 'react-router-dom'

const BlogDetails = ({ blogs, user, onLike, onDelete, onComment }) => {
  const { id } = useParams()
  const [submittingComment, setSubmittingComment] = useState(false)

  const blog_found = blogs.find((blog) => blog.id === id)
  const blogOwnerId =
    typeof blog_found?.user === 'string'
      ? blog_found.user
      : blog_found?.user?.id

  if (!blog_found) {
    return <p className="blogs-page">Blog not found.</p>
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const comment = formData.get('comment').trim()

    if (!comment) {
      return
    }

    setSubmittingComment(true)
    try {
      const saved = await onComment(blog_found, comment)
      if (saved) {
        form.reset()
      }
    } finally {
      setSubmittingComment(false)
    }
  }

  const comments = blog_found.comments || []

  return (
    <main className="blogs-page blog-details-page">
      <header className="blog-detail-heading">
        <h1>{blog_found.title}</h1>
        {blog_found.author && <p>by {blog_found.author}</p>}
        <p>Posted by {blog_found.user.name}</p>
        <a href={blog_found.url} target="_blank" rel="noreferrer">
          {blog_found.url}
        </a>
        <p className="like-count">
          {blog_found.likes} {blog_found.likes === 1 ? 'like' : 'likes'}
        </p>
      </header>

      <div className="blog-actions">
        {user && (
          <button
            className="button-primary"
            onClick={() => onLike(blog_found)}
          >
            Like
          </button>
        )}
        {user && blogOwnerId === user.id && (
          <button
            className="button-danger"
            onClick={() => onDelete(blog_found)}
          >
            Delete
          </button>
        )}
      </div>

      <section className="comments-panel" aria-labelledby="comments-title">
        <h2 id="comments-title">Comments</h2>
        {comments.length > 0 ? (
          <ul>
            {comments.map((comment, index) => (
              <li key={`${index}-${comment}`}>{comment}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No comments yet.</p>
        )}

        <form onSubmit={handleCommentSubmit}>
          <label htmlFor="blog-comment">Add a comment</label>
          <textarea
            id="blog-comment"
            name="comment"
            rows="3"
            maxLength="1000"
            required
          />
          <button type="submit" disabled={submittingComment}>
            {submittingComment ? 'Posting...' : 'Add comment'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default BlogDetails
