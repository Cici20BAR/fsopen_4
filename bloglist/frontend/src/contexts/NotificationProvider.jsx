import { useCallback, useEffect, useReducer, useRef } from 'react'
import { NotificationContext } from './NotificationContext'

const initialState = null

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SHOW_NOTIFICATION':
      return action.payload
    case 'CLEAR_NOTIFICATION':
      return null
    default:
      return state
  }
}

const NotificationProvider = ({ children }) => {
  const [notification, dispatch] = useReducer(notificationReducer, initialState)
  const timeoutRef = useRef(null)

  const clearNotification = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    dispatch({ type: 'CLEAR_NOTIFICATION' })
  }, [])

  const showNotification = useCallback(
    (message, type = 'success', duration = 3000) => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }

      dispatch({
        type: 'SHOW_NOTIFICATION',
        payload: { message, type },
      })

      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null
        dispatch({ type: 'CLEAR_NOTIFICATION' })
      }, duration)
    },
    [],
  )

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    },
    [],
  )

  return (
    <NotificationContext.Provider
      value={{ notification, showNotification, clearNotification }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider
