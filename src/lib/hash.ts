export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export const HASH_ALGORITHMS: HashAlgorithm[] = ['SHA-256', 'SHA-512', 'SHA-384', 'SHA-1']

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Hash a text string with the given algorithm. */
export async function hashText(text: string, algo: HashAlgorithm): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest(algo, data)
  return toHex(digest)
}

/** Hash a file (or any Blob) with the given algorithm. */
export async function hashFile(file: Blob, algo: HashAlgorithm): Promise<string> {
  const data = await file.arrayBuffer()
  const digest = await crypto.subtle.digest(algo, data)
  return toHex(digest)
}

/** Hash text with all supported algorithms at once. */
export async function hashTextAll(text: string): Promise<Record<HashAlgorithm, string>> {
  const entries = await Promise.all(
    HASH_ALGORITHMS.map(async (algo) => [algo, await hashText(text, algo)] as const),
  )
  return Object.fromEntries(entries) as Record<HashAlgorithm, string>
}

/** Hash a file with all supported algorithms at once. */
export async function hashFileAll(file: Blob): Promise<Record<HashAlgorithm, string>> {
  const data = await file.arrayBuffer()
  const entries = await Promise.all(
    HASH_ALGORITHMS.map(async (algo) => {
      const digest = await crypto.subtle.digest(algo, data)
      return [algo, toHex(digest)] as const
    }),
  )
  return Object.fromEntries(entries) as Record<HashAlgorithm, string>
}
