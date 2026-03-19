import { useState } from 'react'
import { sanitizeString, isValidJWT } from '../lib/sanitize'

const TokenInput = ({ onSave }) => {
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    const sanitized = sanitizeString(value)
    if (!sanitized) return
    if (!isValidJWT(sanitized)) {
      setError('That doesn\'t look like a valid JWT token. Please check and try again.')
      return
    }
    setError(null)
    onSave(sanitized)
    setValue('')
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">
        StreamElements JWT Token
      </label>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste your JWT token here"
          className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
      </form>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-xs text-gray-500">
        Your token is stored locally and never sent anywhere except StreamElements.
      </p>
    </div>
  )
}

export default TokenInput;