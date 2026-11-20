import useNotification from '../hooks/useNotification'

const Notification = () => {
  const { notification } = useNotification()

  if (!notification) {
    return null
  }

  const isError = notification.type === 'error'

  return (
    <div
      className={`notification notification-${notification.type}`}
      role={isError ? 'alert' : 'status'}
    >
      {notification.message}
    </div>
  )
}

export default Notification
