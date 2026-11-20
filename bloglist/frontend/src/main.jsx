import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter as Router } from 'react-router-dom'
import NotificationProvider from './contexts/NotificationProvider'
import { UserProvider } from './contexts/UserContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Router>
      <NotificationProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </NotificationProvider>
    </Router>
  </QueryClientProvider>,
)
