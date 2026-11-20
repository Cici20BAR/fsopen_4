import { Link } from 'react-router-dom'

const Blog = ({ blog }) => (
  <article className="blog-card">
    <div className="blog-card-copy">
      <h2>
        <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
      </h2>
      {blog.author && <p>by {blog.author}</p>}
    </div>
    <Link className="text-link" to={`/blogs/${blog.id}`}>
      View details
    </Link>
  </article>
)

export default Blog
