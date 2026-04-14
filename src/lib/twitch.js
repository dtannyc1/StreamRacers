const BASE_URL = 'https://api.twitch.tv/helix'
const TWITCH_ACCESS_TOKEN_KEY = 'twitch_access_token'

const REDIRECT_URI = import.meta.env.DEV
  ? 'http://localhost:5173/StreamRacers/auth/twitch/callback'
  : 'https://streamracers.onrender.com/auth/twitch/callback'

export const getTwitchAccessToken = () =>
  localStorage.getItem(TWITCH_ACCESS_TOKEN_KEY)

export const saveTwitchAccessToken = (token) =>
  localStorage.setItem(TWITCH_ACCESS_TOKEN_KEY, token)

export const clearTwitchAccessToken = () =>
  localStorage.removeItem(TWITCH_ACCESS_TOKEN_KEY)

export const redirectToTwitchLogin = () => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_TWITCH_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'token',
    scope: '',
  })
  //console.log('Redirecting to Twitch login...')
  window.location.href = `https://id.twitch.tv/oauth2/authorize?${params}`
}

const twitchHeaders = () => ({
  'Client-ID': import.meta.env.VITE_TWITCH_CLIENT_ID,
  Authorization: `Bearer ${getTwitchAccessToken()}`,
  Accept: 'application/json',
})

export const getTwitchUser = async (username) => {
  const res = await fetch(`${BASE_URL}/users?login=${username}`, {
    headers: twitchHeaders(),
  })

  if (!res.ok) throw new Error(`Failed to fetch Twitch user (${res.status})`)

  const data = await res.json()
  if (!data.data?.length) throw new Error(`User "${username}" not found on Twitch`)

  return data.data[0]
}