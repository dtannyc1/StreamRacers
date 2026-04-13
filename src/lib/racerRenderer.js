import { drawAllAssets } from '../shared/assetRenderer'
import { loadAssetImage } from '../shared/gifLoader'

export const preloadCarImages = async (car, avatarUrl, assetListRef) => {
  const initTime = performance.now()
  // assetList is the mutable array to populate
  await Promise.all(car.assets.map(async (asset, i) => {
    const avatarImg = new Image()
    avatarImg.crossOrigin = 'anonymous'
    avatarImg.src = avatarUrl
    const { img: loadedImg, frames } = await loadAssetImage(asset, avatarImg)
    assetListRef.current[asset.id] = {
      ...asset,
      img: loadedImg,
      frames,
      frameIndex: 0,
      lastFrameTime: performance.now(),
      initialLoadTime: initTime,
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

// for use only in React editor
export const updateAssetAngles = (asset, assetListRef, timestamp) => {
  const radius = asset.radius ?? 1
  const speed = 200
  const dt = (timestamp - assetListRef.current[asset.id].initialLoadTime) / 1000

  if (asset.type === 'rotating') {
    asset.cur_theta = (speed / radius) * dt % (2 * Math.PI)

  } else if (asset.type === 'oscillating') {
    const slope = (speed / radius) 
    const min = asset.minTheta ?? 0
    const max = asset.maxTheta ?? 0
    const amplitude = (max - min) / 2
    const period = (4 * amplitude) / slope
    const center = (max + min) / 2
    const xshift = (asset.phase ?? 0) * period / (2 * Math.PI)

    const timeWithPhase = (dt + xshift) % period
    let triangle = Math.abs((timeWithPhase / period) * 4 - 2) - 1
    
    let thetad = Math.cos(2 * Math.PI * (dt + xshift) / period)
    let theta_dot = thetad > 0 ? 1 : -1

    asset.cur_theta = center + amplitude * triangle
    asset.theta_dot = theta_dot
  }
}