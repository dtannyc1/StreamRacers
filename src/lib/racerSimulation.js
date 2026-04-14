const INITIAL_SPEED = 400 // px per second
const DONE_DISTANCE = 1920 * 2

export const spawnRacer = (username, customRacers, racingLine) => {
  const cars = customRacers[username]
  let car;

  if (!cars?.length) {
    if (!customRacers['DEFAULT']) {
      return null
    }
    car = customRacers['DEFAULT']
  } else {
    car = cars[Math.floor(Math.random() * cars.length)]
  }

  const yMin = Math.min(racingLine.p1[1], racingLine.p2[1])
  const yMax = Math.max(racingLine.p1[1], racingLine.p2[1])
  const y = yMin + Math.random() * (yMax - yMin)

  return {
    id: crypto.randomUUID(),
    username,
    assets: car.assets,
    XY: [-200, y],
    vel: [INITIAL_SPEED, 0],
    acc: [6, 0],
    distanceTravelled: 0,
    time: Date.now(),
  }
}

export const isRacerDone = (racer) =>
  racer.distanceTravelled >= DONE_DISTANCE

export const sortRacersByY = (racers) =>
  [...racers].sort((a, b) => a.XY[1] - b.XY[1])