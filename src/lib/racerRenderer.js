import { resolveImageUrl } from './utils'

const loadImage = (url, cache) => {
  if (!url) return null
  const resolved = resolveImageUrl(url)
  if (!cache[resolved]) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = resolved
    cache[resolved] = img
  }
  return cache[resolved]
}

const drawAsset = (ctx, asset, img, t, xy) => {
  if (!img?.naturalWidth) return

  const [rx, ry] = xy
  const [x, y] = [rx + asset.tl[0], ry + asset.tl[1]]
  const [w, h] = asset.dim
  const theta = asset.theta ?? 0

  ctx.save()

  if (asset.type === 'avatar') {
    if (theta !== 0) {
      const cx = x + w / 2
      const cy = y + h / 2
      ctx.translate(cx, cy)
      ctx.rotate(theta)
      ctx.translate(-cx, -cy)
    }
    ctx.beginPath()
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, x, y, w, h)

  } else if (asset.type === 'static') {
    if (theta !== 0) {
      const cx = x + w / 2
      const cy = y + h / 2
      ctx.translate(cx, cy)
      ctx.rotate(theta)
      ctx.translate(-cx, -cy)
    }
    ctx.drawImage(img, x, y, w, h)

  } else if (asset.type === 'rotating') {
    const [cx, cy] = asset.cr ?? [x + w / 2, y + h / 2]
    const acx = rx + cx
    const acy = ry + cy
    const angle = theta + t * 2
    ctx.translate(acx, acy)
    ctx.rotate(angle)
    ctx.translate(-acx, -acy)
    ctx.drawImage(img, x, y, w, h)

  } else if (asset.type === 'oscillating') {
    const [cx, cy] = asset.cr ?? [x + w / 2, y + h / 2]
    const acx = rx + cx
    const acy = ry + cy
    const min = asset.minTheta ?? -Math.PI / 6
    const max = asset.maxTheta ?? Math.PI / 6
    const phase = asset.phase ?? 0
    const angle = theta + ((max - min) / 2) * Math.sin(t * 3 + phase) + (max + min) / 2
    ctx.translate(acx, acy)
    ctx.rotate(angle)
    ctx.translate(-acx, -acy)
    ctx.drawImage(img, x, y, w, h)
  }

  ctx.restore()
}

export const preloadCarImages = (car, avatarUrl, cache) => {
  car.assets.forEach(asset => {
    const url = asset.type === 'avatar' ? avatarUrl : asset.spriteUrl
    loadImage(url, cache)
  })
}

export const drawRacer = (ctx, racer, avatarUrl, imageCache, t) => {
  const { car, xy } = racer
  if (!car?.assets) return

  car.assets.forEach(asset => {
    const url = asset.type === 'avatar' ? avatarUrl : asset.spriteUrl
    const img = loadImage(url, imageCache)
    drawAsset(ctx, asset, img, t, xy)
  })
}