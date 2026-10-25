import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import { UploadIcon } from './Icons'

type Props = {
  accept: string
  multiple?: boolean
  title: string
  hint: string
  icon?: ReactNode
  onFiles: (files: File[]) => void
}

function readEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve) => {
    const all: FileSystemEntry[] = []
    const next = () => {
      reader.readEntries(
        (entries) => {
          if (entries.length === 0) {
            resolve(all)
            return
          }
          all.push(...entries)
          next()
        },
        () => resolve(all),
      )
    }
    next()
  })
}

async function walkEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    return new Promise<File[]>((resolve) => {
      ;(entry as FileSystemFileEntry).file(
        (file) => resolve([file]),
        () => resolve([]),
      )
    })
  }
  if (entry.isDirectory) {
    const children = await readEntries((entry as FileSystemDirectoryEntry).createReader())
    const files: File[] = []
    for (const child of children) files.push(...(await walkEntry(child)))
    return files
  }
  return []
}

export function Dropzone({ accept, multiple = false, title, hint, icon, onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return
    onFiles(Array.from(list))
  }

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setOver(false)
    // A dropped folder arrives as a directory entry, not as a list of files.
    const entries = Array.from(event.dataTransfer.items)
      .map((item) => item.webkitGetAsEntry?.() ?? null)
      .filter((entry): entry is FileSystemEntry => entry !== null)
    if (entries.some((entry) => entry.isDirectory)) {
      const files: File[] = []
      for (const entry of entries) files.push(...(await walkEntry(entry)))
      if (files.length > 0) onFiles(files)
      return
    }
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div
      className={`dropzone${over ? ' is-over' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragOver={(event) => {
        event.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        void handleDrop(event)
      }}
    >
      <span className="dropzone-icon">{icon || <UploadIcon size={30} />}</span>
      <span className="dropzone-title">{title}</span>
      <span className="dropzone-hint">{hint}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files)
          event.currentTarget.value = ''
        }}
      />
    </div>
  )
}
