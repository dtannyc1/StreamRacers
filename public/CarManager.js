import Car from "./Car"

export default class CarManager {
  constructor({ boostCooldown = 10 }) {
    this.boostCooldown = boostCooldown
    this.cars = {}
    this.sortedNames = []
    this.customCarData = {}
    this.defaultCarData = null
    this.avatarCache = {}

    this.loadCustomCarData();
  }

  // ── KVStore ────────────────────────────────────────────────────────────────

  async loadCustomCarData() {
    try {
      const [customData, raceSettings] = await Promise.all([
        SE_API.store.get('customRacers'),
        SE_API.store.get('raceSettings'),
      ])
      this.customCarData = customData ?? {}
      this.defaultCarData = raceSettings ? raceSettings.defaultRacer : null
      console.log('Custom car data loaded:', Object.keys(this.customCarData))
      console.log('Default car data loaded:', this.defaultCarData ? 'yes' : 'no')
    } catch (err) {
      console.warn('Failed to load car data:', err)
      this.customCarData = {}
      this.defaultCarData = null
    }
  }

  // ── Avatar ─────────────────────────────────────────────────────────────────

  async fetchAvatar(username) {
    if (this.avatarCache[username]) return this.avatarCache[username]
    try {
      const url = await fetch(`https://decapi.me/twitch/avatar/${username}`)
        .then(res => res.ok ? res.text() : null)
      if (!url) throw new Error('No avatar URL returned')
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = url
      this.avatarCache[username] = img
      return img
    } catch (err) {
      console.warn(`Failed to fetch avatar for ${username}:`, err)
      return null
    }
  }

  // ── Adding racers ──────────────────────────────────────────────────────────

  async addRacer(username, displayColor, racingLine) {
    if (this.cars[username]) return

    const avatar = await this.fetchAvatar(username)

    const carList = this.customCarData[username]
    const carData = (Array.isArray(carList) && carList.length > 0)
      ? carList[Math.floor(Math.random() * carList.length)]
      : this.defaultCarData

    const yMin = Math.min(racingLine.p1[1], racingLine.p2[1])
    const yMax = Math.max(racingLine.p1[1], racingLine.p2[1])
    const y = yMin + Math.random() * (yMax - yMin)

    const car = new Car({
      name: username,
      avatar,
      displayColor,
      xy: [-1920 - Math.random() * 960, y],
      carData,
    })

    this.cars[username] = car
    this._insertSorted(username)
    console.log(`${username} joined the race!`)
    return car
  }

  _insertSorted(username) {
    this.sortedNames.push(username)
    let j = this.sortedNames.length - 1
    while (j > 0) {
      const a = this.cars[this.sortedNames[j]]
      const b = this.cars[this.sortedNames[j - 1]]
      if (a && b && a.XY[1] < b.XY[1]) {
        ;[this.sortedNames[j], this.sortedNames[j - 1]] = [this.sortedNames[j - 1], this.sortedNames[j]]
        j--
      } else break
    }
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  update(curTime, gameState) {
    const { readying, raceStartTime, setupDuration, finishX, finishingVel } = gameState

    for (const name of this.sortedNames) {
      const car = this.cars[name]
      if (!car) continue

      if (readying) {
        car.update(curTime, true, 1)

      } else if (curTime - raceStartTime < setupDuration * 1000) {
        car.update(curTime, true, 5)

      } else {
        car.vel[0] += (Math.random() - 1 / 3) * car.acc[0]
        car.vel[1] += (Math.random() - 1 / 3) * car.acc[1]
        if (car.vel[0] < 0) car.vel[0] = 0
        if (finishX && car.XY[0] > finishX) car.vel[0] = finishingVel
        car.update(curTime, false, 1)
      }
    }
  }

  // ── Drawing ────────────────────────────────────────────────────────────────

  draw(ctx, cameraLoc, racingLine) {
    for (const name of this.sortedNames) {
        const car = this.cars[name]
        if (car) car.draw(ctx, cameraLoc, racingLine)
    }
  }

  // ── Boost ──────────────────────────────────────────────────────────────────

  applyBoost(username) {
    const car = this.cars[username]
    if (!car) return false
    return car.applyBoost(this.boostCooldown)
  }

  // ── Race state queries ─────────────────────────────────────────────────────

  getMaxPosition() {
    let maxXPos = 0
    let maxXVel = 0
    for (const car of Object.values(this.cars)) {
      if (car.XY[0] > maxXPos) {
        maxXPos = car.XY[0]
        maxXVel = car.vel[0]
      }
    }
    return { maxXPos, maxXVel }
  }

  getFinishers(finishX, curTime) {
    const finishers = []
    for (const car of Object.values(this.cars)) {
      const prevX = car.XY[0] - car.vel[0] * (curTime - car.time) / 1000
      if (finishX && car.XY[0] > finishX && prevX <= finishX) {
        finishers.push(car.name)
      }
    }
    return finishers.sort((a, b) => this.cars[b].XY[0] - this.cars[a].XY[0])
  }

  isAllPastCanvas(cameraLoc, canvasWidth) {
    return Object.values(this.cars).every(
      car => car.XY[0] + cameraLoc[0] >= canvasWidth + 8000
    )
  }

  getStandings() {
    return [...this.sortedNames].sort(
      (a, b) => (this.cars[b]?.XY[0] ?? 0) - (this.cars[a]?.XY[0] ?? 0)
    )
  }

  // ── Reset ──────────────────────────────────────────────────────────────────

  reset() {
    this.cars = {}
    this.sortedNames = []
  }
}