import { CAR_ASSET_SCHEMA } from "../constants/schemas"

// strip all html tags and null bytes
export const sanitizeString = (str) =>
  str.replace(/<[^>]*>/g, '').replace(/\0/g, '').trim()

// sanitize every string value in an object recursively
export const sanitizeDeep = (value) => {
  if (typeof value === 'string') return sanitizeString(value)
  if (Array.isArray(value)) return value.map(sanitizeDeep)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [sanitizeString(k), sanitizeDeep(v)])
    )
  }
  return value
}

// validate a JWT token is plausibly shaped (three base64url segments)
export const isValidJWT = (token) =>
  /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(token.trim())

// validate a URL is http/https only
export const isValidHttpUrl = (str) => {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// validate a car before saving — checks all asset sprite URLs
export const validateCar = (car) => {
  for (const asset of car.assets) {
    if (asset.type !== 'avatar' && asset.spriteUrl && !isValidHttpUrl(asset.spriteUrl)) {
      return `Asset "${asset.name}" has an invalid sprite URL.`
    }
  }
  return null
}

const stripToSchema = (rawData, schema) => {
  const clean = {};
  Object.keys(schema).forEach(key => {
    if (rawData.hasOwnProperty(key)) {
      clean[key] = rawData[key];
    }
  });
  return clean;
}

export const sanitizeCarData = (rawCarData) => {
  const cleanCarData = { name: '', assets: [], disabled: false }
  if (typeof rawCarData.name === 'string') {
    cleanCarData.name = sanitizeString(rawCarData.name)
  }
  if (Array.isArray(rawCarData.assets)) {
    cleanCarData.assets = rawCarData.assets.map(asset => stripToSchema(asset, CAR_ASSET_SCHEMA))
  } 
  if (typeof rawCarData.disabled === 'boolean') {
    cleanCarData.disabled = rawCarData.disabled
  }
  return cleanCarData
}

export const downloadCarAsJSON = (rawCarData) => {
  try {
    const cleanCarData = sanitizeCarData(rawCarData)
    const jsonStr = JSON.stringify(cleanCarData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cleanCarData.name || 'car'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error("Failed to export car data:", err)
  }
}