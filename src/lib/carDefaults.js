import defaultVehicle from '../assets/defaultVehicle.png'
import defaultWheel1 from '../assets/defaultWheel1.png'
import defaultWheel2 from '../assets/defaultWheel2.png'

export const createDefaultAssets = (avatarUrl = '') => [
  {
    id: crypto.randomUUID(),
    name: 'Avatar',
    spriteUrl: avatarUrl,
    type: 'avatar',
    tl: [-134, -145 + 14.597],
    dim: [80, 80],
  },
  {
    id: crypto.randomUUID(),
    name: 'Vehicle',
    spriteUrl: defaultVehicle,
    type: 'static',
    tl: [-183, -175 + 14.597],
    dim: [200, 200],
  },
  {
    id: crypto.randomUUID(),
    name: 'Left Wheel',
    spriteUrl: defaultWheel1,
    type: 'rotating',
    tl: [-185, -135 + 14.597],
    dim: [481 / 2.5, 301 / 2.5],
    cr: [-135, -37 + 14.597],
    theta: Math.PI / 6,
    radius: 50 / 2.5,
  },
  {
    id: crypto.randomUUID(),
    name: 'Right Wheel',
    spriteUrl: defaultWheel2,
    type: 'rotating',
    tl: [-178, -135 + 14.597],
    dim: [481 / 2.5, 301 / 2.5],
    cr: [-40, -37 + 14.597],
    theta: Math.PI / 6,
    radius: 50 / 2.5,
  },
]

export const createDefaultCar = (avatarUrl = '') => ({
  name: 'New Car',
  assets: createDefaultAssets(avatarUrl),
})