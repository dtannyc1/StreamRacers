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

  racer.time = curTime
  racer.distanceTravelled ||= 0
  racer.distanceTravelled = racer.distanceTravelled + racer.vel[0] * dt
  return [racer.XY, racer.vel]
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
    }
  })
}