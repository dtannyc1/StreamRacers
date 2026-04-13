import { drawAllAssets } from '../shared/assetRenderer'
import { loadAssetImage } from '../shared/gifLoader'

export const preloadCarImages = async (car, avatarUrl, assetList) => {
  // assetList is the mutable array to populate
  await Promise.all(car.assets.map(async (asset, i) => {
    const avatar = { naturalWidth: 1, src: avatarUrl }  // mock for preload
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = avatarUrl
    const { img: loadedImg, frames } = await loadAssetImage(asset, img)
    assetList[i] = {
      ...asset,
      img: loadedImg,
      frames,
      frameIndex: 0,
      lastFrameTime: performance.now(),
      currentAngle: asset.theta ?? 0,
    }
  }))
}

export const drawRacer = (ctx, racer, avatarUrl, loadedAssets, t) => {
  if (!loadedAssets?.length) return
  const now = t * 1000  // convert seconds to ms for frame timing
  ctx.save()
  drawAllAssets(ctx, loadedAssets, now)
  ctx.restore()
}