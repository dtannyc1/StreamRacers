import { loadAssetImage, pauseGIFs, resolveImageUrl } from './gifLoader.js'
import { drawAllAssets, remapImageColor, phaseCorrection, hydrateAsset } from './assetRenderer.js'
import { updateRacerPos, updateRacerVel, updateRacerTime } from './racerLogic.js'

const GRAVITY = 100

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
    this.startY = xy[1]
    this.jumping = false
  }

  static async create({ name, avatar, displayColor, xy, carData }) {
    const car = new Car({ name, avatar, displayColor, xy })
    car.assets = [] 
    car._loadAllAssets(carData)
        .then(loadedAssets => {
            car.assets = loadedAssets; 
        })
        .catch(err => {
            console.error("Failed to load car assets background:", err);
        });
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
      const { correctedTheta, correctedThetaDot } = phaseCorrection(asset, 0)

      const updatedAsset = hydrateAsset(asset)

      return {
        ...updatedAsset,
        img,
        frames,
        frameIndex: 0,
        lastFrameTime: performance.now(),
        remappedImg: null,
        theta_0: asset.theta_0 ?? asset.theta ?? 0,
        theta_dot: correctedThetaDot ?? 1,
        theta: correctedTheta ?? (asset.theta ?? 0),
      }
    }))
  }

  _resolveImageUrl = resolveImageUrl

  applyColorRemaps(displayColor) {
    if (!displayColor) return
    this.assets.forEach(asset => {
      if (!asset.colorRemap?.enabled || !asset.img || asset.type === 'avatar') return
      const img = asset.img
      if (img.complete && img.naturalWidth) {
        asset.remappedImg = remapImageColor(img, asset.colorRemap.sourceColor, displayColor, asset.colorRemap.remapTolerance ?? 10)
      } else {
        img.onload = () => {
          asset.remappedImg = remapImageColor(img, asset.colorRemap.sourceColor, displayColor, asset.colorRemap.remapTolerance ?? 10)
        }
      }
    })
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  update(curTime, clampToStart = false, speedMultiplier = 1) {
    updateRacerVel(this, curTime, true)
    let output = updateRacerPos(this, curTime, clampToStart, speedMultiplier)
    if (this.jumping) {
      if (this.XY[1] >= this.startY) {
        this.XY[1] = this.startY
        this.vel[1] = 0
        this.acc[1] = 0
        this.jumping = false
      }
    }
    updateRacerTime(this, curTime)
    return output
  }

  // ── Drawing ────────────────────────────────────────────────────────────────

  draw(ctx, cameraLoc, racingLine) {
    const pt1 = racingLine.p1[0] < racingLine.p2[0] ? racingLine.p1 : racingLine.p2
    const pt2 = pt1 === racingLine.p1 ? racingLine.p2 : racingLine.p1

    const midY = (pt1[1] + pt2[1]) / 2
    const midDx = (midY - pt1[1]) * (pt2[0] - pt1[0]) / (pt2[1] - pt1[1])
    const dX = (this.startY - pt1[1]) * (pt2[0] - pt1[0]) / (pt2[1] - pt1[1]) - midDx

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

  // ── Jump ──────────────────────────────────────────────────────────────────
  
  jump() {
    if (!this.jumping) {
      this.vel[1] = -50
      this.acc[1] = GRAVITY
      this.jumping = true
    }
  }
}