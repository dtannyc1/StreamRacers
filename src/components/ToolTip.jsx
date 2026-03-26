import { useState, useRef } from 'react'

const Tooltip = ({ text, children }) => {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef(null)

  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setPos({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      })
    }
    setVisible(true)
  }

  return (
    <>
      <div
        ref={ref}
        className="relative flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && (
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            transform: 'translate(0%, -100%)',
            zIndex: 9999,
          }}
          className="w-56 rounded-lg bg-gray-900 border border-gray-600 px-3 py-2 text-xs text-gray-300 shadow-xl pointer-events-none"
        >
          {text}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-600" />
        </div>
      )}
    </>
  )
}

export default Tooltip