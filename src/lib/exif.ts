/**
 * Minimal, dependency-free metadata reader / stripper for JPEG and PNG.
 * Everything runs on the user's device: files are read with FileReader only.
 */

export type MetaEntry = { group: string; label: string; value: string }

export type MetaReport = {
  kind: 'jpeg' | 'png'
  entries: MetaEntry[]
  gps: { lat: number; lng: number } | null
  hasGps: boolean
  hasMetadata: boolean
  stripSupported: boolean
  /** EXIF orientation (1–8). Preserved on purpose so photos keep their rotation. */
  orientation: number | null
}

const TAG_IFD0: Record<number, string> = {
  0x010e: 'Image description',
  0x010f: 'Camera make',
  0x0110: 'Camera model',
  0x0112: 'Orientation',
  0x011a: 'X resolution',
  0x011b: 'Y resolution',
  0x0128: 'Resolution unit',
  0x0131: 'Software',
  0x0132: 'Last modified',
  0x013b: 'Artist',
  0x8298: 'Copyright',
  0x9c9b: 'XPTitle',
  0x9c9e: 'XPKeywords',
}

const TAG_EXIF: Record<number, string> = {
  0x829a: 'Exposure time',
  0x829d: 'Aperture',
  0x8822: 'Exposure program',
  0x8827: 'ISO',
  0x9003: 'Date taken',
  0x9004: 'Date digitised',
  0x9201: 'Shutter speed',
  0x9202: 'Aperture (APEX)',
  0x9207: 'Metering mode',
  0x9209: 'Flash',
  0x920a: 'Focal length',
  0x9286: 'User comment',
  0xa001: 'Colour space',
  0xa002: 'Pixel width',
  0xa003: 'Pixel height',
  0xa434: 'Lens model',
}

const TAG_GPS: Record<number, string> = {
  0x0000: 'GPS version',
  0x0001: 'Latitude ref',
  0x0002: 'Latitude',
  0x0003: 'Longitude ref',
  0x0004: 'Longitude',
  0x0005: 'Altitude ref',
  0x0006: 'Altitude',
  0x0007: 'GPS time',
  0x001d: 'GPS date',
}

const ORIENTATION: Record<number, string> = {
  1: 'Normal',
  2: 'Mirrored horizontally',
  3: 'Rotated 180°',
  4: 'Mirrored vertically',
  5: 'Mirrored, rotated 90°',
  6: 'Rotated 90° clockwise',
  7: 'Mirrored, rotated 270°',
  8: 'Rotated 270° clockwise',
}

const TYPE_SIZE: Record<number, number> = {
  1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8,
}

class Reader {
  view: DataView
  littleEndian = false
  tiffStart = 0

  constructor(bytes: Uint8Array, tiffStart = 0) {
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    this.tiffStart = tiffStart
  }

  u16(offset: number): number {
    return this.view.getUint16(offset, this.littleEndian)
  }

  u32(offset: number): number {
    return this.view.getUint32(offset, this.littleEndian)
  }

  ascii(offset: number, length: number): string {
    let out = ''
    for (let i = 0; i < length; i += 1) {
      const byte = this.view.getUint8(offset + i)
      if (byte === 0) break
      out += String.fromCharCode(byte)
    }
    return out.trim()
  }

  rational(offset: number): number | null {
    const num = this.u32(offset)
    const den = this.u32(offset + 4)
    if (!den) return null
    return num / den
  }
}

function readValue(r: Reader, type: number, count: number, valueOffset: number): string {
  const size = (TYPE_SIZE[type] || 1) * count
  const base = size <= 4 ? valueOffset : r.tiffStart + r.u32(valueOffset)
  if (base < 0 || base + size > r.view.byteLength) return ''

  switch (type) {
    case 2:
      return r.ascii(base, count)
    case 7:
      return r.ascii(base, Math.min(count, 80))
    case 1:
    case 6:
      return String(r.view.getUint8(base))
    case 3:
    case 8: {
      const values: number[] = []
      for (let i = 0; i < count && i < 8; i += 1) {
        values.push(r.view.getUint16(base + i * 2, r.littleEndian))
      }
      return values.join(', ')
    }
    case 4:
    case 9: {
      const values: number[] = []
      for (let i = 0; i < count && i < 8; i += 1) {
        values.push(r.view.getUint32(base + i * 4, r.littleEndian))
      }
      return values.join(', ')
    }
    case 5:
    case 10: {
      const values: number[] = []
      for (let i = 0; i < count && i < 4; i += 1) {
        const value = r.rational(base + i * 8)
        if (value !== null) values.push(value)
      }
      return values.map((v) => (Number.isInteger(v) ? String(v) : v.toFixed(4))).join(', ')
    }
    default:
      return `${size} bytes`
  }
}

function readIfd(r: Reader, offset: number, tags: Record<number, string>, group: string, out: MetaEntry[]) {
  const absolute = r.tiffStart + offset
  if (absolute + 2 > r.view.byteLength) return
  const count = r.u16(absolute)
  if (count > 512) return

  for (let i = 0; i < count; i += 1) {
    const entry = absolute + 2 + i * 12
    if (entry + 12 > r.view.byteLength) return
    const tag = r.u16(entry)
    const type = r.u16(entry + 2)
    const valueCount = r.u32(entry + 4)
    const label = tags[tag]
    if (!label) continue
    let value = readValue(r, type, valueCount, entry + 8)
    if (tag === 0x0112) value = ORIENTATION[Number(value)] || value
    if (tag === 0x829a && value) {
      const seconds = Number(value)
      if (seconds > 0 && seconds < 1) value = `1/${Math.round(1 / seconds)} s`
      else if (seconds >= 1) value = `${seconds} s`
    }
    if (tag === 0x829d) value = `f/${Number(value)}`
    if (tag === 0x0128) value = ({ 1: 'none', 2: 'inches', 3: 'centimetres' } as Record<number, string>)[Number(value)] || value
    if (tag === 0x920a) value = `${value} mm`
    if (tag === 0xa002 || tag === 0xa003) value = `${value} px`
    if (value) out.push({ group, label, value })
  }
}

function readGps(r: Reader, offset: number): { lat: number; lng: number } | null {
  const absolute = r.tiffStart + offset
  if (absolute + 2 > r.view.byteLength) return null
  const count = r.u16(absolute)
  let latRef = 'N'
  let lngRef = 'E'
  let lat: number | null = null
  let lng: number | null = null

  for (let i = 0; i < count && i < 64; i += 1) {
    const entry = absolute + 2 + i * 12
    if (entry + 12 > r.view.byteLength) break
    const tag = r.u16(entry)
    const type = r.u16(entry + 2)
    const valueCount = r.u32(entry + 4)
    const raw = readValue(r, type, valueCount, entry + 8)
    if (tag === 0x0001) latRef = raw || 'N'
    if (tag === 0x0003) lngRef = raw || 'E'
    if (tag === 0x0002 || tag === 0x0004) {
      const parts = raw.split(',').map(Number)
      if (parts.length >= 2 && parts.every((n) => Number.isFinite(n))) {
        const decimal = parts[0] + parts[1] / 60 + (parts[2] || 0) / 3600
        if (tag === 0x0002) lat = decimal
        else lng = decimal
      }
    }
  }

  if (lat === null || lng === null) return null
  return {
    lat: latRef.toUpperCase() === 'S' ? -lat : lat,
    lng: lngRef.toUpperCase() === 'W' ? -lng : lng,
  }
}

function readJpeg(buf: ArrayBuffer): MetaReport {
  const bytes = new Uint8Array(buf)
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('Not a JPEG file')

  const view = new DataView(buf)
  const entries: MetaEntry[] = []
  let gps: { lat: number; lng: number } | null = null
  let hasXmp = false
  let hasIptc = false
  let orientation: number | null = null
  let offset = 2

  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) break
    const marker = bytes[offset + 1]
    if (marker === 0xd9 || marker === 0xda) break
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2
      continue
    }
    const length = view.getUint16(offset + 2)
    if (length < 2) break
    const payloadStart = offset + 4
    const payloadEnd = offset + 2 + length

    if (marker === 0xe1 && payloadEnd <= bytes.length) {
      const signature = new TextDecoder('latin1').decode(bytes.subarray(payloadStart, payloadStart + 29))
      if (signature.startsWith('Exif')) {
        const tiffStart = payloadStart + 6
        const r = new Reader(bytes.subarray(0, payloadEnd), tiffStart)
        const order = String.fromCharCode(bytes[tiffStart], bytes[tiffStart + 1])
        r.littleEndian = order === 'II'
        if (r.u16(tiffStart + 2) === 42) {
          const ifd0 = r.u32(tiffStart + 4)
          const ifd0Start = tiffStart + ifd0
          readIfd(r, ifd0, TAG_IFD0, 'Image', entries)
          const count = r.u16(ifd0Start)
          let exifOffset = 0
          let gpsOffset = 0
          for (let i = 0; i < count; i += 1) {
            const entry = ifd0Start + 2 + i * 12
            const tag = r.u16(entry)
            if (tag === 0x8769) exifOffset = r.u32(entry + 8)
            if (tag === 0x8825) gpsOffset = r.u32(entry + 8)
            if (tag === 0x0112) orientation = r.u16(entry + 8)
          }
          if (exifOffset) readIfd(r, exifOffset, TAG_EXIF, 'Camera', entries)
          if (gpsOffset) {
            readIfd(r, gpsOffset, TAG_GPS, 'Location', entries)
            gps = readGps(r, gpsOffset)
          }
        }
      } else if (signature.includes('http://ns.adobe.com')) {
        hasXmp = true
      }
    }

    if (marker === 0xed) hasIptc = true
    offset = payloadEnd
  }

  if (hasXmp) entries.push({ group: 'Hidden', label: 'XMP packet', value: 'Adobe XMP metadata block' })
  if (hasIptc) entries.push({ group: 'Hidden', label: 'IPTC block', value: 'Photoshop / IPTC metadata block' })
  if (gps) {
    entries.push({ group: 'Location', label: 'GPS coordinates', value: `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` })
    entries.push({
      group: 'Location',
      label: 'Map link',
      value: `https://www.openstreetmap.org/?mlat=${gps.lat.toFixed(6)}&mlon=${gps.lng.toFixed(6)}`,
    })
  }

  return {
    kind: 'jpeg',
    entries,
    gps,
    hasGps: Boolean(gps),
    hasMetadata: entries.length > 0,
    stripSupported: true,
    orientation,
  }
}

const PNG_META_CHUNKS = new Set(['tEXt', 'iTXt', 'zTXt', 'eXIf', 'tIME', 'pCAL', 'sPLT'])

function readPng(buf: ArrayBuffer): MetaReport {
  const bytes = new Uint8Array(buf)
  const view = new DataView(buf)
  if (bytes[0] !== 0x89 || bytes[1] !== 0x50) throw new Error('Not a PNG file')

  const entries: MetaEntry[] = []
  let offset = 8
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset)
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7])
    const dataEnd = offset + 8 + length
    if (dataEnd + 4 > bytes.length) break

    if (type === 'tEXt' || type === 'iTXt' || type === 'zTXt') {
      const raw = new TextDecoder('latin1').decode(bytes.subarray(offset + 8, Math.min(dataEnd, offset + 8 + 240)))
      const [key, ...rest] = raw.split('\u0000')
      entries.push({ group: 'Text chunk', label: key || type, value: rest.join(' ').slice(0, 160) })
    } else if (type === 'eXIf') {
      entries.push({ group: 'Hidden', label: 'Embedded EXIF', value: 'EXIF block inside PNG' })
    } else if (type === 'tIME') {
      entries.push({ group: 'Image', label: 'Last modified', value: 'Timestamp chunk present' })
    }

    offset = dataEnd + 4
    if (type === 'IEND') break
  }

  return {
    kind: 'png',
    entries,
    gps: null,
    hasGps: false,
    hasMetadata: entries.length > 0,
    stripSupported: true,
    orientation: null,
  }
}

export async function inspectFile(file: File): Promise<MetaReport> {
  const buf = await file.arrayBuffer()
  const head = new Uint8Array(buf, 0, Math.min(4, buf.byteLength))
  if (head[0] === 0xff && head[1] === 0xd8) return readJpeg(buf)
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return readPng(buf)

  const report: MetaReport = {
    kind: 'png',
    entries: [],
    gps: null,
    hasGps: false,
    hasMetadata: false,
    stripSupported: false,
    orientation: null,
  }
  throw Object.assign(new Error('Unsupported format'), { report })
}

function toBlob(chunks: Uint8Array[], type: string): Blob {
  return new Blob(chunks as unknown as BlobPart[], { type })
}

function orientationApp1(orientation: number): Uint8Array {
  // Minimal Exif block that carries only the Orientation tag. Rotation is display
  // critical: dropping it would make portrait photos appear sideways.
  return new Uint8Array([
    0xff, 0xe1, 0x00, 0x22,
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, // big-endian TIFF, IFD0 at 8
    0x00, 0x01, // one entry
    0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, orientation, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, // no next IFD
  ])
}

function stripJpeg(buf: ArrayBuffer, orientation: number | null): Blob {
  const bytes = new Uint8Array(buf)
  const view = new DataView(buf)
  const chunks: Uint8Array[] = [bytes.subarray(0, 2)]
  if (orientation && orientation > 1) chunks.push(orientationApp1(orientation))
  let offset = 2

  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) break
    const marker = bytes[offset + 1]
    if (marker === 0xd9) {
      chunks.push(bytes.subarray(offset))
      return toBlob(chunks, 'image/jpeg')
    }
    if (marker === 0xda) {
      chunks.push(bytes.subarray(offset))
      return toBlob(chunks, 'image/jpeg')
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      chunks.push(bytes.subarray(offset, offset + 2))
      offset += 2
      continue
    }
    const length = view.getUint16(offset + 2)
    if (length < 2) break
    const end = offset + 2 + length
    const keepable =
      marker === 0xe0 || // JFIF
      marker === 0xe2 || // ICC colour profile
      marker === 0xee || // Adobe colour transform
      (marker >= 0xc0 && marker <= 0xcf) // frame headers
    const isTable = marker === 0xdb || marker === 0xc4 || marker === 0xdd // DQT / DHT / DRI
    if (keepable || isTable) chunks.push(bytes.subarray(offset, end))
    offset = end
  }

  return toBlob(chunks, 'image/jpeg')
}

function stripPng(buf: ArrayBuffer): Blob {
  const bytes = new Uint8Array(buf)
  const view = new DataView(buf)
  const chunks: Uint8Array[] = [bytes.subarray(0, 8)]
  let offset = 8

  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset)
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7])
    const end = offset + 12 + length
    if (end > bytes.length) break
    if (!PNG_META_CHUNKS.has(type)) chunks.push(bytes.subarray(offset, end))
    offset = end
    if (type === 'IEND') break
  }

  return toBlob(chunks, 'image/png')
}

export async function stripMetadata(file: File, report: MetaReport): Promise<Blob> {
  const buf = await file.arrayBuffer()
  if (report.kind === 'jpeg') return stripJpeg(buf, report.orientation)
  if (report.kind === 'png') return stripPng(buf)
  throw new Error('Stripping is only supported for JPEG and PNG files.')
}
