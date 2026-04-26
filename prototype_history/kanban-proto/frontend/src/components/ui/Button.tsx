import { ButtonHTMLAttributes, ReactNode } from 'react'
import Spinner from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: ReactNode
}

const variantClasses = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 disabled:bg-brand-300',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400 disabled:opacity-50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400 disabled:opacity-50',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  )
}