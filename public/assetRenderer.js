import { getCurrentFrame } from './gifLoader.js'

export const isReady = (drawable) => {
  if (!drawable) return false
  if (drawable instanceof HTMLCanvasElement) return true
  return !!drawable.naturalWidth
}

export const resolveDrawable = (asset, now) => {
  if (asset.frames) return getCurrentFrame(asset, now)
  if (asset.colorRemap?.enabled && asset.remappedImg) return asset.remappedImg
  return asset.img
}

export const drawAsset = (ctx, asset, drawable) => {
  if (!isReady(drawable)) {
    return
  }

  const [x, y] = asset.tl
  const [w, h] = asset.dim
  let angle = asset.theta ?? 0

  ctx.save()

  if (asset.type === 'avatar') {
    if (angle !== 0) {
      ctx.translate(x + w / 2, y + h / 2)
      ctx.rotate(angle)
      ctx.translate(-(x + w / 2), -(y + h / 2))
    }
    ctx.beginPath()
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(drawable, x, y, w, h)

  } else if (asset.type === 'static') {
    if (angle !== 0) {
      ctx.translate(x + w / 2, y + h / 2)
      ctx.rotate(angle)
      ctx.translate(-(x + w / 2), -(y + h / 2))
    }
    ctx.drawImage(drawable, x, y, w, h)

  } else if (asset.type === 'rotating' || asset.type === 'oscillating') {
    angle = (asset.cur_theta ?? 0) + angle
    const [cx, cy] = asset.cr ?? [x + w / 2, y + h / 2]
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.translate(-cx, -cy)
    ctx.drawImage(drawable, x, y, w, h)
  }

  ctx.restore()
}

export const drawAllAssets = (ctx, assets, now) => {
  assets.forEach(asset => {
    const drawable = resolveDrawable(asset, now)
    drawAsset(ctx, asset, drawable)
  })
}

export const remapImageColor = (img, sourceHex, targetHex) => {
  const offscreen = document.createElement('canvas')
  offscreen.width = img.naturalWidth || img.width
  offscreen.height = img.naturalHeight || img.height
  const ctx = offscreen.getContext('2d')
  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height)
  const data = imageData.data

  const sr = parseInt(sourceHex.slice(1, 3), 16)
  const sg = parseInt(sourceHex.slice(3, 5), 16)
  const sb = parseInt(sourceHex.slice(5, 7), 16)
  const tr = parseInt(targetHex.slice(1, 3), 16)
  const tg = parseInt(targetHex.slice(3, 5), 16)
  const tb = parseInt(targetHex.slice(5, 7), 16)

  const tolerance = 10
  for (let i = 0; i < data.length; i += 4) {
    if (
      Math.abs(data[i] - sr) <= tolerance &&
      Math.abs(data[i + 1] - sg) <= tolerance &&
      Math.abs(data[i + 2] - sb) <= tolerance
    ) {
      data[i] = tr
      data[i + 1] = tg
      data[i + 2] = tb
    }
  }

  ctx.putImageData(imageData, 0, 0)
  const remapped = new Image()
  remapped.src = offscreen.toDataURL()
  return remapped
}

export const convertToStyleSheet = (styleSheet) => {
  return `
        .leaderboard {
          opacity: 0;
          position: absolute;
          top: ${styleSheet?.top ?? 320}px;
          left: ${styleSheet?.left ?? 1425}px;
          width: 25ch;
          padding: ${styleSheet?.paddingY ?? 20}px ${styleSheet?.paddingX ?? 25}px;
          font: ${styleSheet?.fontSize ?? 32}px ${styleSheet?.font ?? Oswald};
          display: flex;
          flex-direction: column;
          border-radius: 25px;
          background-color: ${(styleSheet?.backgroundColor ?? "#000000") + 
            ((styleSheet?.backgroundOpacity ?? 1) * 255).toString(16)
          };
          letter-spacing: 1.5px;
        }
        .leaderboard-item { 
          color: ${styleSheet?.color ?? "white"}; 
          font: inherit;
          letter-spacing: inherit;
          margin-top: -5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .finished { color: ${styleSheet?.winColor ?? cyan}; }
        .hidden { display: none; }
    `
}