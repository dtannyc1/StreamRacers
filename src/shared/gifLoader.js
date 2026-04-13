import { parseGIF, decompressFrames } from 'https://cdn.jsdelivr.net/npm/gifuct-js/+esm'

export const isGifUrl = (url) =>
  url?.toLowerCase().endsWith('.gif')

export const loadGIF = async (url) => {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  const gif = parseGIF(buffer)
  const frames = decompressFrames(gif, true)

  return frames.map(frame => {
    const canvas = document.createElement('canvas')
    canvas.width = frame.dims.width
    canvas.height = frame.dims.height
    const ctx = canvas.getContext('2d')
    const imageData = ctx.createImageData(frame.dims.width, frame.dims.height)
    imageData.data.set(frame.patch)
    ctx.putImageData(imageData, 0, 0)
    return {
      canvas,
      delay: frame.delay > 0 ? frame.delay : 100,
    }
  })
}

export const getCurrentFrame = (asset, now) => {
  if (!asset.frames?.length) return null
  const elapsed = now - asset.lastFrameTime
  const frame = asset.frames[asset.frameIndex]
  if (elapsed >= frame.delay) {
    asset.frameIndex = (asset.frameIndex + 1) % asset.frames.length
    asset.lastFrameTime = now
  }
  return asset.frames[asset.frameIndex].canvas
}

export const pauseGIFs = (assets, now) => {
  assets.forEach(asset => {
    if (asset.frames) asset.lastFrameTime = now
  })
}

export const loadAssetImage = async (asset, avatar) => {
  if (asset.type === 'avatar') return { img: avatar, frames: null }
  if (isGifUrl(asset.spriteUrl)) {
    try {
      const frames = await loadGIF(asset.spriteUrl)
      return { img: null, frames }
    } catch (err) {
      console.warn(`Failed to load GIF ${asset.spriteUrl}:`, err)
      return { img: null, frames: null }
    }
  }
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = resolveImageUrl(asset.spriteUrl)
  return { img, frames: null }
}

const resolveImageUrl = (url) => {
    if (!url) return url

    // convert Dropbox share links to direct download links
    if (url.includes('dropbox.com')) {
      return url
        .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
        .replace('?dl=0', '')
        .replace('&dl=0', '')
    }

    return url
  }