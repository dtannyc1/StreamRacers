const BASE_URL = 'https://api.streamelements.com/kappa/v2'
const KV_BASE_URL = 'https://kvstore.streamelements.com/v2/channel'
const OVERLAY_BASE_URL = 'https://api.streamelements.com/kappa/v2/overlays'

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/json; charset=utf-8',
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

export const listKVKeys = async (token, channelId) => {
  const res = await fetch(`${KV_BASE_URL}/${channelId}/customWidget`, {
    headers: authHeaders(token),
  })

  if (!res.ok) throw new Error(`Failed to list kvstore keys (${res.status})`)

  return res.json()
}

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

export const checkSEOVerlay = async (token, channelId, overlayId) => {
  const res = await fetch(`${OVERLAY_BASE_URL}/${channelId}/${overlayId}`, {
    method: 'GET',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    return null
  }

  return overlayId
}

export const createSEOverlay = async (token, channelId) => {
  const overlay = structuredClone(CLEAN_OVERLAY)
  const currentOrigin = window.location.origin;
  let scriptTag = `<script type=\"module\" src=\"${currentOrigin}/StreamRacers/Game.js\"></script>`
  if (currentOrigin.includes('onrender.com')) {
    scriptTag = `<script type=\"module\" src=\"${currentOrigin}/Game.js\"></script>`
  }
  overlay.channel = channelId
  overlay.widgets[0].variables.html = scriptTag
  const res = await fetch(`${OVERLAY_BASE_URL}/${channelId}`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(overlay),
  })

  if (!res.ok) {
    throw new Error(`Failed to create a new overlay (${res.status})`)
  }

  return res.json()
}

// ── Convenience helpers ───────────────────────────────────────────────────────

export const getRacersAndTracks = async (token, channelId, hardReset = false) => {
  let existing = {}
  try {
    existing = await listKVKeys(token, channelId)
  } catch (err) {
    if (!hardReset) throw err
  }
 
  const existingKeys = Object.keys(existing)

  const initIfMissing = async (key, defaultVal={}) => {
    if (!existingKeys.includes(key)) {
      await setKVKey(token, channelId, key, defaultVal)
      return defaultVal
    }
    const res = await getKVKey(token, channelId, key)
    return res
  }

  const [racers, tracks] = await Promise.all([
    initIfMissing('customRacers'),
    initIfMissing('customTracks'),
    initIfMissing('raceSettings'),
    initIfMissing('raceHistory', []),
    initIfMissing('jwtToken', ''),
  ])

  return { racers, tracks }
}

export const setRacers = (token, channelId, value) =>
  setKVKey(token, channelId, 'customRacers', value)

export const setTracks = (token, channelId, value) =>
  setKVKey(token, channelId, 'customTracks', value)

export const setJWTToken = (token, channelId) =>
  setKVKey(token, channelId, 'jwtToken', token)

export const getRaceSettings = async (token, channelId) =>
  getKVKey(token, channelId, 'raceSettings')

export const setRaceSettings = async (token, channelId, value) =>
  setKVKey(token, channelId, 'raceSettings', value)

export const getRaceHistory = async (token, channelId) =>
  getKVKey(token, channelId, 'raceHistory')

export const uploadImage = async (token, channelId, file) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`https://api.streamelements.com/kappa/v2/uploads/${channelId}`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    }
  })

  if (!res.ok) throw new Error(`Upload failed (${res.status})`)
  const data = await res.json()
  if (!data.url) throw new Error('No URL returned from upload')
  return data.url
}

const CLEAN_OVERLAY = {
    "settings": {
        "width": 1920,
        "height": 1080,
        "name": "1080p"
    },
    "type": "regular",
    "name": "Stream Racers",
    "preview": "https://cdn.streamelements.com/assets/dashboard/my-overlays/overlay-default-preview-3.jpg",
    "widgets": [
        {
            "id": 1,
            "group": null,
            "type": "se-widget-custom-event-list",
            "name": 'StreamRacers Game',
            "visible": true,
            "locked": false,
            "listener": null,
            "listeners": {
                "tip-latest": true,
                "sponsor-latest": true,
                "subscriber-latest": true,
                "superchat-latest": true
            },
            "css": {
                "z-index": 2,
                "width": 1920,
                "height": 1080,
                "opacity": 1,
                "top": 0,
                "left": 0
            },
            "text": {
                "type": "text",
                "value": null,
                "enableShadow": true,
                "scrolling": {
                    "direction": "left",
                    "speed": 6
                },
                "css": {
                    "position": "relative",
                    "z-index": 1,
                    "font-family": "Nunito",
                    "font-size": 24,
                    "color": "#fff",
                    "font-weight": "bold",
                    "text-shadow": "rgb(0, 0, 0) 1px 1px 1px",
                    "text-align": "left",
                    "line-height": 1.3,
                    "scrolling": {
                        "direction": "left"
                    },
                    "message": {
                        "enableShadow": false,
                        "font-family": "Nunito",
                        "font-size": 16,
                        "line-height": 1.3,
                        "color": "#fff",
                        "text-align": "center"
                    }
                }
            },
            "image": {
                "type": "image",
                "css": {
                    "max-width": "100%"
                }
            },
            "video": {
                "type": "video",
                "volume": 0.5,
                "css": {
                    "width": 320,
                    "height": 240
                }
            },
            "audio": {
                "volume": 1
            },
            "variables": {
                "css": "",
                "html": "<script type=\"module\" src=\"https://streamracers.onrender.com/Game.js\"></script>",
                "js": "",
                "fields": "",
                "fieldData": {
                }
            },
            "provider": "Twitch"
        }
    ],
    "mobile": false,
    "campaign": false,
    "favorite": false,
}