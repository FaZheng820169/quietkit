/**
 * AVIF capability detection. Support is probed with real codec operations —
 * a tiny AVIF is actually decoded, a canvas is actually encoded — rather than
 * guessed from the user agent. Results are cached for the session.
 */

// A 1×1 AVIF, the smallest file that still exercises the full decode path.
const TINY_AVIF =
  'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A='

let decodePromise: Promise<boolean> | undefined

/** True when this browser can turn an AVIF file into pixels. */
export function canDecodeAvif(): Promise<boolean> {
  if (!decodePromise) {
    decodePromise = new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = TINY_AVIF
    })
  }
  return decodePromise
}

let encodePromise: Promise<boolean> | undefined

/**
 * True when this browser can encode AVIF. Browsers without an encoder silently
 * fall back to PNG in canvas.toBlob, so the blob's type — not its existence —
 * is the answer.
 */
export function canEncodeAvif(): Promise<boolean> {
  if (!encodePromise) {
    encodePromise = new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 2
        canvas.height = 2
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(false)
          return
        }
        ctx.fillStyle = '#808080'
        ctx.fillRect(0, 0, 2, 2)
        canvas.toBlob(
          (blob) => resolve(blob !== null && blob.type === 'image/avif'),
          'image/avif',
          0.5,
        )
      } catch {
        resolve(false)
      }
    })
  }
  return encodePromise
}
