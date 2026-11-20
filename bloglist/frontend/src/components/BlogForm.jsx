import { useRef, useState } from 'react'

const BlogForm = ({ onCreate }) => {
  const formRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const blog = {
      title: formData.get('title'),
      author: formData.get('author'),
      url: formData.get('url'),
    }

    setSubmitting(true)
    try {
      const created = await onCreate(blog)
      if (created) {
        formRef.current?.reset()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="blog-create-form" ref={formRef} onSubmit={handleSubmit}>
      <label htmlFor="blog-title">Title</label>
      <input id="blog-title" name="title" type="text" required />

      <label htmlFor="blog-author">Author</label>
      <input id="blog-author" name="author" type="text" />

      <label htmlFor="blog-url">URL</label>
      <input id="blog-url" name="url" type="url" required />

      <button className="login-button" type="submit" disabled={submitting}>
        {submitting ? 'Adding...' : 'Add blog'}
      </button>
    </form>
  )
}

export default BlogForm
