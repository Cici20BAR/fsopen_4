const storageKey = 'bloglistUser'

export const getUser = () => {
  const savedUser = window.localStorage.getItem(storageKey)

  if (!savedUser) {
    return null
  }

  try {
    const user = JSON.parse(savedUser)
    if (
      typeof user.token !== 'string' ||
      typeof user.username !== 'string' ||
      typeof user.id !== 'string'
    ) {
      removeUser()
      return null
    }

    return user
  } catch {
    removeUser()
    return null
  }
}

export const saveUser = (user) => {
  window.localStorage.setItem(storageKey, JSON.stringify(user))
}

export const removeUser = () => {
  window.localStorage.removeItem(storageKey)
}
