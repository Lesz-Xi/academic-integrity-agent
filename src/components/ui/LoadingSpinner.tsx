import React from 'react'
import { Loader } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  fullScreen = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader className={`${sizeClasses[size]} animate-spin text-[#D2B48C]`} />
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] dark:bg-[#1a1a1a]">
        {content}
      </div>
    )
  }

  return content
}
