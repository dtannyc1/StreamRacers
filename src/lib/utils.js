export const resolveImageUrl = (url) => {
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