export function useImageCompressor() {
  async function compress(file: File, maxPx = 1024, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxPx || height > maxPx) {
          const ratio = Math.min(maxPx / width, maxPx / height)
          width  = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        canvas.width  = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        const base64Full = canvas.toDataURL('image/jpeg', quality)
        resolve(base64Full.split(',')[1]!) // return base64 only
      }
      img.onerror = reject
      img.src = url
    })
  }
  return { compress }
}
