import { createContext, useContext, useState, useEffect } from 'react'
import { getChannel } from '../lib/streamelements'

const TOKEN_KEY = 'se_jwt'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? null)
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      setChannel(null)
      return
    }

    const fetchChannel = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getChannel(token)
        setChannel(data)
      } catch (err) {
        setError(err.message)
        setChannel(null)
      } finally {
        setLoading(false)
      }
    }

    fetchChannel()
  }, [token])

  const saveToken = (newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
  }

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setChannel(null)
    setError(null)
  }

  return (
    <AuthContext.Provider value={{ token, channel, loading, error, saveToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}