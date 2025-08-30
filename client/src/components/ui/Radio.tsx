import React, { useState } from 'react'
import { clsx } from 'clsx'

export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
  helperText?: string
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  options: RadioOption[]
  error?: string
  helperText?: string
  variant?: 'default' | 'filled' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  layout?: 'vertical' | 'horizontal'
}

const Radio: React.FC<RadioProps> = ({
  label,
  options,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  layout = 'vertical',
  className,
  id,
  name,
  value,
  onChange,
  ...props
}) => {
  const radioGroupId = id || `radio-${Math.random().toString(36).substr(2, 9)}`
  const [focusedValue, setFocusedValue] = useState<string | null>(null)
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }
  
  const variantClasses = {
    default: clsx(
      'bg-white dark:bg-gray-800',
      'border-2 border-gray-300 dark:border-gray-600',
      'checked:border-blue-600',
      'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
      'hover:border-gray-400 dark:hover:border-gray-500',
      'transition-all duration-200 ease-in-out'
    ),
    filled: clsx(
      'bg-gray-50 dark:bg-gray-700',
      'border-2 border-transparent',
      'checked:border-blue-600',
      'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
      'hover:bg-gray-100 dark:hover:bg-gray-600',
      'transition-all duration-200 ease-in-out'
    ),
    outline: clsx(
      'bg-transparent',
      'border-2 border-gray-300 dark:border-gray-600',
      'checked:border-blue-600',
      'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
      'hover:border-gray-400 dark:hover:border-gray-500',
      'transition-all duration-200 ease-in-out'
    )
  }
  
  return (
    <div className="w-full group">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          {label}
          {props.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}
      
      <div className={clsx(
        'space-y-3',
        layout === 'horizontal' && 'flex flex-wrap gap-6'
      )}>
        {options.map((option) => (
          <div key={option.value} className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <input
                id={`${radioGroupId}-${option.value}`}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                disabled={option.disabled}
                className={clsx(
                  'appearance-none cursor-pointer rounded-full',
                  'focus:outline-none focus:ring-0',
                  sizeClasses[size],
                  variantClasses[variant],
                  error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                  'transition-all duration-200 ease-in-out',
                  className
                )}
                onFocus={() => setFocusedValue(option.value)}
                onBlur={() => setFocusedValue(null)}
                {...props}
              />
              
              {/* Custom radio dot */}
              {value === option.value && (
                <div className={clsx(
                  'absolute inset-0 flex items-center justify-center',
                  'transition-all duration-200 ease-in-out'
                )}>
                  <div className={clsx(
                    'bg-blue-600 rounded-full',
                    dotSizes[size]
                  )} />
                </div>
              )}
              
              {/* Focus ring effect */}
              <div className={clsx(
                'absolute inset-0 rounded-full pointer-events-none',
                'transition-all duration-200 ease-in-out',
                focusedValue === option.value && !error && 'ring-2 ring-blue-500/20',
                error && 'ring-2 ring-red-500/20'
              )} />
            </div>
            
            <div className="flex-1 min-w-0">
              <label
                htmlFor={`${radioGroupId}-${option.value}`}
                className={clsx(
                  'block text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer',
                  'transition-colors duration-200',
                  focusedValue === option.value && 'text-blue-600 dark:text-blue-400',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {option.label}
              </label>
              
              {option.helperText && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {option.helperText}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {helperText && !error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{helperText}</span>
        </div>
      )}
    </div>
  )
}

export default Radio
