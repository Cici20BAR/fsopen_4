import { createContext, useContext, useState } from 'react'
import { getUser, removeUser, saveUser } from '../services/persistentUser'

const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUser())

  const login = (userData) => {
    saveUser(userData)
    setUser(userData)
  }

  const logout = () => {
    removeUser()
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
