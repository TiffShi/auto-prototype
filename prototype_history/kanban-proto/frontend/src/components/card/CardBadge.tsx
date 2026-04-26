import type { Priority } from '../../types'

interface CardBadgeProps {
  priority: Priority
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: {
    label: 'Low',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  medium: {
    label: 'Medium',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  high: {
    label: 'High',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
}

export default function CardBadge({ priority }: CardBadgeProps) {
  const config = priorityConfig[priority]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  )
}