const INITIAL_SPEED = 400 // px per second
const DONE_DISTANCE = 1920 * 2

export const pickRandomRacer = (customRacers) => {
  const eligible = Object.entries(customRacers)
    .filter(([_, cars]) => Array.isArray(cars) && cars.length > 0)
    .map(([username]) => username)

  if (eligible.length === 0) return null
  return eligible[Math.floor(Math.random() * eligible.length)]
}

export const spawnRacer = (username, customRacers, racingLine) => {
  const cars = customRacers[username]
  if (!cars?.length) return null

  const car = cars[Math.floor(Math.random() * cars.length)]

  const yMin = Math.min(racingLine.p1[1], racingLine.p2[1])
  const yMax = Math.max(racingLine.p1[1], racingLine.p2[1])
  const y = yMin + Math.random() * (yMax - yMin)

  return {
    id: crypto.randomUUID(),
    username,
    car,
    xy: [-200, y],
    vel: [INITIAL_SPEED, 0],
    acc: [6, 0],
    distanceTravelled: 0,
    spawnTime: performance.now(),
  }
}

export const updateRacers = (racers, dt) =>
  racers.map(racer => ({
    ...racer,
    xy: [racer.xy[0] + racer.vel[0] * dt, racer.xy[1] + racer.vel[1] * dt],
    distanceTravelled: racer.distanceTravelled + racer.vel[0] * dt,
  }))

export const isRacerDone = (racer) =>
  racer.distanceTravelled >= DONE_DISTANCE

export const sortRacersByY = (racers) =>
  [...racers].sort((a, b) => a.xy[1] - b.xy[1])