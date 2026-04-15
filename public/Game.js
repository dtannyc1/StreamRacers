import CarManager from './CarManager.js'
import Track from './Track.js'

class Game {
  constructor() {
    let canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    document.body.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d')

    this.track = null
    this.carManager = null

    this.cameraLoc = [this.canvas.width * 0.75, 0]
    this.resetCameraLoc = [this.canvas.width * 0.75, 0]

    // race state
    this.readying = false
    this.raceStartTime = null
    this.setupDuration = 5
    this.raceDuration = 30
    this.finishX = null
    this.finishingVel = 1000
    this.winner = null
    this.leaderboard = []
    this.standings = []
    this.prevStandingsUpdateTime = 0
    this.standingsUpdateDur = 0.5
    this.stopRace = false
    this.hidden = false
    this.isUpdatingRacers = false

    this.joinCommands = ['!join']
    this.goCommands = ['!go', '!potato']
    this.resetCommands = ['!reset']
    this.messages = {
      "boostFound": "OUI! {username} FOUND IT!",
      "raceStarted": "Race started!",
      "winner": "!addqwoin {username} 5",
      "wordClue": "Guess the word I'm thinking of for a boost! The category is: {category}"
    }
    // word boost
    this.wordBank = {
      food: ['pizza', 'chocolate', 'sushi', 'ice cream', 'burger', 'pasta', 'salad', 'potato', 'taco', 'steak', 'papaya', 'cake', 'popcorn', 'pancake', 'sandwich', 'cheese', 'fruit', 'cookie', 'ramen', 'grilled cheese'],
      'video game titles': ['Zelda', 'Mario', 'Fortnite', 'Minecraft', 'Call of Duty', 'Overwatch', "Assassin's Creed", 'Grand Theft Auto', 'FIFA', 'World of Warcraft', 'Destiny', 'Halo', 'Dota', 'League of Legends', 'Final Fantasy', 'Skyrim', 'Rocket League', 'Mortal Kombat', 'Witcher', 'Splatoon'],
      'music genre': ['rock', 'pop', 'hip hop', 'jazz', 'classical', 'country', 'rap', 'blues', 'reggae', 'electronic', 'indie', 'folk', 'punk', 'metal', 'soul', 'R&B', 'dance', 'alternative', 'latin', 'world'],
      'disney character': ['Mickey Mouse', 'Cinderella', 'Simba', 'Mufasa', 'Aladdin', 'Mulan', 'Woody', 'Elsa', 'Donald Duck', 'Moana', 'Belle', 'Beast', 'Pocahontas', 'Goofy', 'Ariel', 'Dumbo', 'Snow White', 'Peter Pan'],
      'musical instruments': ['guitar', 'piano', 'violin', 'trumpet', 'drum', 'flute', 'saxophone', 'clarinet', 'bass', 'cello', 'trombone', 'ukulele', 'accordion', 'harmonica', 'banjo', 'bagpipe', 'harp', 'mandolin'],
      'french verbs': ['aller', 'avoir', 'faire', 'pouvoir', 'vouloir', 'dire', 'savoir', 'voir', 'venir', 'devoir', 'prendre', 'mettre', 'aimer', 'parler', 'manger', 'boire', 'travailler', 'partir', 'habiter'],
      colors: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'gray', 'brown', 'teal', 'maroon', 'navy', 'lavender', 'turquoise', 'gold', 'silver', 'indigo', 'crimson'],
      animals: ['dog', 'cat', 'elephant', 'lion', 'tiger', 'giraffe', 'zebra', 'monkey', 'bear', 'fox', 'rabbit', 'deer', 'horse', 'cow', 'sheep', 'goat', 'pig', 'chicken', 'duck', 'fish'],
      drinks: ['water', 'coffee', 'tea', 'juice', 'soda', 'smoothie', 'milk', 'wine', 'beer', 'cocktail', 'lemonade', 'iced tea', 'hot chocolate', 'red bull', 'chai', 'sake', 'whiskey', 'vodka', 'rum', 'gin'],
      clothes: ['shirt', 'pants', 'dress', 'skirt', 'jacket', 'sweater', 'coat', 'blouse', 'tie', 'scarf', 'hat', 'gloves', 'socks', 'shoes', 'boots', 'sandals', 'jeans', 'trousers', 'belt'],
      fruits: ['apple', 'banana', 'orange', 'strawberry', 'grape', 'watermelon', 'kiwi', 'pineapple', 'peach', 'pear', 'plum', 'cherry', 'mango', 'blueberry', 'raspberry', 'blackberry', 'lemon', 'lime', 'coconut', 'dragonfruit'],
      'something green': ['grass', 'tree', 'leaf', 'lime', 'cucumber', 'broccoli', 'avocado', 'pickle', 'pea', 'lettuce', 'spinach', 'cabbage', 'emerald', 'zucchini', 'pepper', 'seaweed', 'mint'],
      furniture: ['chair', 'table', 'sofa', 'bed', 'desk', 'dresser', 'couch', 'bookshelf', 'wardrobe', 'ottoman', 'nightstand', 'cabinet', 'armchair', 'bench', 'stool', 'futon', 'recliner'],
    }
    this.chosenWord = null
    this.sentClue = false
    this.foundWord = false

    // twitch/chat config — set in onWidgetLoad
    this.jwtToken = null
    this.broadcaster = null
    this.broadcasterChannelId = null
    this.testing = false

    // test racers
    this.testRacers = [
      'apocalypse_squirrel', 'KnuthingIsReal', 'NowImABeliever',
      'albinounounou', 'neiluj04', 'pyobum', 'thecomplements',
      'AndyTheFrenchy', 'thesolid7', 'CafeSparrow'
    ]

    this._bindEvents()
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  async init(fieldData) {
    this.broadcaster = fieldData.broadcaster
    this.raceDuration = fieldData.race_duration ?? 30
    this.testing = fieldData.testing ?? true

    this.jwtToken = await SE_API.store.get('jwtToken')
                          .then(data => {
                            return data.value;
                          })

    let url = "https://api.streamelements.com/kappa/v2/channels/" + this.broadcaster;
    await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
              charset: "utf-8",
              Authorization: "Bearer undefined"
            }})
  	      .then(res => {
            if (res.ok) {
              return res.json();
            }
          })
          .then(data => {
            this.broadcasterChannelId = data._id;
            //console.log("Broadcaster info loaded");
          })

    this.carManager = new CarManager({ boostCooldown: 10 })
    await this.carManager.loadCustomCarData()

    this.track = await Track.load()
    if (!this.track) {
      console.error('No track loaded — cannot start game')
      return
    }

    if (this.track.racingLine) {  
      this.cameraLoc[0] = (this.track.racingLine.p1[0] + this.track.racingLine.p2[0]) / 2
      this.resetCameraLoc[0] = (this.track.racingLine.p1[0] + this.track.racingLine.p2[0]) / 2
    }

    this.track.resetScatteredArt(this.cameraLoc, this.canvas.width)

    const settings = await SE_API.store.get('raceSettings').catch(() => null)
    if (settings) {
      if (settings.joinCommands && Array.isArray(settings.joinCommands) && settings.joinCommands.length > 0) this.joinCommands = settings.joinCommands
      if (settings.goCommands && Array.isArray(settings.goCommands) && settings.goCommands.length > 0) this.goCommands = settings.goCommands
      if (settings.resetCommands && Array.isArray(settings.resetCommands) && settings.resetCommands.length > 0) this.resetCommands = settings.resetCommands
      if (settings.messages) this.messages = { ...this.messages, ...settings.messages }
      if (settings.testRacers) this.testRacers = settings.testRacers
      if (settings.testing !== undefined) this.testing = settings.testing
      if (settings.wordBank) this.wordBank = settings.wordBank
      if (settings.raceDuration) this.raceDuration = settings.raceDuration
    }

    if (this.testing) {
      for (const name of this.testRacers) {
        await this.carManager.addRacer(name, null, this.track.racingLine)
      }
    }

    this.readying = true
    this.isUpdatingRacers = true
    requestAnimationFrame(this._loop.bind(this))
  }

  // ── Event binding ──────────────────────────────────────────────────────────

  _bindEvents() {
    const btn = document.getElementById('startbutton')
    if (btn) {
      btn.addEventListener('click', () => {
        if (this.carManager?.sortedNames.length > 0) this.startRace()
      })
    }

    window.addEventListener('onWidgetLoad', async (obj) => {
      const fieldData = {
        ...obj.detail.fieldData,
        broadcaster: obj.detail.channel.username,
      }
      await this.init(fieldData)
    })

    window.addEventListener('onEventReceived', async (obj) => {
      await this._handleEvent(obj)
    })
  }

  // ── Event handling ─────────────────────────────────────────────────────────

  async _handleEvent(obj) {
    if (!obj.detail.event) return
    if (typeof obj.detail.event.itemId !== 'undefined') {
      obj.detail.listener = 'redemption-latest'
    }

    const listener = obj.detail.listener.split('-')[0]
    const event = obj.detail.event

    if (listener === 'message') {
      const message = event.data.text.toLowerCase()
      const name = event.data.displayName
      const badges = event.data.badges
      const color = event.data.displayColor

      if (this.readying && this.joinCommands.some(cmd => message.startsWith(cmd.toLowerCase()))) {
        await this.carManager.addRacer(name, color, this.track.racingLine)
        return
      }

      if (this._isModerator(badges)) {
        if (message.startsWith('!checkracestatus')) {
          console.log(this.carManager.cars)
        } else if (message.startsWith('!showrace')) {
          this.hidden = false
        } else if (message.startsWith('!hiderace')) {
          if (!this.hidden && this.stopRace) {
            this.hidden = true
            this.reset()
          }
        } else if (this.resetCommands.some(cmd => message.startsWith(cmd.toLowerCase()))) {
          if (this.stopRace) {
            this.reset()
            this.sendMessage('Race reset')
          }
        }

        if (this._isBroadcaster(badges)) {
          if (message.startsWith('!setuprace')) {
            this.readying = true
          } else if (this.goCommands.some(cmd => message.startsWith(cmd))) {
            if (this.carManager.sortedNames.length > 0) this.startRace()
          } else if (event.data.text.startsWith('!resetSEStore')) {
            SE_API.store.set('StreamRacersLeaderboardData', {})
          }
        }
      }

      if (!this.readying && this.chosenWord) {
        if (this._containsChosenWord(message) && message.length < 2 * this.chosenWord.word.length) {
          const boosted = this.carManager.applyBoost(name)
          if (boosted) {
            this.foundWord = true
            this.chosenWord.found = true
            setTimeout(() => this.sendMessage(this.messages?.boostFound?.replace('{username}', name)), 1000)
            SE_API.store.set('boostWord', this.chosenWord)
          }
        }
      }
    }
  }

  // ── Race control ───────────────────────────────────────────────────────────

  startRace() {
    this.winner = null
    this.finishX = null
    this.leaderboard = []
    this.standings = []
    this.finishingVel = 1000
    this.stopRace = false
    this.readying = false
    this.raceStartTime = Date.now()
    this.prevStandingsUpdateTime = this.raceStartTime
    this.sentClue = false
    this._chooseRandomWord()
    this.sendMessage(this.messages?.raceStarted)
  }

  async reset() {
    this.winner = null
    this.finishX = null
    this.leaderboard = []
    this.standings = []
    this.prevStandingsUpdateTime = 0
    this.raceStartTime = null
    this.cameraLoc = [...this.resetCameraLoc]
    this.finishingVel = 1000
    this.stopRace = false
    this.readying = true
    this.sentClue = false
    this.foundWord = false
    this.chosenWord = null
    this.carManager.reset()
    this.track.resetScatteredArt(this.cameraLoc, this.canvas.width)
    if (!this.isUpdatingRacers) {
      this.isUpdatingRacers = true
      requestAnimationFrame(this._loop.bind(this))
    }
    if (this.testing) {
      for (const name of this.testRacers) {
        await this.carManager.addRacer(name, null, this.track.racingLine)
      }
    }
  }

  // ── Main loop ──────────────────────────────────────────────────────────────

  _loop() {
    const curTime = Date.now()
    this._update(curTime)
    this._draw()

    const elapsed = curTime - this.raceStartTime
    const totalDuration = (this.raceDuration + this.setupDuration) * 1000
    const stillRunning = elapsed < totalDuration || this.readying
    const waitingForFinishers = this.raceStartTime && (
      this.leaderboard.length < this.carManager.sortedNames.length || !this.stopRace
    )

    if (stillRunning || waitingForFinishers) {
      requestAnimationFrame(this._loop.bind(this))
    } else {
      this._onRaceEnd()
      this.isUpdatingRacers = false
    }
  }

  _update(curTime) {
    this.carManager.update(curTime, {
      readying: this.readying,
      raceStartTime: this.raceStartTime,
      setupDuration: this.setupDuration,
      finishX: this.finishX,
      finishingVel: this.finishingVel,
    })

    if (!this.readying && this.raceStartTime) {
      const elapsed = curTime - this.raceStartTime

      if (elapsed >= this.setupDuration * 1000) {
        if (!this.sentClue) {
          this.sendMessage(this.messages?.wordClue?.replace('{category}', this.chosenWord?.category))
          this.sentClue = true
        }

        // update finishers
        const finishers = this.carManager.getFinishers()
        if (finishers.length > 0) {
          this.leaderboard = finishers
          if (!this.winner) {
            this.winner = this.leaderboard[0]
            this.finishingVel = this.carManager.cars[this.winner]?.vel[0] ?? 1000
          }
        }

        // update standings periodically
        if ((curTime - this.prevStandingsUpdateTime) / 1000 > this.standingsUpdateDur) {
          this.standings = this.carManager.getStandings()
          this.prevStandingsUpdateTime = curTime
        }

        const { maxXPos, maxXVel } = this.carManager.getMaxPosition()
        // determine finish line position
        if (!this.finishX && (this.raceDuration + this.setupDuration) * 1000 - elapsed < 5000) {
          this.finishX = this.canvas.width - this.cameraLoc[0] + 5 * maxXVel - 800
        }

        // check if all racers past canvas
        this.stopRace = this.carManager.isAllPastCanvas(this.cameraLoc, this.canvas.width)

        // update camera
        const newCameraX = this.finishX
          ? Math.max(
              -maxXPos + 300 + (this.canvas.width - 500) * Math.min(1, (elapsed - this.setupDuration * 1000) / (this.raceDuration * 1000)),
              this.canvas.width * 0.5 - this.finishX
            )
          : -maxXPos + 300 + (this.canvas.width - 500) * (elapsed - this.setupDuration * 1000) / (this.raceDuration * 1000)

        const dX = newCameraX - this.cameraLoc[0]
        this.cameraLoc[0] = newCameraX
        this.track.updateScatteredArt(dX, this.cameraLoc, this.canvas.width, this.finishX)

      } else {
        // setup phase — camera pans to start line
        const newCameraX = this.resetCameraLoc[0] -
          ((this.resetCameraLoc[0] - 300) / this.setupDuration) * (elapsed / 1000)
        const dX = newCameraX - this.cameraLoc[0]
        this.cameraLoc[0] = newCameraX
        this.track.updateScatteredArt(dX, this.cameraLoc, this.canvas.width, this.finishX)
      }
    }

  }

  // ── Drawing ────────────────────────────────────────────────────────────────

  _draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if (this.hidden) return

    this.track.drawBackground(this.ctx, this.cameraLoc, this.canvas.width, this.canvas.height)
    
    let offsetCameraLoc = [this.cameraLoc[0] - this.resetCameraLoc[0], this.cameraLoc[1]]

    const elapsed = this.raceStartTime ? Date.now() - this.raceStartTime : 0
    if (this.finishX !== null) {
      // draw finish line + stands
      this.track._drawRacingLine(this.ctx, offsetCameraLoc, this.finishX, false)
      this.track._drawStands(this.ctx, offsetCameraLoc, this.finishX)
    } else if (this.readying || (elapsed <= this.setupDuration * 2000)){
      // draw start line
      this.track._drawRacingLine(this.ctx, offsetCameraLoc, 0, true)
    }
    
    this.carManager.draw(this.ctx, this.cameraLoc, this.track.racingLine)
    this.track.drawForeground(this.ctx, this.cameraLoc, this.canvas.width, this.finishX)
    this._drawStandings()
  }

  _drawStandings() {
    if (!this.standings.length) return

    const topLeft = [1450, 360]
    this.ctx.font = '32px Oswald'
    this.ctx.letterSpacing = '1.5px'

    // background box
    this.ctx.fillStyle = 'rgba(0,0,0,1.0)'
    this.ctx.beginPath()
    this.ctx.roundRect(topLeft[0] - 25, topLeft[1] - 42, 480, 400, 30)
    this.ctx.fill()
    this.ctx.closePath()

    this.ctx.fillStyle = 'white'
    this.ctx.textAlign = 'left'
    this.ctx.fillText('Leaderboard', ...topLeft)

    for (let i = 0; i < Math.min(this.standings.length, 10); i++) {
      const finished = i < this.leaderboard.length
      this.ctx.fillStyle = finished ? 'cyan' : 'white'
      const label = finished ? this.leaderboard[i] : this.standings[i]
      this.ctx.fillText(`${i + 1}. ${label}`, topLeft[0], topLeft[1] + 34 * (i + 1))
    }

    this.ctx.resetTransform()
  }

  // ── Race end ───────────────────────────────────────────────────────────────

  _onRaceEnd() {
    if (this.testing) return

    this.sendMessage(this.messages?.winner?.replace('{username}', this.winner))

    SE_API.store.get('StreamRacersLeaderboardData').then(data => {
      const date = new Date()
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear().toString()
      const dayKey = year + month + day
      const monthKey = year + month

      data[dayKey] ||= {}
      data[monthKey] ||= {}

      for (let i = 0; i < Math.min(this.leaderboard.length, 10); i++) {
        const points = Math.min(this.leaderboard.length, 10) - i
        data[dayKey][this.leaderboard[i]] = (data[dayKey][this.leaderboard[i]] ?? 0) + points
        data[monthKey][this.leaderboard[i]] = (data[monthKey][this.leaderboard[i]] ?? 0) + points
      }

      SE_API.store.set('StreamRacersLeaderboardData', data)
    })
  }

  // ── Word boost ─────────────────────────────────────────────────────────────

  _chooseRandomWord() {
    if (this.foundWord) {
      this._chooseNewWord()
      return
    }
    SE_API.store.get('boostWord').then(data => {
      if (data && Date.now() - data.time < 12 * 60 * 60 * 1000 && !data.found) {
        this.chosenWord = data
      } else {
        this._chooseNewWord()
      }
    }).catch(() => this._chooseNewWord())
  }

  _chooseNewWord() {
    const keys = Object.keys(this.wordBank)
    const key = keys[Math.floor(Math.random() * keys.length)]
    const words = this.wordBank[key]
    const word = words[Math.floor(Math.random() * words.length)]
    this.chosenWord = { word: word.toLowerCase(), category: key, time: Date.now(), found: false }
    this.foundWord = false
    SE_API.store.set('boostWord', this.chosenWord)
  }

  _containsChosenWord(input) {
    if (!this.chosenWord) return false
    return input.toLowerCase().includes(this.chosenWord.word)
  }

  // ── Chat ───────────────────────────────────────────────────────────────────

  sendMessage(message) {
    if (!message) return
  	fetch("https://api.streamelements.com/kappa/v2/bot/" + this.broadcasterChannelId + "/say", {
     method: "POST",
     headers: {
      "Accept": 'application/json; charset=utf-8',
      "Authorization": "bearer " + this.jwtToken,
      "Content-Type": "application/json"
     },
     body: JSON.stringify({
       "message": message
     })
    })
    .catch(err => {
     console.log(err)
    })

  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  _isModerator(badges) {
    return badges.some(b => b.type === 'moderator' || b.type === 'broadcaster')
  }

  _isBroadcaster(badges) {
    return badges.some(b => b.type === 'broadcaster')
  }
}

// entry point
const game = new Game()