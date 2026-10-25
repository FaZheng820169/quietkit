/**
 * Kept in its own module so pages can import the class and the wording
 * without pulling pdf-lib into the main bundle.
 */
export const ENCRYPTED_PDF_HELP =
  'This PDF is password-protected or restricted, so it cannot be rewritten safely. Open it in a PDF viewer, save an unprotected copy, then try again here.'

export class EncryptedPdfError extends Error {
  constructor(fileName?: string) {
    super(
      fileName
        ? `“${fileName}” is password-protected or restricted, so it cannot be rewritten safely. Open it in a PDF viewer, save an unprotected copy, then try again here.`
        : ENCRYPTED_PDF_HELP,
    )
    this.name = 'EncryptedPdfError'
  }
}
