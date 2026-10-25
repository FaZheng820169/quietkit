import { useRef, useState, type ReactNode } from 'react'
import { UploadIcon } from './Icons'

type Props = {
  accept: string
  multiple?: boolean
  title: string
  hint: string
  icon?: ReactNode
  onFiles: (files: File[]) => void
}

export function Dropzone({ accept, multiple = false, title, hint, icon, onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return
    onFiles(Array.from(list))
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
        event.preventDefault()
        setOver(false)
        handleFiles(event.dataTransfer.files)
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
