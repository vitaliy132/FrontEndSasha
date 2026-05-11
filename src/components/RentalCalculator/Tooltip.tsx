import type { ReactNode } from 'react'

interface TooltipProps {
  trigger: ReactNode
  content: ReactNode
  visible: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function Tooltip({ trigger, content, visible, onMouseEnter, onMouseLeave }: TooltipProps) {
  return (
    <span
      className="relative inline-block"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {trigger}
      {visible && (
        <div className="absolute z-10 mt-1 w-64 rounded-md bg-slate-50 p-3 text-sm text-slate-900 shadow-lg border border-slate-200">
          {content}
        </div>
      )}
    </span>
  )
}
