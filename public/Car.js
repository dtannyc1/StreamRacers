export default class Car {
  constructor({ name, avatar, displayColor, xy, carData }) {
    this.name = name
    this.displayColor = displayColor || '#FF0000'
    this.avatar = avatar

    // physics
    this.XY = xy
    this.vel = [200, 0]
    this.acc = [6, 0]
    this.time = Date.now()
    this.showBoost = false
    this.lastBoost = null

    this.assets = this._loadAssets(carData)
  }

  // ── Asset loading ──────────────────────────────────────────────────────────

  _loadImage(url) {
    if (!url) return null
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = this._resolveImageUrl(url)
    return img
  }

  _loadAssets(carData) {
    if (!carData?.assets?.length) return []
    return carData.assets.map(asset => ({
      ...asset,
      img: asset.type === 'avatar' ? this.avatar : this._loadImage(asset.spriteUrl),
      theta_dot: 1,
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

  // ── Update ─────────────────────────────────────────────────────────────────

  update(curTime, clampToStart = false, speedMultiplier = 1) {
    const dt = (curTime - this.time) / 1000
    const speed = this.vel[0] * speedMultiplier
    const currentAngle = JSON.parse(JSON.stringify(this.theta ?? 0)) 

    this._updateAssetAngles(dt, speed)

    this.XY[0] += speed * dt
    this.XY[1] += this.vel[1] * dt

    if (clampToStart && this.XY[0] > 0) {
      this.XY[0] = 0
      this.theta = currentAngle
    }

    this.time = curTime
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
        if (asset.theta_dot > 0 && asset.theta > max) {
          asset.theta = max
          asset.theta_dot *= -1
        } else if (asset.theta_dot < 0 && asset.theta < min) {
          asset.theta = min
          asset.theta_dot *= -1
        }
      }
    })
  }

  // ── Drawing ────────────────────────────────────────────────────────────────

  draw(ctx, cameraLoc, racingLine) {
    const pt1 = racingLine.p1[0] < racingLine.p2[0] ? racingLine.p1 : racingLine.p2
    const pt2 = pt1 === racingLine.p1 ? racingLine.p2 : racingLine.p1

    const dX = (this.XY[1] - pt1[1]) * (pt2[0] - pt1[0]) / (pt2[1] - pt1[1])

    ctx.translate(
        cameraLoc[0] + this.XY[0] + dX,
        cameraLoc[1] + this.XY[1]
    )

    this._drawAssets(ctx)
    ctx.resetTransform()
    }

  _drawAssets(ctx) {
    this.assets.forEach(asset => {
      const img = asset.img
      const [x, y] = asset.tl
      const [w, h] = asset.dim
      const angle = asset.theta ?? 0

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
        if (img?.naturalWidth) ctx.drawImage(img, x, y, w, h)

      } else if (asset.type === 'static') {
        if (angle !== 0) {
          ctx.translate(x + w / 2, y + h / 2)
          ctx.rotate(angle)
          ctx.translate(-(x + w / 2), -(y + h / 2))
        }
        if (img?.naturalWidth) ctx.drawImage(img, x, y, w, h)

      } else if (asset.type === 'rotating' || asset.type === 'oscillating') {
        const [cx, cy] = asset.cr ?? [x + w / 2, y + h / 2]
        ctx.translate(cx, cy)
        ctx.rotate(angle)
        ctx.translate(-cx, -cy)
        if (img?.naturalWidth) ctx.drawImage(img, x, y, w, h)
      }

      ctx.restore()
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