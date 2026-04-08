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
      currentAngle: asset.theta ?? 0,
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

    this._updateAssetAngles(curTime / 1000, speed)

    this.XY[0] += speed * dt
    this.XY[1] += this.vel[1] * dt

    if (clampToStart && this.XY[0] > 0) this.XY[0] = 0

    this.time = curTime
  }

  _updateAssetAngles(t, speed) {
    this.assets.forEach(asset => {
      const radius = asset.radius ?? 1

      if (asset.type === 'rotating') {
        asset.currentAngle = (asset.theta ?? 0) + (speed / radius) * t
        console.log(`Asset ${asset.name} angle: ${asset.currentAngle.toFixed(2)} radians, speed: ${speed.toFixed(2)}, radius: ${radius}`)

      } else if (asset.type === 'oscillating') {
        const min = asset.minTheta ?? -Math.PI / 6
        const max = asset.maxTheta ?? Math.PI / 6
        const phase = asset.phase ?? 0
        const freq = Math.abs(speed / radius)
        const period = freq > 0 ? (2 * Math.PI) / freq : Infinity
        const tp = period < Infinity
          ? ((t + phase / freq) % period + period) % period
          : 0
        const normalized = period < Infinity ? tp / period : 0
        const triangle = normalized < 0.5 ? normalized * 2 : 2 - normalized * 2
        asset.currentAngle = (asset.theta ?? 0) + min + triangle * (max - min)
      }
    })
  }

  // ── Drawing ────────────────────────────────────────────────────────────────

  draw(ctx, cameraLoc, racingLine) {
    const roadMid = (racingLine.p1[1] + racingLine.p2[1]) / 2
    const lineLen = Math.sqrt(
        (racingLine.p2[0] - racingLine.p1[0]) ** 2 +
        (racingLine.p2[1] - racingLine.p1[1]) ** 2
    )
    const ux = (racingLine.p2[0] - racingLine.p1[0]) / lineLen
    const uy = (racingLine.p2[1] - racingLine.p1[1]) / lineLen

    // how far along the racing line is this car's Y lane?
    const t = (this.XY[1] - roadMid)

    ctx.translate(
        cameraLoc[0] + this.XY[0] + t * ux,
        cameraLoc[1] + this.XY[1] + t * uy
    )

    this._drawAssets(ctx)
    ctx.resetTransform()
    }

  _drawAssets(ctx) {
    this.assets.forEach(asset => {
      const img = asset.img
      const [x, y] = asset.tl
      const [w, h] = asset.dim
      const angle = asset.currentAngle ?? (asset.theta ?? 0)

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