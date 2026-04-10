export default class Car {
  constructor({ name, avatar, displayColor, xy, carData }) {
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
    return carData.assets.map(asset => {

      let modifiedAsset = {
        ...asset,
        img: asset.type === 'avatar' ? this.avatar : this._loadImage(asset.spriteUrl),
        remappedImg: null,
        theta_0: asset.theta ?? 0,
        theta_dot: 1,
      }

      if (asset.type === 'oscillating') {
        modifiedAsset.theta = asset.theta + Math.sin(asset.phase ?? 0) * ((asset.maxTheta ?? 0) - (asset.minTheta ?? 0)) / 2 + ((asset.minTheta ?? 0) + (asset.maxTheta ?? 0)) / 2
      }
      
      return modifiedAsset
    })
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

  _remapImageColor(img, sourceHex, targetHex) {
    const offscreen = document.createElement('canvas');
    offscreen.width = img.naturalWidth;
    offscreen.height = img.naturalHeight;
    const ctx = offscreen.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
    const data = imageData.data;

    // --- Conversion Math ---
    const hexToRgb = (hex) => ({
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16)
    });

    const rgbToLab = (r, g, b) => {
        let [vr, vg, vb] = [r / 255, g / 255, b / 255].map(v => 
            v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92
        );
        let x = (vr * 0.4124 + vg * 0.3576 + vb * 0.1805) * 100;
        let y = (vr * 0.2126 + vg * 0.7152 + vb * 0.0722) * 100;
        let z = (vr * 0.0193 + vg * 0.1192 + vb * 0.9505) * 100;

        const f = (t) => t > 0.008856 ? Math.pow(t, 1/3) : (7.787 * t) + (16/116);
        return [(116 * f(y/100)) - 16, 500 * (f(x/95.047) - f(y/100)), 200 * (f(y/100) - f(z/108.883))];
    };

    const labToRgb = (l, a, b_) => {
        let y = (l + 16) / 116;
        let x = a / 500 + y;
        let z = y - b_ / 200;

        const fInv = (t) => t > 0.20689 ? Math.pow(t, 3) : (t - 16/116) / 7.787;
        let r = (fInv(x) * 95.047) / 100, gy = (fInv(y) * 100) / 100, b = (fInv(z) * 108.883) / 100;

        let vr = r * 3.2406 + gy * -1.5372 + b * -0.4986;
        let vg = r * -0.9689 + gy * 1.8758 + b * 0.0415;
        let vb = r * 0.0557 + gy * -0.2040 + b * 1.0570;

        return [vr, vg, vb].map(v => 
            Math.round(Math.max(0, Math.min(1, v > 0.0031308 ? 1.055 * Math.pow(v, 1/2.4) - 0.055 : 12.92 * v)) * 255)
        );
    };

    // --- Pre-calculate Shifting Logic ---
    const sRgb = hexToRgb(sourceHex);
    const tRgb = hexToRgb(targetHex);
    const sLab = rgbToLab(sRgb.r, sRgb.g, sRgb.b);
    const tLab = rgbToLab(tRgb.r, tRgb.g, tRgb.b);

    // The shift in LAB space
    const dL = tLab[0] - sLab[0];
    const dA = tLab[1] - sLab[1];
    const dB = tLab[2] - sLab[2];

    const tolerance = 18; // Delta E threshold

    for (let i = 0; i < data.length; i += 4) {
        const cLab = rgbToLab(data[i], data[i+1], data[i+2]);
        
        const deltaE = Math.sqrt(
            Math.pow(cLab[0] - sLab[0], 2) +
            Math.pow(cLab[1] - sLab[1], 2) +
            Math.pow(cLab[2] - sLab[2], 2)
        );

        if (deltaE <= tolerance) {
            // Apply the shift in Lab space
            const newRgb = labToRgb(
                cLab[0] + dL, 
                cLab[1] + dA, 
                cLab[2] + dB
            );
            data[i] = newRgb[0];
            data[i+1] = newRgb[1];
            data[i+2] = newRgb[2];
        }
    }

    ctx.putImageData(imageData, 0, 0);
    const remapped = new Image();
    remapped.src = offscreen.toDataURL();
    return remapped;
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

    if (clampToStart && this.XY[0] > 0) {
      this.XY[0] = 0
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

    this._drawAssets(ctx)
    ctx.resetTransform()
    }

  _drawAssets(ctx) {
    this.assets.forEach(asset => {
      const img = (asset.colorRemap?.enabled && asset.remappedImg) ? asset.remappedImg : asset.img
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