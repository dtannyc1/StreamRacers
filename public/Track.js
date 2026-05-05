export default class Track {
  constructor(trackData) {
    this.name = trackData.name

    this.road = trackData.road ?? { type: 'rainbow', color: '#888888' }
    this.racingLine = trackData.racingLine
    this.stands = trackData.stands ?? null
    this.scrollingImage = trackData.scrollingImage ?? null
    this.backgroundAssets = trackData.backgroundAssets ?? []
    this.foregroundAssets = trackData.foregroundAssets ?? []
    this.styleSheet = trackData.styleSheet ?? null

    this.activeBackgrounds = []
    this.activeForegrounds = []

    this.images = {}
    this._loadImages()
  }

  // ── Derived from racing line ───────────────────────────────────────────────

  get roadTop() {
    return Math.min(this.racingLine.p1[1], this.racingLine.p2[1])
  }

  get roadBottom() {
    return Math.max(this.racingLine.p1[1], this.racingLine.p2[1])
  }

  get roadHeight() {
    return this.roadBottom - this.roadTop
  }

  get crossingX() {
    return (this.racingLine.p1[0] + this.racingLine.p2[0]) / 2
  }

  // ── KVStore ────────────────────────────────────────────────────────────────

  static async load() {
    try {
      const [tracksData, settings] = await Promise.all([
          SE_API.store.get('customTracks'),
          SE_API.store.get('raceSettings'),
      ])

      this.defaultTrack = settings?.defaultTrack ?? null
      this.customTracks = tracksData ?? {}
      const names = Object.keys(this.customTracks)

      // use default if set and exists, otherwise pick random
      let trackData = null
      if (this.defaultTrack && this.customTracks[this.defaultTrack]) {
          trackData = this.customTracks[this.defaultTrack]
          console.log('Using default track:', this.defaultTrack)
      } else if (names.length) {
          const name = names[Math.floor(Math.random() * names.length)]
          trackData = this.customTracks[name]
          console.log('Using random track:', name)
      } else {
        return new Track(structuredClone(DEFAULT_TRACK))
          // throw new Error('No tracks available')
      }

      return new Track(trackData)
    } catch (err) {
      console.warn('Failed to load track:', err)
      return null
    }
  }

  // ── Image loading ──────────────────────────────────────────────────────────

  _loadImage(url) {
    if (!url) return null
    if (this.images[url]) return this.images[url]
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = this._resolveImageUrl(url)
    this.images[url] = img
    return img
  }

  _loadImages() {
    if (this.road.type === 'image') this._loadImage(this.road.url)
    if (this.scrollingImage?.url) this._loadImage(this.scrollingImage.url)
    if (this.stands?.url) this._loadImage(this.stands.url)
    if (this.racingLine?.url) this._loadImage(this.racingLine.url)
    this.racingLine?.startModifiers?.forEach(m => this._loadImage(m.url))
    this.racingLine?.finishModifiers?.forEach(m => this._loadImage(m.url))
    this.backgroundAssets.forEach(a => this._loadImage(a.url))
    this.foregroundAssets.forEach(a => this._loadImage(a.url))
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

  // ── Scattered asset management ─────────────────────────────────────────────

  _randomVal(a, b) {
    const min = Math.min(a, b)
    const max = Math.max(a, b)
    return Math.random() * (max - min) + min;
  }

  _createInstance(asset, drawAnywhere, cameraLoc, canvasWidth) {
    const w = asset.dim[0] * asset.scale
    let h = asset.dim[1] * asset.scale
    const depthRange = asset.depthRange ?? [0,10] 
    const depth = this._randomVal(depthRange[0], depthRange[1])
    const parallaxFactor = depth * 0.6/10 // value should be 0-0.6

    // y anchors to road top, slightly offset for depth
    const y = this.roadTop - h - (depth * 2)
    h = h + (depth * 2)

    const x = drawAnywhere
      ? -canvasWidth * 0.75 + Math.random() * canvasWidth * 2 - w
      : canvasWidth - cameraLoc[0] + Math.random() * canvasWidth / 4

    return { asset, x, y, w, h, parallaxFactor }
  }

  _avoidsOverlap(instance, list) {
    for (const existing of list) {
      if (
        instance.x < existing.x + existing.w &&
        instance.x + instance.w > existing.x
      ) return false
    }
    return true
  }

  _addBackgroundItem(drawAnywhere, cameraLoc, canvasWidth) {
    if (!this.backgroundAssets.length) return
    
    const asset = this.backgroundAssets[Math.floor(Math.random() * this.backgroundAssets.length)]
    let instance = this._createInstance(asset, drawAnywhere, cameraLoc, canvasWidth)

    let attempts = 0
    while (!this._avoidsOverlap(instance, this.activeBackgrounds) && attempts < 20) {
      instance.x += instance.w
      attempts++
    }

    this.activeBackgrounds.push(instance)

    this.activeBackgrounds.sort((a, b) => b.parallaxFactor - a.parallaxFactor)
  }

  _addForegroundItem(drawAnywhere, cameraLoc, canvasWidth, finishX) {
    if (!this.foregroundAssets.length) return
    const asset = this.foregroundAssets[Math.floor(Math.random() * this.foregroundAssets.length)]
    const w = asset.dim[0] * asset.scale
    const h = asset.dim[1] * asset.scale
    const y = this.roadBottom - h

    let x = drawAnywhere
      ? -canvasWidth * 0.75 + Math.random() * canvasWidth * 2 - w
      : canvasWidth - cameraLoc[0] + Math.random() * canvasWidth / 4

    // avoid covering start line
    if (x > -200 && x < 100) x += 300

    // avoid covering finish line
    if (finishX && x - finishX > -200 && x - finishX < 100) x += 300

    let instance = { asset, x, y, w, h }
    let attempts = 0
    while (!this._avoidsOverlap(instance, this.activeForegrounds) && attempts < 20) {
      instance.x += w
      attempts++
    }

    this.activeForegrounds.push(instance)
  }

  resetScatteredArt(cameraLoc, canvasWidth) {
    this.activeBackgrounds = []
    this.activeForegrounds = []

    let count = this._randomVal(6, 20)
    for (let i = 0; i < count; i++) {
      this._addBackgroundItem(true, cameraLoc, canvasWidth)
    }

    const fgCount = Math.floor(2 + Math.random() * 2)
    for (let i = 0; i < fgCount; i++) {
      this._addForegroundItem(true, cameraLoc, canvasWidth, null)
    }
  }

  updateScatteredArt(dX, cameraLoc, canvasWidth, finishX) {
    for (const item of this.activeBackgrounds) {
      item.x -= dX * (item.parallaxFactor ?? 0)
    }

    // remove off-screen, maybe add new ones
    const remove = this.activeBackgrounds
      .map((item, i) => item.x + cameraLoc[0] < (-Math.abs(item.w ?? 400) - 100) ? i : -1)
      .filter(i => i >= 0)

    for (const i of remove.reverse()) {
      this.activeBackgrounds.splice(i, 1)
    }

    // add back more backgrounds once complete
    for (let i = 0; i < remove.length; i++) {
      const newCount = Math.floor((Math.random() - 1 / 3) * 3)
      for (let k = 0; k < newCount; k++) {
        this._addBackgroundItem(false, cameraLoc, canvasWidth)
      }
    }

    if (this.activeBackgrounds.length <= 2) {
      for (let k = 0; k < 3; k++) {
        this._addBackgroundItem(false, cameraLoc, canvasWidth)
      }
    }

    const fgRemove = this.activeForegrounds
      .map((item, i) => item.x + cameraLoc[0] < (-Math.abs(item.w ?? 400) - 100) ? i : -1)
      .filter(i => i >= 0)

    for (const i of fgRemove.reverse()) {
      this.activeForegrounds.splice(i, 1)
      this._addForegroundItem(false, cameraLoc, canvasWidth, finishX)
    }
  }

  // ── Drawing ────────────────────────────────────────────────────────────────

  drawBackground(ctx, cameraLoc, canvasWidth, canvasHeight) {
    // road
    this._drawRoad(ctx, canvasWidth)

    // scrolling image
    if (this.scrollingImage?.url) {
      this._drawScrolling(ctx, this.scrollingImage, cameraLoc, canvasWidth)
    }

    ctx.save()
    ctx.translate(...cameraLoc)
    for (const item of this.activeBackgrounds) {
      const img = this.images[item.asset.url]
      if (img?.naturalWidth) {
        ctx.drawImage(img, item.x, item.y, item.w, item.h)  
      }
    }
    ctx.restore()
  }

  drawForeground(ctx, cameraLoc, canvasWidth, finishX) {
    ctx.save()
    ctx.translate(...cameraLoc)
    for (const item of this.activeForegrounds) {
      const img = this.images[item.asset.url]
      if (img?.naturalWidth) ctx.drawImage(img, item.x, item.y, item.w, item.h)
    }
    ctx.restore()
  }

  _drawRoad(ctx, canvasWidth) {
    const { type, color, url, x, y, dim, scale } = this.road

    if (type === 'rainbow') {
      const numDiv = 10
      ctx.fillStyle = 'black'
      ctx.fillRect(0, this.roadTop - this.roadHeight * 2 / numDiv, canvasWidth,
        this.roadHeight + this.roadHeight * 4 / numDiv)
      for (let i = 0; i < numDiv; i++) {
        ctx.fillStyle = `hsl(${Math.floor(i * 360 / numDiv)},100%,50%)`
        ctx.fillRect(0, this.roadTop + this.roadHeight * (numDiv - i - 1) / numDiv,
          canvasWidth, this.roadHeight / numDiv)
      }

    } else if (type === 'solid') {
      ctx.fillStyle = 'black'
      ctx.fillRect(0, this.roadTop - this.roadHeight * 0.2, canvasWidth, this.roadHeight * 1.4)
      ctx.fillStyle = color ?? '#888888'
      ctx.fillRect(0, this.roadTop, canvasWidth, this.roadHeight)

    } else if (type === 'image') {
      const img = this.images[url]
      if (img?.naturalWidth) {
        ctx.drawImage(img, x ?? 0, y ?? 0, dim[0] * (scale ?? 1), dim[1] * (scale ?? 1))
      }
    }
  }

  _drawScrolling(ctx, slot, cameraLoc, canvasWidth) {
    const img = this.images[slot.url]
    if (!img?.naturalWidth) return
    const w = slot.dim ? slot.dim[0] * (slot.scale ?? 1) : canvasWidth
    const h = slot.dim ? slot.dim[1] * (slot.scale ?? 1) : canvasWidth
    const ox = (slot.x ?? 0) + cameraLoc[0] % w
    ctx.drawImage(img, ox - w, slot.y ?? 0, w, h)
    ctx.drawImage(img, ox, slot.y ?? 0, w, h)
    ctx.drawImage(img, ox + w, slot.y ?? 0, w, h)
  }

  _drawRacingLine(ctx, cameraLoc, worldX, isStart) {
    const rl = this.racingLine
    if (!rl?.url) return
    const img = this.images[rl.url]
    const w = rl.dim[0] * rl.scale
    const h = rl.dim[1] * rl.scale

    ctx.save()
    ctx.translate(cameraLoc[0] + worldX, cameraLoc[1])

    if (img?.naturalWidth) {
      ctx.drawImage(img, rl.x - w / 2, rl.y - h / 2, w, h)
    }

    const modifiers = isStart ? rl.startModifiers : rl.finishModifiers
    for (const mod of modifiers ?? []) {
      const mimg = this.images[mod.url]
      if (!mimg?.naturalWidth) continue
      const mw = mod.dim[0] * mod.scale
      const mh = mod.dim[1] * mod.scale
      ctx.drawImage(mimg, mod.x - mw / 2, mod.y - mh / 2, mw, mh)
    }

    ctx.restore()
  }

  _drawStands(ctx, cameraLoc, finishX) {
    if (!this.stands?.url) return
    const img = this.images[this.stands.url]
    if (!img?.naturalWidth) return
    const w = this.stands.dim[0] * this.stands.scale
    const h = this.stands.dim[1] * this.stands.scale
    ctx.save()
    ctx.translate(cameraLoc[0] + finishX, 0)
    ctx.drawImage(img, -w / 2, this.roadTop - h, w, h)
    ctx.restore()
  }
}

const DEFAULT_TRACK = {
  name,
  road: {
    type: 'solid',
    color: '#888888',
    url: '',
    dim: [1920, 1080],
    scale: 1,
    x: 0,
    y: 0,
  },
  racingLine: {
    url: 'https://www.dropbox.com/scl/fi/sp4n0j6iqbnpnme05zhak/racing_line.png?rlkey=rf7wga3zfnrz52z57i258vi1y&st=1xta8b3i&dl=0',
    dim: [200, 200],
    scale: 1,
    x: 1550,
    y: 974,
    p1: [1591, 1060],
    p2: [1497, 948],
    startModifiers: [
      {
        id: crypto.randomUUID(),
        name: 'Start Flag',
        url: 'https://www.dropbox.com/scl/fi/6sy2a7pvvuwkozk3tvbvq/start_flag.png?rlkey=ik03ay7yv17yv5bxk1lvhl39q&st=o1bcpem9&dl=0',
        dim: [200, 200],
        scale: 1,
        x: 1550,
        y: 974,
      },
    ],
    finishModifiers: [
      {
        id: crypto.randomUUID(),
        name: 'Finish Flag',
        url: 'https://www.dropbox.com/scl/fi/elrpti7l28qro4soudskz/finish_flag.png?rlkey=q8jsg8bt2dqzhqpj2litbmcsf&st=23463vos&dl=0',
        dim: [200, 200],
        scale: 1,
        x: 1550,
        y: 974,
      },
    ],
  },
  scrollingImage: {
    url: 'https://www.dropbox.com/scl/fi/hn1n4o8t737jxiqs5wse4/yellow_lines.png?rlkey=gxe6nyrkb66sblqoj1t8fnndr&st=op0dyf4q&dl=0',
    dim: [1920, 1080],
    scale: 1,
    x: 0,
    y: -15,
  },
  backgroundAssets: [],
  foregroundAssets: [],
}