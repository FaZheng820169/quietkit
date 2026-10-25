import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 18, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  }
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9" />
    </svg>
  )
}

export function QrIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v2M14 20h2M18 18h2v2h-2z" />
    </svg>
  )
}

export function ImageIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
    </svg>
  )
}

export function FileIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 2.8h6.8L19 8v12.2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3.8a1 1 0 0 1 1-1Z" />
      <path d="M13.5 3v5.2H19" />
    </svg>
  )
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v11" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M5 19.5h14" />
    </svg>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 6.5h15" />
      <path d="M9 6.5V4.8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.7" />
      <path d="M6.5 6.5 7.4 19a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9l.9-12.5" />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h13" />
      <path d="m13 6.5 5.5 5.5L13 17.5" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2.8 4.8 5.6v6.1c0 4.6 3.1 8.2 7.2 9.5 4.1-1.3 7.2-4.9 7.2-9.5V5.6L12 2.8Z" />
      <path d="m9.2 12 2 2 3.6-4" />
    </svg>
  )
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13.5 2.5 5 13.5h5.2L9.8 21.5 18.5 10h-5.4l.4-7.5Z" />
    </svg>
  )
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s6.5-5.6 6.5-10.4A6.5 6.5 0 0 0 5.5 10.6C5.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.3" r="2.4" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function UploadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 16V4.5" />
      <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
      <path d="M5 17.5v1.7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1.7" />
    </svg>
  )
}
