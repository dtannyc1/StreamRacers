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
    this.finishers = []

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
      this.defaultCarData = raceSettings?.defaultRacer ?? DEFAULT_CAR_DATA
      console.log('Custom car data loaded:', this.customCarData)
      console.log('Default car data loaded:', this.defaultCarData ? 'yes' : 'no')
      if (raceSettings?.carOverride && raceSettings.carOverride.enabled) {
        if (raceSettings.carOverride.userName && raceSettings.carOverride.carName) {
          this.carOverride = this.customCarData[raceSettings.carOverride.userName]?.find(car => car.name === raceSettings.carOverride.carName) || null
          if (this.carOverride) {
            console.log('Car override loaded:', this.carOverride.name)
          } 
        }
      }
      // Override for Capybara Day (July 10th)
      if (today.getMonth() === 6 && today.getDate() === 8) {
        this.carOverride = CAPYCARA
      }
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

    const carList = this.customCarData[username] ?? []
    const filteredCarList = carList.filter((car) => !car.disabled)
    const carData = this.carOverride || ((filteredCarList.length > 0)
      ? filteredCarList[Math.floor(Math.random() * filteredCarList.length)]
      : this.defaultCarData)

    const yMin = Math.min(racingLine.p1[1], racingLine.p2[1])
    const yMax = Math.max(racingLine.p1[1], racingLine.p2[1])
    const y = yMin + Math.random() * (yMax - yMin)

    const car = await Car.create({
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

      let data;

      if (readying) {
        data = car.update(curTime, true, 1)

      } else if (curTime - raceStartTime < setupDuration * 1000) {
        data = car.update(curTime, true, 5)

      } else if (curTime - raceStartTime < (setupDuration + 0.1) * 1000) {
        // Give all cars a boost at the start
        car.vel[0] = 400
        data = car.update(curTime, false, 1)
      } else {
        let prevXY = car.XY.slice()
        data = car.update(curTime, false, 1)
        if (finishX && prevXY[0] <= finishX && car.XY[0] > finishX) {
          this.finishers.push(car.name)
        }
      }

      if (data && Array.isArray(data) && data[0][0] > maxXPos) {
        maxXPos = data[0][0]
        maxXVel = data[1][0]
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

  getRacer(name) {
    return this.cars[name]
  }

  getMaxPosition() {
    return { maxXPos: this.maxXPos, maxXVel: this.maxXVel }
  }

  getFinishers() {
    return [...new Set(this.finishers)] // de-dup in case
  }

  isAllPastCanvas(cameraLoc, canvasWidth) {
    return Object.values(this.cars).every(
      car => car.XY[0] + cameraLoc[0] >= canvasWidth + 8000
    )
  }

  getStandings() {
    return Object.keys(this.cars).sort(
      (a, b) => (this.cars[b]?.XY[0] ?? 0) - (this.cars[a]?.XY[0] ?? 0)
    )
  }

  // ── Reset ──────────────────────────────────────────────────────────────────

  reset() {
    this.cars = {}
    this.sortedNames = []
    this.finishers = []
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

const CAPYCARA = {
  "name": "Capicara",
  "assets": [
    {
      "id": "c130eab6-d57c-4530-a8f8-f0d9235ec244",
      "name": "Avatar",
      "spriteUrl": "https://static-cdn.jtvnw.net/jtv_user_pictures/2b2c6189-0ed0-496a-b7d1-850944989278-profile_image-300x300.png",
      "type": "avatar",
      "tl": [
        -106.40566037735849,
        -196.2048867924528
      ],
      "dim": [
        80,
        80
      ],
      "theta_0": 0,
      "colorRemap": {
        "enabled": false,
        "sourceColor": "#FF001A"
      }
    },
    {
      "id": "3a017f71-8a17-47d6-9963-7f23b1b23e5a",
      "name": "front1",
      "spriteUrl": "https://cdn.streamelements.com/uploads/01knyjfmgws0vg2hx29fpmmhge.png",
      "type": "oscillating",
      "baseDim": [
        200,
        200
      ],
      "tl": [
        -200.83102493074793,
        -201.66204986149586
      ],
      "dim": [
        200,
        200
      ],
      "cr": [
        -55.5480060628234,
        -37.98280457847698
      ],
      "theta_0": 0.29670597283903605,
      "minTheta": -0.5235987755982988,
      "maxTheta": 0.5235987755982988,
      "phase": 0.017453292519943295,
      "radius": 33,
      "handleAngle": 1.6072783699771453
    },
    {
      "id": "a62a22ff-dbb5-4947-b45a-e1d0ffd49b6e",
      "name": "back1",
      "spriteUrl": "https://cdn.streamelements.com/uploads/01knyjj0kqawn58t8hdhkz4517.png",
      "type": "oscillating",
      "baseDim": [
        200,
        200
      ],
      "tl": [
        -200.83102493074793,
        -201.66204986149586
      ],
      "dim": [
        200,
        200
      ],
      "cr": [
        -172.2932890816913,
        -33.73752155960905
      ],
      "theta_0": -0.4537856055185257,
      "minTheta": -0.5235987755982988,
      "maxTheta": 0.5235987755982988,
      "phase": 3.787364476827695,
      "radius": 33,
      "handleAngle": 2.0318433254336803
    },
    {
      "id": "470cbe11-bb2b-45c2-bed1-bad2cca25215",
      "name": "Vehicle",
      "spriteUrl": "https://cdn.streamelements.com/uploads/01knyjcpyrjwp3bv7yw5dhnn0m.png",
      "type": "static",
      "baseDim": [
        200,
        200
      ],
      "tl": [
        -197.16981132075472,
        -197.87735849056602
      ],
      "dim": [
        200,
        200
      ],
      "theta_0": 0,
      "colorRemap": {
        "enabled": false,
        "sourceColor": "#FF001A"
      }
    },
    {
      "id": "96a3db2a-1fec-4855-a0d0-2baaf742f82a",
      "name": "back2",
      "spriteUrl": "https://cdn.streamelements.com/uploads/01knyjdkn9v46gcdsfwayaa448.png",
      "type": "oscillating",
      "baseDim": [
        200,
        200
      ],
      "tl": [
        -206.3679245283019,
        -201.41509433962264
      ],
      "dim": [
        200,
        200
      ],
      "cr": [
        -168.63207547169813,
        -36.32075471698114
      ],
      "theta_0": 0.4886921905584123,
      "minTheta": -0.5235987755982988,
      "maxTheta": 0.5235987755982988,
      "phase": 5.340707511102648,
      "radius": 33,
      "handleAngle": 1.1335069895441605
    },
    {
      "id": "18a4a64a-ae8d-470a-a871-ddcaf07279c4",
      "name": "front2",
      "spriteUrl": "https://cdn.streamelements.com/uploads/01knyjgjgf5mhcpr3sq22sjc7j.png",
      "type": "oscillating",
      "baseDim": [
        200,
        200
      ],
      "tl": [
        -196.4622641509434,
        -202.03248314430567
      ],
      "dim": [
        200,
        200
      ],
      "cr": [
        -59.66981132075472,
        -33.400407672607535
      ],
      "theta_0": -0.5235987755982988,
      "minTheta": -0.5235987755982988,
      "maxTheta": 0.5235987755982988,
      "phase": 2.844886680750757,
      "radius": 33,
      "handleAngle": 2.0719348969351774
    }
  ],
  "disabled": false
}