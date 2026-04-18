import { loadAssetImage, pauseGIFs } from './gifLoader.js'
import { drawAllAssets, remapImageColor } from './assetRenderer.js'
import { updateRacerPos } from './racerLogic.js'

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

      // account for phase if oscillator
      let correctedTheta, correctedThetaDot;
      if (asset.type === 'oscillating') {
        const radius = asset.radius ?? 1
        const speed = 200
        const dt = 0
        const slope = (speed / radius) 
        const min = asset.minTheta ?? 0
        const max = asset.maxTheta ?? 0
        const amplitude = (max - min) / 2
        const period = (4 * amplitude) / slope
        const center = (max + min) / 2
        const xshift = (asset.phase ?? 0) * period / (2 * Math.PI)

        const timeWithPhase = (dt + xshift) % period
        const triangle = Math.abs((timeWithPhase / period) * 4 - 2) - 1
        
        const thetad = Math.cos(2 * Math.PI * (dt + xshift) / period)
        const theta_dot = thetad > 0 ? 1 : -1

        correctedTheta = center + amplitude * triangle
        correctedThetaDot = theta_dot
      }

      return {
        ...asset,
        img,
        frames,
        frameIndex: 0,
        lastFrameTime: performance.now(),
        remappedImg: null,
        theta_0: asset.theta ?? 0,
        theta_dot: correctedThetaDot ?? 1,
        theta: correctedTheta ?? (asset.theta ?? 0),
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
        asset.remappedImg = remapImageColor(img, asset.colorRemap.sourceColor, displayColor)
      } else {
        img.onload = () => {
          asset.remappedImg = remapImageColor(img, asset.colorRemap.sourceColor, displayColor)
        }
      }
    })
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  update(curTime, clampToStart = false, speedMultiplier = 1) {
    return updateRacerPos(this, curTime, clampToStart, speedMultiplier)
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