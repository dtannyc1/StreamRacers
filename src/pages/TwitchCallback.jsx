import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveTwitchAccessToken } from '../lib/twitch'

const TwitchCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', '?'))
    const accessToken = params.get('access_token')

    if (accessToken) {
      saveTwitchAccessToken(accessToken)
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <p className="text-sm text-gray-400">Connecting Twitch account...</p>
    </div>
  )
}

export default TwitchCallback