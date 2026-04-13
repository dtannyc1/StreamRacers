import { loadAssetImage, pauseGIFs } from './gifLoader.js'
import { drawAllAssets, remapImageColor } from './assetRenderer.js'

export default class Car {
  constructor({ name, avatar, displayColor, xy }) {
    this.name = name
    this.displayColor = displayColor
    this.avatar = avatar

    // physics
    this.XY = xy
    this.vel = [200, 0]
    this.acc = [6, 0]
    this.time = Date.now()
    this.showBoost = false
    this.lastBoost = null
  }

  static async create({ name, avatar, displayColor, xy, carData }) {
    const car = new Car({ name, avatar, displayColor, xy })
    car.assets = await car._loadAllAssets(carData)
    return car
  }

  // ── Asset loading ──────────────────────────────────────────────────────────

  _loadImage(url) {
    if (!url) return null
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = this._resolveImageUrl(url)
    return img
  }

  async _loadAllAssets(carData) {
    if (!carData?.assets?.length) return []
    return await Promise.all(carData.assets.map(async asset => {
      const { img, frames } = await loadAssetImage(asset, this.avatar)
      return {
        ...asset,
        img,
        frames,
        frameIndex: 0,
        lastFrameTime: performance.now(),
        remappedImg: null,
        currentAngle: asset.theta ?? 0,
      }
    }))
  }

  _resolveImageUrl = (url) => {
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

  applyColorRemaps(displayColor) {
    if (!displayColor) return
    this.assets.forEach(asset => {
      if (!asset.colorRemap?.enabled || !asset.img || asset.type === 'avatar') return
      const img = asset.img
      if (img.complete && img.naturalWidth) {
        asset.remappedImg = this._remapImageColor(img, asset.colorRemap.sourceColor, displayColor)
      } else {
        img.onload = () => {
          asset.remappedImg = this._remapImageColor(img, asset.colorRemap.sourceColor, displayColor)
        }
      }
    })
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  update(curTime, clampToStart = false, speedMultiplier = 1) {
    const dt = (curTime - this.time) / 1000
    if (dt <= 0) return [this.XY, this.vel]
    const speed = this.vel[0] * speedMultiplier

    this.XY[0] += speed * dt
    this.XY[1] += this.vel[1] * dt

    const clamped = clampToStart && this.XY[0] > 0
    if (clamped) {
      this.XY[0] = 0
      pauseGIFs(this.assets, performance.now())
    } else {
      this._updateAssetAngles(dt, speed)
    }

    this.time = curTime
    return [this.XY, this.vel]
  }

  _updateAssetAngles(dt, speed) {
    this.assets.forEach(asset => {
      const radius = asset.radius ?? 1

      if (asset.type === 'rotating') {
        asset.theta = ((asset.theta ?? 0) + (speed / radius) * dt) % (2 * Math.PI)

      } else if (asset.type === 'oscillating') {
        const min = asset.minTheta ?? -Math.PI / 6
        const max = asset.maxTheta ?? Math.PI / 6
        asset.theta = (asset.theta ?? 0) + asset.theta_dot * (speed / radius) * dt
        if (asset.theta_dot > 0 && asset.theta - asset.theta_0 > max) {
          asset.theta = max + asset.theta_0
          asset.theta_dot *= -1
        } else if (asset.theta_dot < 0 && asset.theta - asset.theta_0 < min) {
          asset.theta = min + asset.theta_0
          asset.theta_dot *= -1
        }
      }
    })
  }

  // ── Drawing ────────────────────────────────────────────────────────────────

  draw(ctx, cameraLoc, racingLine) {
    const pt1 = racingLine.p1[0] < racingLine.p2[0] ? racingLine.p1 : racingLine.p2
    const pt2 = pt1 === racingLine.p1 ? racingLine.p2 : racingLine.p1

    const midY = (pt1[1] + pt2[1]) / 2
    const midDx = (midY - pt1[1]) * (pt2[0] - pt1[0]) / (pt2[1] - pt1[1])
    const dX = (this.XY[1] - pt1[1]) * (pt2[0] - pt1[0]) / (pt2[1] - pt1[1]) - midDx

    ctx.translate(
        cameraLoc[0] + this.XY[0] + dX,
        cameraLoc[1] + this.XY[1]
    )
    const now = performance.now()

    this._drawAssets(ctx, now)
    ctx.resetTransform()
  }

  _drawAssets(ctx, now) {
    drawAllAssets(ctx, this.assets, now)
  }

  applyColorRemaps(displayColor) {
    this.assets.forEach(asset => {
      if (!asset.colorRemap?.enabled || !asset.img || asset.type === 'avatar') return
      const apply = () => {
        asset.remappedImg = remapImageColor(asset.img, asset.colorRemap.sourceColor, displayColor)
      }
      if (asset.img.complete && asset.img.naturalWidth) {
        apply()
      } else {
        asset.img.onload = apply
      }
    })
  }

  // ── Boost ──────────────────────────────────────────────────────────────────

  applyBoost(boostCooldown = 10) {
    if (!this.lastBoost || Date.now() - this.lastBoost > boostCooldown * 1000) {
      this.vel[0] *= 1.2
      this.lastBoost = Date.now()
      this.showBoost = true
      setTimeout(() => { this.showBoost = false }, 2000)
      return true
    }
    return false
  }
}