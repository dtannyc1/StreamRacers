import { parseGIF, decompressFrames } from 'https://cdn.jsdelivr.net/npm/gifuct-js/+esm'

export const isGifUrl = (url) =>
  url?.toLowerCase().endsWith('.gif')

export const loadGIF = async (url) => {
  const res = await fetch(url, {
    headers: {
      'Accept': 'image/gif'
    }
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch GIF: ${res.statusText}`);
  }

  if (res.headers.get('content-type') === 'image/webp') {
    return await loadWebP(res);
  }

  const buffer = await res.arrayBuffer();
  const gif = parseGIF(new Uint8Array(buffer));

  // Diagnostic: If this is 0, the issue is the source file or the parser
  if (!gif.frames || gif.frames.length === 0) {
    console.error("GIF parsed but found 0 frames. Check if the URL is a valid GIF.", url);
    return [];
  }

  // Set 'buildPatch' to true to get the pixel data ready for canvas
  const frames = decompressFrames(gif, true);

  return frames.map(frame => {
    const canvas = document.createElement('canvas');
    canvas.width = frame.dims.width;
    canvas.height = frame.dims.height;
    const ctx = canvas.getContext('2d');

    // Create ImageData from the patch (the actual pixels of this frame)
    const imageData = ctx.createImageData(frame.dims.width, frame.dims.height);
    imageData.data.set(frame.patch);
    ctx.putImageData(imageData, 0, 0);

    return {
      canvas,
      delay: frame.delay > 0 ? frame.delay : 100,
      dims: frame.dims // Helpful for positioning later
    };
  });
}

export const loadWebP = async (res) => {
  // ImageDecoder takes a stream or a buffer
  const clone = res.clone();
  const blob = await clone.blob();
  
  const decoder = new ImageDecoder({
    data: blob.stream(),
    type: 'image/webp'
  });

  // Check if the image is animated
  await decoder.tracks.ready;
  const track = decoder.tracks.selectedTrack;
  const frameCount = track.frameCount;
  
  const frames = [];

  for (let i = 0; i < frameCount; i++) {
    // Decode each individual frame
    const result = await decoder.decode({ frameIndex: i });
    const frame = result.image; // This is a VideoFrame object

    const canvas = document.createElement('canvas');
    canvas.width = frame.displayWidth;
    canvas.height = frame.displayHeight;
    const ctx = canvas.getContext('2d');

    // Draw the VideoFrame directly to the canvas
    ctx.drawImage(frame, 0, 0);

    frames.push({
      canvas,
      // duration is in microseconds, convert to milliseconds
      delay: (frame.duration || 100000) / 1000 
    });

    // Close the VideoFrame to free up memory immediately
    frame.close();
  }

  return frames;
};

export const getCurrentFrame = (asset, now) => {
  if (!asset.frames?.length) return null
  const elapsed = now - (asset.lastFrameTime)
  const frame = asset.frames[asset.frameIndex]
  if (elapsed >= frame.delay) {
    asset.frameIndex = (asset.frameIndex + 1) % asset.frames.length
    asset.lastFrameTime = now
  }
  return asset.frames[asset.frameIndex].canvas
}

export const pauseGIFs = (assets, now) => {
  assets.forEach(asset => {
    if (asset.frames) asset.lastFrameTime = now
  })
}

export const loadAssetImage = async (asset, avatar) => {
  if (asset.type === 'avatar') {
    if (!avatar.complete) {
      await new Promise((res) => { avatar.onload = res; avatar.onerror = res; });
    }
    return { img: avatar, frames: null };
  }

  if (isGifUrl(asset.spriteUrl)) {
    try {
      const frames = await loadGIF(asset.spriteUrl);
      return { img: null, frames };
    } catch (err) {
      console.warn(`Failed to load GIF ${asset.spriteUrl}:`, err);
      return { img: null, frames: null };
    }
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  const loadPromise = new Promise((resolve) => {
    img.onload = () => resolve({ img, frames: null });
    img.onerror = () => {
      console.error(`Failed to load image: ${asset.spriteUrl}`);
      resolve({ img: null, frames: null }); 
    };
  });
  
  img.src = resolveImageUrl(asset.spriteUrl);
  return loadPromise;
};

const resolveImageUrl = (url) => {
    if (!url) return url

    // convert Dropbox share links to direct download links
    if (url.includes('dropbox.com')) {
      return url
        .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
        .replace('?dl=0', '?raw=1')
        .replace('&dl=0', '&raw=1')
    }

    return url
  }