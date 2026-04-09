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
  tracks: [
    {
      id: 'racing-line',
      name: 'Racing Line',
      url: 'https://www.dropbox.com/scl/fi/sp4n0j6iqbnpnme05zhak/racing_line.png?rlkey=rf7wga3zfnrz52z57i258vi1y&st=ihj77zey&dl=0',
    },
    {
      id: 'start-flag',
      name: 'Start Flag',
      url: 'https://www.dropbox.com/scl/fi/6sy2a7pvvuwkozk3tvbvq/start_flag.png?rlkey=ik03ay7yv17yv5bxk1lvhl39q&st=7juc9iog&dl=0',
    },
    {
      id: 'finish-flag',
      name: 'Finish Flag',
      url: 'https://www.dropbox.com/scl/fi/elrpti7l28qro4soudskz/finish_flag.png?rlkey=q8jsg8bt2dqzhqpj2litbmcsf&st=3iu1dexx&dl=0',
    },
    {
      id: 'scrolling-lines',
      name: 'Scrolling Lines',
      url: 'https://www.dropbox.com/scl/fi/hn1n4o8t737jxiqs5wse4/yellow_lines.png?rlkey=gxe6nyrkb66sblqoj1t8fnndr&st=83eyetrq&dl=0',
    }
  ],
  avatars: [
    {
      id: 'placeholder-avatar',
      name: 'Placeholder Avatar',
      url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/9ee9431b-96be-4490-a71c-edab7f769430-profile_image-300x300.png',
    }
  ]
}

export const getImageUrl = (id) => {
  for (const category of Object.values(IMAGE_LIBRARY)) {
    const found = category.find(img => img.id === id)
    if (found) return found.url
  }
  return ''
}