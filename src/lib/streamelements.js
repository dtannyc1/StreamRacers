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

export const setRaceHistoryOverlaySettings = async (token, channelId, value) =>
  setKVKey(token, channelId, 'raceHistoryOverlaySettings', value)

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

const CLEAN_LEADERBOARD_OVERLAY = {
    "settings": {
        "width": 1920,
        "height": 1080,
        "name": "1080p"
    },
    "type": "regular",
    "name": "StreamRacers Leaderboard",
    "preview": "https://cdn.streamelements.com/assets/dashboard/my-overlays/overlay-default-preview-4.jpg",
    "widgets": [
        {
            "id": 1,
            "group": null,
            "version": 1,
            "type": "se-widget-custom-event-list",
            "name": "StreamRacers Leaderboard",
            "visible": true,
            "locked": false,
            "listeners": {
                "tip-latest": true,
                "subscriber-latest": true,
                "follower-latest": true,
                "cheer-latest": true,
                "host-latest": true,
                "raid-latest": true,
                "redemption-latest": true
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
                "css": "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\r\n\r\nhtml, body {\r\n  width: 100%;\r\n  height: 100%;\r\n  background: transparent;\r\n  overflow: hidden;\r\n}\r\n\r\n:root {\r\n  --font-family:      'Segoe UI', system-ui, sans-serif;\r\n  --font-size-base:   42px;\r\n  --font-size-title:  39px;\r\n  --font-size-name:   42px;\r\n  --font-size-stat:   36px;\r\n  --font-size-badge:  33px;\r\n\r\n  --outer-padding:    32px;\r\n  --panel-gap:        24px;\r\n  --row-padding-x:    24px;\r\n  --row-padding-y:    12px;\r\n  --header-padding-y: 16px;\r\n\r\n  --color-bg:         rgba(10, 10, 15, 0.82);\r\n  --color-panel-bg:   rgba(18, 18, 26, 0.90);\r\n  --color-header-bg:  rgba(30, 30, 42, 0.95);\r\n  --color-border:     rgba(255, 255, 255, 0.08);\r\n  --color-stripe:     #CC2222;\r\n\r\n  --color-text-primary:   #f0f0f0;\r\n  --color-text-secondary: #8a8a9a;\r\n  --color-text-stat:      #b0b0c0;\r\n  --color-accent:         #e03030;\r\n\r\n  --color-gold:   #f5c842;\r\n  --color-silver: #b0bec5;\r\n  --color-bronze: #cd7f4a;\r\n\r\n  --border-radius-outer: 12px;\r\n  --border-radius-inner: 8px;\r\n\r\n  --transition: 0.35s ease;\r\n}\r\n\r\n#overlay {\r\n  position: absolute;\r\n  inset: 0;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: flex-start;\r\n  padding: var(--outer-padding);\r\n  font-family: var(--font-family);\r\n  font-size: var(--font-size-base);\r\n}\r\n\r\n#panels {\r\n  display: flex;\r\n  gap: var(--panel-gap);\r\n  width: 100%;\r\n  align-items: stretch;\r\n}\r\n\r\n.panel {\r\n  flex: 1;\r\n  background: var(--color-panel-bg);\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--border-radius-outer);\r\n  overflow: hidden;\r\n  backdrop-filter: blur(12px);\r\n  -webkit-backdrop-filter: blur(12px);\r\n\r\n  /* entry animation */\r\n  opacity: 0;\r\n  transform: translateY(6px);\r\n  animation: fadeUp var(--transition) forwards;\r\n}\r\n\r\n.panel:nth-child(2) { animation-delay: 0.05s; }\r\n\r\n@keyframes fadeUp {\r\n  to { opacity: 1; transform: translateY(0); }\r\n}\r\n\r\n.panel-header {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  padding: var(--header-padding-y) var(--row-padding-x);\r\n  background: var(--color-header-bg);\r\n  border-bottom: 1px solid var(--color-border);\r\n  gap: 8px;\r\n}\r\n\r\n.panel-flag {\r\n  width: 3px;\r\n  height: 100%;\r\n  align-self: stretch;\r\n  border-radius: 2px;\r\n  background: var(--color-accent);\r\n  flex-shrink: 0;\r\n}\r\n\r\n.panel-title {\r\n  font-size: var(--font-size-title);\r\n  font-weight: 600;\r\n  color: var(--color-text-primary);\r\n  letter-spacing: 0.02em;\r\n  text-transform: uppercase;\r\n  flex: 1;\r\n}\r\n\r\n.panel-sub {\r\n  font-size: calc(var(--font-size-title) - 2px);\r\n  color: var(--color-text-secondary);\r\n  white-space: nowrap;\r\n}\r\n\r\n.racer-row {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 10px;\r\n  padding: var(--row-padding-y) var(--row-padding-x);\r\n  border-bottom: 1px solid var(--color-border);\r\n  transition: background 0.15s;\r\n}\r\n\r\n.racer-row:last-child { border-bottom: none; }\r\n\r\n.racer-row:nth-child(even) {\r\n  background: rgba(255, 255, 255, 0.02);\r\n}\r\n\r\n.pos-badge {\r\n  width: 44px;\r\n  height: 44px;\r\n  border-radius: 50%;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  font-size: var(--font-size-badge);\r\n  font-weight: 700;\r\n  flex-shrink: 0;\r\n  color: #111;\r\n}\r\n\r\n.pos-1 { background: var(--color-gold);   color: #5a3e00; }\r\n.pos-2 { background: var(--color-silver); color: #2a3540; }\r\n.pos-3 { background: var(--color-bronze); color: #4a2010; }\r\n.pos-other {\r\n  background: rgba(255,255,255,0.08);\r\n  color: var(--color-text-secondary);\r\n  font-weight: 500;\r\n}\r\n\r\n.racer-name {\r\n  flex: 1;\r\n  font-size: var(--font-size-name);\r\n  font-weight: 500;\r\n  color: var(--color-text-primary);\r\n  white-space: nowrap;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n}\r\n\r\n.racer-stats {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  font-size: var(--font-size-stat);\r\n  color: var(--color-text-stat);\r\n  white-space: nowrap;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.racer-pts {\r\n  font-weight: 700;\r\n  color: var(--color-text-primary);\r\n  min-width: 36px;\r\n  text-align: right;\r\n}\r\n\r\n.racer-meta {\r\n  color: var(--color-text-secondary);\r\n  font-size: calc(var(--font-size-stat) - 1px);\r\n}\r\n\r\n.empty {\r\n  padding: 24px 12px;\r\n  text-align: center;\r\n  font-size: var(--font-size-stat);\r\n  color: var(--color-text-secondary);\r\n}\r\n\r\n#refresh-flash {\r\n  position: fixed;\r\n  inset: 0;\r\n  background: rgba(204, 34, 34, 0.07);\r\n  pointer-events: none;\r\n  opacity: 0;\r\n  transition: opacity 0.15s;\r\n  z-index: 999;\r\n}\r\n\r\n#refresh-flash.active { opacity: 1; }",
                "html": "<script type=\"module\" src=\"https://dtannyc1.github.io/StreamRacers/RaceHistory.js\"></script>   \n\n<div id=\"refresh-flash\"></div>\n<div id=\"overlay\">\n  <div id=\"panels\"></div>\n</div>",
                "js": "",
                "fields": "{}"
            },
            "provider": "twitch"
        }
    ],
    "mobile": false,
    "campaign": false,
    "favorite": false,
}