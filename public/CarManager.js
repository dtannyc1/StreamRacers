import Car from "./Car.js"

export default class CarManager {
  constructor({ boostCooldown = 10 }) {
    this.boostCooldown = boostCooldown
    this.cars = {}
    this.sortedNames = []
    this.customCarData = {}
    this.defaultCarData = null
    this.avatarCache = {}
    this.maxXPos = 0
    this.maxXVel = 0

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
      this.defaultCarData = raceSettings?.defaultRacer ? raceSettings.defaultRacer : DEFAULT_CAR_DATA
      console.log('Custom car data loaded:', this.customCarData)
      console.log('Default car data loaded:', this.defaultCarData ? 'yes' : 'no')
    } catch (err) {
      console.warn('Failed to load car data:', err)
      this.customCarData = {}
      this.defaultCarData = DEFAULT_CAR_DATA
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

    car.applyColorRemaps(displayColor)

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
    
    let maxXPos = 0
    let maxXVel = 0
    for (const name of this.sortedNames) {
      const car = this.cars[name]
      if (!car) continue

      let XY, vel;

      if (readying) {
        [XY, vel] = car.update(curTime, true, 1)

      } else if (curTime - raceStartTime < setupDuration * 1000) {
        [XY, vel] = car.update(curTime, true, 5)

      } else {
        car.vel[0] += (Math.random() - 1 / 3) * car.acc[0]
        car.vel[1] += (Math.random() - 1 / 3) * car.acc[1]
        if (car.vel[0] < 0) car.vel[0] = 0
        if (finishX && car.XY[0] > finishX) car.vel[0] = finishingVel
        [XY, vel] = car.update(curTime, false, 1)
      }

      if (XY[0] > maxXPos) {
        maxXPos = car.XY[0]
        maxXVel = car.vel[0]
      }
    }
    this.maxXPos = maxXPos
    this.maxXVel = maxXVel
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
    return { maxXPos: this.maxXPos, maxXVel: this.maxXVel }
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

const DEFAULT_CAR_DATA = {
    "assets": [
        {
            "dim": [
                80,
                80
            ],
            "id": "ee1e1b96-0c0e-426a-92af-980f9c77f8b7",
            "name": "Avatar",
            "spriteUrl": "https://static-cdn.jtvnw.net/jtv_user_pictures/9ee9431b-96be-4490-a71c-edab7f769430-profile_image-300x300.png",
            "theta": 0,
            "tl": [
                -134,
                -130.403
            ],
            "type": "avatar"
        },
        {
            "dim": [
                200,
                200
            ],
            "id": "3959c472-b18e-483d-952e-63b9cd1d3ace",
            "name": "Vehicle",
            "spriteUrl": "https://www.dropbox.com/scl/fi/erc6teenvak8bzkdgkrfr/default_vehicle.png?rlkey=oz9y6z8gr6x3b4ek7nv3s5csh&st=mnd2bytw&dl=0",
            "theta": 0,
            "tl": [
                -183,
                -160.403
            ],
            "type": "static"
        },
        {
            "cr": [
                -135,
                -22.403
            ],
            "dim": [
                192.4,
                120.4
            ],
            "handleAngle": 0,
            "id": "6759f5a3-e0a6-4e13-85bf-448fa086189c",
            "name": "Left Wheel",
            "radius": 20,
            "spriteUrl": "https://www.dropbox.com/scl/fi/h40xha1db6oqsa7n5nibi/default_wheel1.png?rlkey=xtolfaiwu6fsj3w7f23jyt6h8&st=4cr3dmmu&dl=0",
            "theta": 0,
            "tl": [
                -185,
                -120.403
            ],
            "type": "rotating"
        },
        {
            "cr": [
                -40,
                -22.403
            ],
            "dim": [
                192.4,
                120.4
            ],
            "handleAngle": 0,
            "id": "42f0ccd1-79aa-43d9-9dd3-82fdef73f8cd",
            "name": "Right Wheel",
            "radius": 20,
            "spriteUrl": "https://www.dropbox.com/scl/fi/avrdy5jpr2ky0xfo5h6bz/default_wheel2.png?rlkey=msdi1tkjhoot006z1n0cuic5u&st=2ess0iq9&dl=0",
            "theta": 0,
            "tl": [
                -178,
                -120.403
            ],
            "type": "rotating"
        }
    ],
    "name": "Default Car"
}