import React from 'react'

class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }} role="alert">
          <h2>Something went wrong.</h2>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
