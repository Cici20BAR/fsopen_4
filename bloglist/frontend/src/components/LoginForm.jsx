import { Link } from 'react-router-dom'

const LoginForm = ({ onLogin }) => {
  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    onLogin({
      username: formData.get('username'),
      password: formData.get('password'),
    })
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <Link className="brand" to="/" aria-label="Bloglist home">
          <span className="brand-mark" aria-hidden="true">
            B
          </span>
          <span>bloglist</span>
        </Link>

        <div className="login-heading">
          <p className="eyebrow">Welcome back</p>
          <h1 id="login-title">Sign in</h1>
          <p className="login-description">
            Sign in to continue to your blogs.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Enter your username"
            autoComplete="username"
            required
          />

          <div className="password-label">
            <label htmlFor="password">Password</label>
            <a href="#forgot-password">Forgot password?</a>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <label className="remember-option">
            <input type="checkbox" name="remember" />
            <span>Remember me</span>
          </label>
          <button type="submit" className="login-button">
            Sign in
          </button>
        </form>
      </section>
      <p className="page-note">A home for your stories.</p>
    </main>
  )
}

export default LoginForm
