const HEIC_FTYP = ['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1', 'heif']

/**
 * Detects HEIC/HEIF by MIME type, extension, or the ISO-BMFF `ftyp` brand, because
 * browsers often report an empty type for files dragged straight out of Photos.
 */
export async function isHeic(file: File): Promise<boolean> {
  if (file.type === 'image/heic' || file.type === 'image/heif') return true
  if (/\.(heic|heif)$/i.test(file.name)) return true
  if (file.size < 12) return false
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  if (String.fromCharCode(...header.slice(4, 8)) !== 'ftyp') return false
  const brand = String.fromCharCode(...header.slice(8, 12)).toLowerCase()
  return HEIC_FTYP.includes(brand)
}

/**
 * Decodes HEIC/HEIF to JPEG in the browser with a lazily loaded WASM decoder.
 * The decoder chunk is only fetched when a HEIC file actually shows up, so the
 * normal path stays small.
 */
export async function heicToJpeg(file: File, quality = 0.92): Promise<File> {
  const { default: heic2any } = await import('heic2any')
  let output: Blob | Blob[]
  try {
    output = await heic2any({ blob: file, toType: 'image/jpeg', quality })
  } catch {
    throw new Error('This HEIC file could not be decoded — it may be damaged or use an unsupported profile.')
  }
  const blob = Array.isArray(output) ? output[0] : output
  if (!blob) throw new Error('The HEIC file contained no image.')
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, '') + '.jpg', {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  })
}

/** Returns a JPEG File for HEIC input and the original file otherwise. */
export async function toDecodableImage(file: File): Promise<File> {
  return (await isHeic(file)) ? heicToJpeg(file) : file
}
