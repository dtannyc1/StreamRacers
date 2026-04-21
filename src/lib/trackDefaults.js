import { getImageUrl } from './imageLibrary'

export const createDefaultTrack = (name = 'New Track') => ({
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
    url: getImageUrl('racing-line'),
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
        url: getImageUrl('start-flag'),
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
        url: getImageUrl('finish-flag'),
        dim: [200, 200],
        scale: 1,
        x: 1550,
        y: 974,
      },
    ],
  },
  scrollingImage: {
    url: getImageUrl('scrolling-lines'),
    dim: [1920, 1080],
    scale: 1,
    x: 0,
    y: -15,
  },
  backgroundAssets: [],
  foregroundAssets: [],
  styleSheet: {
    top: 320,
    left: 1425,
    paddingY: 20,
    paddingX: 25,
    font: 'Oswald',
    fontSize: 32,
    backgroundColor: "rgb(0,0,0)",
    backgroundOpacity: 1,
    color: 'white',
    winColor: 'cyan',
  }
})