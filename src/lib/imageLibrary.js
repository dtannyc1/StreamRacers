export const IMAGE_LIBRARY = {
  vehicles: [
    {
      id: 'default-vehicle',
      name: 'Default Vehicle',
      url: 'https://www.dropbox.com/scl/fi/erc6teenvak8bzkdgkrfr/default_vehicle.png?rlkey=oz9y6z8gr6x3b4ek7nv3s5csh&st=mnd2bytw&dl=0', // replace with actual hosted URL
    },
  ],
  wheels: [
    {
      id: 'default-wheel-1',
      name: 'Default Wheel 1',
      url: 'https://www.dropbox.com/scl/fi/h40xha1db6oqsa7n5nibi/default_wheel1.png?rlkey=xtolfaiwu6fsj3w7f23jyt6h8&st=4cr3dmmu&dl=0',
    },
    {
      id: 'default-wheel-2',
      name: 'Default Wheel 2',
      url: 'https://www.dropbox.com/scl/fi/avrdy5jpr2ky0xfo5h6bz/default_wheel2.png?rlkey=msdi1tkjhoot006z1n0cuic5u&st=2ess0iq9&dl=0',
    },
  ],
}

export const getImageUrl = (id) => {
  for (const category of Object.values(IMAGE_LIBRARY)) {
    const found = category.find(img => img.id === id)
    if (found) return found.url
  }
  return ''
}