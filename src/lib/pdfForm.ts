/**
 * PDF form filling on top of pdf-lib's AcroForm support. The document is
 * parsed, edited and saved entirely in the tab — the bytes never leave the
 * browser. Loaded with a dynamic import so pdf-lib stays out of the main
 * bundle until the tool is actually used.
 */
import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField,
} from 'pdf-lib'

export type FormFieldType = 'text' | 'checkbox' | 'radio' | 'choice' | 'other'

export type PdfFormField = {
  name: string
  type: FormFieldType
  /** Current value: text, ''/'yes' for a checkbox, or the selected option. */
  value: string
  /** Options for radio groups, dropdowns and option lists. */
  options?: string[]
  multiline?: boolean
  readOnly?: boolean
}

export type PdfFormReport = {
  pageCount: number
  encrypted: boolean
  fields: PdfFormField[]
}

export type PdfFormFillResult = {
  blob: Blob
  filled: number
  flattened: boolean
}

export async function inspectPdfForm(file: File): Promise<PdfFormReport> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const pageCount = doc.getPageCount()

  let form
  try {
    form = doc.getForm()
  } catch {
    // A file whose catalog points at a malformed AcroForm dictionary is
    // treated as having no form at all rather than failing the inspection.
    return { pageCount, encrypted: doc.isEncrypted, fields: [] }
  }

  const fields: PdfFormField[] = []
  for (const field of form.getFields()) {
    if (field instanceof PDFTextField) {
      fields.push({
        name: field.getName(),
        type: 'text',
        value: field.getText() ?? '',
        multiline: field.isMultiline(),
        readOnly: field.isReadOnly(),
      })
    } else if (field instanceof PDFCheckBox) {
      fields.push({
        name: field.getName(),
        type: 'checkbox',
        value: field.isChecked() ? 'yes' : '',
        readOnly: field.isReadOnly(),
      })
    } else if (field instanceof PDFRadioGroup) {
      fields.push({
        name: field.getName(),
        type: 'radio',
        value: field.getSelected() ?? '',
        options: field.getOptions(),
        readOnly: field.isReadOnly(),
      })
    } else if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
      fields.push({
        name: field.getName(),
        type: 'choice',
        value: field.getSelected()?.[0] ?? '',
        options: field.getOptions(),
        readOnly: field.isReadOnly(),
      })
    } else {
      // Push buttons and signature placeholders are listed but not editable.
      fields.push({ name: field.getName(), type: 'other', value: '' })
    }
  }

  return { pageCount, encrypted: doc.isEncrypted, fields }
}

/**
 * Applies `values` (name → new value) to the form and saves. When `flatten`
 * is set, every field is baked into the page so the result reads as plain
 * text in any viewer — the right choice for sending a filled form on.
 */
export async function fillPdfForm(
  file: File,
  values: Record<string, string>,
  flatten: boolean,
): Promise<PdfFormFillResult> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const form = doc.getForm()

  let filled = 0
  for (const field of form.getFields()) {
    const name = field.getName()
    const next = values[name]
    if (next === undefined) continue
    try {
      if (field instanceof PDFTextField) {
        field.setText(next)
        filled += 1
      } else if (field instanceof PDFCheckBox) {
        if (next) field.check()
        else field.uncheck()
        filled += 1
      } else if (field instanceof PDFRadioGroup) {
        if (next && field.getOptions().includes(next)) {
          field.select(next)
          filled += 1
        }
      } else if (field instanceof PDFDropdown) {
        if (field.getOptions().includes(next)) {
          field.select(next)
          filled += 1
        }
      } else if (field instanceof PDFOptionList) {
        if (field.getOptions().includes(next)) {
          field.select(next)
          filled += 1
        }
      }
    } catch {
      // A single malformed field must not sink the rest of the form; it is
      // simply left at its current value.
    }
  }

  // Rebuild the appearance streams so viewers that do not render field values
  // themselves still show the new text.
  try {
    form.updateFieldAppearances()
  } catch {
    // Some forms reference fonts pdf-lib cannot synthesise; the values are
    // still stored and most viewers regenerate appearances on open.
  }

  if (flatten) form.flatten()

  const saved = await doc.save()
  return {
    blob: new Blob([new Uint8Array(saved)], { type: 'application/pdf' }),
    filled,
    flattened: flatten,
  }
}
