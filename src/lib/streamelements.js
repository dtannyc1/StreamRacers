const BASE_URL = 'https://api.streamelements.com/kappa/v2'
const KV_BASE_URL = 'https://kvstore.streamelements.com/v2/channel'

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/json',
})

// ── Channels ──────────────────────────────────────────────────────────────────

export const getChannel = async (token) => {
  const res = await fetch(`${BASE_URL}/channels/me`, {
    headers: authHeaders(token),
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid or expired token')
    throw new Error(`Failed to fetch channel info (${res.status})`)
  }

  return res.json()
}

// ── KVStore ───────────────────────────────────────────────────────────────────

export const getKVKey = async (token, channelId, key) => {
  const res = await fetch(`${KV_BASE_URL}/${channelId}/customWidget.${key}`, {
    headers: authHeaders(token),
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error(`Key "${key}" not found`)
    throw new Error(`Failed to fetch key "${key}" (${res.status})`)
  }

  return res.json()
}

export const setKVKey = async (token, channelId, key, value) => {
  const res = await fetch(`${KV_BASE_URL}/${channelId}`, {
    method: 'PUT',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key: `customWidget.${key}`, value }),
  })

  if (!res.ok) {
    throw new Error(`Failed to update key "${key}" (${res.status})`)
  }

  return res.json()
}

// ── Convenience helpers ───────────────────────────────────────────────────────

export const getRacersAndTracks = async (token, channelId) => {
  const [racers, tracks] = await Promise.all([
    getKVKey(token, channelId, 'customRacers'),
    getKVKey(token, channelId, 'customTracks'),
  ])

  return { racers, tracks }
}

export const setRacers = (token, channelId, value) =>
  setKVKey(token, channelId, 'customRacers', value)

export const setTracks = (token, channelId, value) =>
  setKVKey(token, channelId, 'customTracks', value)