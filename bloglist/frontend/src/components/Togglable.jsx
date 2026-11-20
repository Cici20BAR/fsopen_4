import { useState, forwardRef, useImperativeHandle } from 'react'

const Togglable = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false)
  const toggleVisibility = () => {
    setVisible((curr) => !curr)
  }
  useImperativeHandle(ref, () => ({ toggleVisibility }))
  return (
    <div>
      <button onClick={toggleVisibility}>{visible ? 'Cancel ' : 'Add'} </button>
      {visible && props.children}
    </div>
  )
})
export default Togglable
