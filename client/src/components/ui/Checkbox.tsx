import React, { useState } from 'react'
import { clsx } from 'clsx'
import { CheckIcon } from '@heroicons/react/24/outline'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'filled' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  className,
  id,
  checked,
  onChange,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
  const [isFocused, setIsFocused] = useState(false)
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  
  const variantClasses = {
    default: clsx(
      'bg-white dark:bg-gray-800',
      'border-2 border-gray-300 dark:border-gray-600',
      'checked:bg-blue-600 checked:border-blue-600',
      'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
      'hover:border-gray-400 dark:hover:border-gray-500',
      'transition-all duration-200 ease-in-out'
    ),
    filled: clsx(
      'bg-gray-50 dark:bg-gray-700',
      'border-2 border-transparent',
      'checked:bg-blue-600 checked:border-blue-600',
      'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
      'hover:bg-gray-100 dark:hover:bg-gray-600',
      'transition-all duration-200 ease-in-out'
    ),
    outline: clsx(
      'bg-transparent',
      'border-2 border-gray-300 dark:border-gray-600',
      'checked:bg-blue-600 checked:border-blue-600',
      'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
      'hover:border-gray-400 dark:hover:border-gray-500',
      'transition-all duration-200 ease-in-out'
    )
  }
  
  return (
    <div className="w-full group">
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <input
            id={checkboxId}
            type="checkbox"
            className={clsx(
              'appearance-none cursor-pointer rounded-md',
              'focus:outline-none focus:ring-0',
              sizeClasses[size],
              variantClasses[variant],
              error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
              'transition-all duration-200 ease-in-out',
              className
            )}
            checked={checked}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {/* Custom checkmark */}
          {checked && (
            <div className={clsx(
              'absolute inset-0 flex items-center justify-center text-white',
              'transition-all duration-200 ease-in-out'
            )}>
              <CheckIcon className={iconSizes[size]} />
            </div>
          )}
          
          {/* Focus ring effect */}
          <div className={clsx(
            'absolute inset-0 rounded-md pointer-events-none',
            'transition-all duration-200 ease-in-out',
            isFocused && !error && 'ring-2 ring-blue-500/20',
            error && 'ring-2 ring-red-500/20'
          )} />
        </div>
        
        {label && (
          <div className="flex-1 min-w-0">
            <label
              htmlFor={checkboxId}
              className={clsx(
                'block text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer',
                'transition-colors duration-200',
                isFocused && 'text-blue-600 dark:text-blue-400'
              )}
            >
              {label}
              {props.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            
            {helperText && !error && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default Checkbox
