import { getCurrentFrame } from './gifLoader.js'

export const isReady = (drawable) => {
  if (!drawable) return false
  if (drawable instanceof HTMLCanvasElement) return true
  return !!drawable.naturalWidth
}

export const hydrateAsset = (asset) => {
  if (asset.type !== 'custom' || !asset.drawCode || !asset.updateCode) return asset;
  try {
    return {
      ...asset,
      // Compile strings into executable functions
      draw: new Function('ctx', 'asset', 'drawable', asset.drawCode),
      update: new Function('asset', 'dt', 'speed', asset.updateCode),
      error: null,
      isBroken: false,
    };
  } catch (err) {
    return { ...asset, error: `Compile Error: ${err.message}`, isBroken: true };
  }
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

  if (asset.type === 'custom') {
    if (typeof asset.draw === 'function' && asset.isBroken !== true) {
      try {
        asset.draw(ctx, asset, drawable)
      } catch (err) {
        console.error("Custom draw function failed. Disabling for this asset.", err)
        asset.isBroken = true 
      }
    }
  } else if (asset.type === 'avatar') {
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

export const remapImageColor = (img, sourceHex, targetHex, tolerance = 10) => {
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

  for (let i = 0; i < data.length; i += 4) {
    if (
      Math.abs(data[i] - sr) <= tolerance &&
      Math.abs(data[i + 1] - sg) <= tolerance &&
      Math.abs(data[i + 2] - sb) <= tolerance
    ) {
      data[i] = tr + data[i] - sr
      data[i + 1] = tg + data[i + 1] - sg
      data[i + 2] = tb + data[i + 2] - sb
    }
  }

  ctx.putImageData(imageData, 0, 0)
  const remapped = new Image()
  remapped.src = offscreen.toDataURL()
  return remapped
}

export const getComplementaryColor = (hex) => {
    // 1. Remove the hash symbol if present
    const cleanHex = hex.replace('#', '');

    // 2. Parse the r, g, b values
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // 3. Invert the values by subtracting from 255
    // 4. Convert back to hex and pad with '0' to ensure 2 digits
    const rComp = (255 - r).toString(16).padStart(2, '0');
    const gComp = (255 - g).toString(16).padStart(2, '0');
    const bComp = (255 - b).toString(16).padStart(2, '0');

    // 5. Combine and return
    return `#${rComp}${gComp}${bComp}`;
}

export const convertToStyleSheet = (styleSheet) => {
  return `
        .leaderboard {
          opacity: 0;
          position: absolute;
          top: ${styleSheet?.top ?? 320}px;
          left: ${styleSheet?.left ?? 1425}px;
          width: ${styleSheet?.width ?? 28}px;
          padding: ${styleSheet?.paddingY ?? 20}px ${styleSheet?.paddingX ?? 25}px;
          font: ${styleSheet?.fontSize ?? 32}px ${styleSheet?.font ?? "Oswald"};
          display: ${(styleSheet?.enabled ?? true) === false ? 'none' : 'flex'};
          flex-direction: column;
          border-radius: 25px;
          background-color: ${(styleSheet?.backgroundColor ?? "#000000") + 
            Math.round((styleSheet?.backgroundOpacity ?? 1) * 255).toString(16)
          };
          letter-spacing: ${styleSheet?.letterSpacing ?? 1.5}px;
          box-sizing: border-box;
        }
        .leaderboard-item { 
          color: ${styleSheet?.color ?? "white"}; 
          font: inherit;
          letter-spacing: inherit;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: ${styleSheet?.ySpacing ?? -5}px;
        }
        .finished { color: ${styleSheet?.winColor ?? "cyan"}; }
        .hidden { display: none; }
    `
}