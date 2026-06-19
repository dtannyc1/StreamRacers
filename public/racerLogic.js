import { pauseGIFs } from './gifLoader.js'

export const updateRacerPos = (racer, curTime, clampToStart = false, speedMultiplier = 1) => {
  const dt = (curTime - racer.time) / 1000
  if (dt <= 0) return [racer.XY, racer.vel]
  const speed = racer.vel[0] * speedMultiplier

  racer.XY[0] += speed * dt
  racer.XY[1] += racer.vel[1] * dt

  const clamped = clampToStart && racer.XY[0] > 0
  if (clamped) {
    racer.XY[0] = 0
    pauseGIFs(racer.assets, performance.now())
  } else {
    incrementCarAssetAngles(racer, dt, speed)
  }

  // racer.time = curTime
  racer.distanceTravelled ||= 0
  racer.distanceTravelled = racer.distanceTravelled + racer.vel[0] * dt
  return [racer.XY, racer.vel]
}

export const updateRacerVel = (racer, curTime, clampToStart = false, randomizeX = false) => {
  const dt = (curTime - racer.time) / 1000
  if (dt <= 0) return racer.vel

  if (!clampToStart) {
    if (randomizeX) {
      racer.vel[0] += (Math.random() - 1/3) * racer.acc[0] * dt
    } else {
      racer.vel[0] += racer.acc[0] * dt
    }
  }
  racer.vel[1] += racer.acc[1] * dt
  if (racer.vel[0] < 0) racer.vel[0] = 0

  return racer.vel
}

export const updateRacerTime = (racer, curTime) => {
  racer.time = curTime
}

export const incrementCarAssetAngles = (car, dt, speed) => {
  car.assets.forEach(asset => {
    const radius = asset.radius ?? 1

    if (asset.type === 'custom') {
      if (typeof asset.update === 'function' && asset.isBroken !== true) {
        try {
          asset.update(asset, dt, speed)
        } catch (err) {
          console.error("Custom update function failed. Disabling for this asset.", err)
          asset.isBroken = true 
          asset.error = `Update Error: ${err.message}`
        }
      }
    } else if (asset.type === 'rotating') {
      asset.theta = ((asset.theta ?? 0) + (speed / radius) * dt) % (2 * Math.PI)

    } else if (asset.type === 'oscillating') {
      const min = asset.minTheta ?? -Math.PI / 6
      const max = asset.maxTheta ?? Math.PI / 6
      const range = max - min
      const doubleRange = range * 2

      let currentRel = ((asset.theta - asset.theta_0 - min) % doubleRange + doubleRange) % doubleRange;
      if (asset.theta_dot < 0) currentRel = doubleRange - currentRel

      const displacement = Math.abs(asset.theta_dot) * (speed / radius) * dt
      const nextRel = (currentRel + displacement) % doubleRange

      if (nextRel <= range) {
        asset.theta = asset.theta_0 + min + nextRel
        asset.theta_dot = Math.abs(asset.theta_dot)
      } else {
        asset.theta = asset.theta_0 + min + (doubleRange - nextRel)
        asset.theta_dot = -Math.abs(asset.theta_dot)
      }
    } else if (asset.type === 'slider') {
      let [startX, startY] = asset.start
      let [endX, endY] = asset.end
      let distX = (endX - startX) * (asset.behavior === 'pingpong' ? 2 : 1)
      let distY = (endY - startY) * (asset.behavior === 'pingpong' ? 2 : 1)
      let duration = (asset.duration ?? 1)
      if (asset.speedDependent) {
        duration *= 200/speed
      }
      let newdX = asset.dX 
      let newdY = asset.dY 
      let dir = asset.dir ?? 1
      if (!newdX) {
        if (asset.behavior === 'pingpong') {
          let phase = asset.phase ?? 0
          if (asset.phase > Math.PI) {
            phase = 2 * Math.PI - asset.phase
            dir = -1
          }
          newdX = (endX - startX) * phase / (2 * Math.PI)
          newdY = (endY - startY) * phase / (2 * Math.PI)
        } else if (asset.behavior === 'loop') {
          newdX = (endX - startX) * asset.phase / (2 * Math.PI)
          newdY = (endY - startY) * asset.phase / (2 * Math.PI)
        }
      }

      newdX += distX * dt / duration * dir
      newdY += distY * dt / duration * dir

      asset.dX = newdX
      asset.dY = newdY

      if (Math.abs(newdX) > Math.abs(endX - startX)){
        if (asset.behavior === 'pingpong') {
          asset.dX = endX - startX
          asset.dY = endY - startY
          asset.dir = -1
        } else if (asset.behavior === 'loop') {
          asset.dX = 0
          asset.dY = 0
        }
      } else if (newdX * (endX - startX) / Math.abs(endX - startX) < 0) {
        if (asset.behavior === 'pingpong') {
          asset.dX = 0
          asset.dY = 0
          asset.dir = 1
        }
      }
    }
  })
}

// slider type
// dX, dY, dir, start, end, duration, speedDependent, phase, behavior