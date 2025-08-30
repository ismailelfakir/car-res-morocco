import React, { useState } from 'react'
import { clsx } from 'clsx'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filled' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const [isFocused, setIsFocused] = useState(false)
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg'
  }
  
  const variantClasses = {
    default: clsx(
      'bg-white dark:bg-gray-800',
      'border border-gray-300 dark:border-gray-600',
      'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
      'hover:border-gray-400 dark:hover:border-gray-500',
      'transition-all duration-200 ease-in-out'
    ),
    filled: clsx(
      'bg-gray-50 dark:bg-gray-700',
      'border border-transparent',
      'focus:bg-white dark:focus:bg-gray-800',
      'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
      'hover:bg-gray-100 dark:hover:bg-gray-600',
      'transition-all duration-200 ease-in-out'
    ),
    outline: clsx(
      'bg-transparent',
      'border-2 border-gray-300 dark:border-gray-600',
      'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
      'hover:border-gray-400 dark:hover:border-gray-500',
      'transition-all duration-200 ease-in-out'
    )
  }
  
  return (
    <div className="w-full group">
      {label && (
        <label
          htmlFor={inputId}
          className={clsx(
            'block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2',
            'transition-colors duration-200',
            isFocused && 'text-blue-600 dark:text-blue-400'
          )}
        >
          {label}
          {props.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={clsx(
            'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none',
            'transition-colors duration-200',
            isFocused ? 'text-blue-500' : 'text-gray-400'
          )}>
            <div className={clsx(
              'h-5 w-5',
              size === 'lg' && 'h-6 w-6',
              size === 'sm' && 'h-4 w-4'
            )}>
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          id={inputId}
          className={clsx(
            'block w-full rounded-xl shadow-sm',
            'text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400',
            'disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-0',
            sizeClasses[size],
            variantClasses[variant],
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
            leftIcon && (size === 'sm' ? 'pl-10' : size === 'lg' ? 'pl-12' : 'pl-11'),
            rightIcon && (size === 'sm' ? 'pr-10' : size === 'lg' ? 'pr-12' : 'pr-11'),
            'transition-all duration-200 ease-in-out',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightIcon && (
          <div className={clsx(
            'absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none',
            'transition-colors duration-200',
            isFocused ? 'text-blue-500' : 'text-gray-400'
          )}>
            <div className={clsx(
              'h-5 w-5',
              size === 'lg' && 'h-6 w-6',
              size === 'sm' && 'h-4 w-4'
            )}>
              {rightIcon}
            </div>
          </div>
        )}
        
        {/* Focus ring effect */}
        <div className={clsx(
          'absolute inset-0 rounded-xl pointer-events-none',
          'transition-all duration-200 ease-in-out',
          isFocused && !error && 'ring-2 ring-blue-500/20',
          error && 'ring-2 ring-red-500/20'
        )} />
      </div>
      
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {helperText && !error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{helperText}</span>
        </div>
      )}
    </div>
  )
}

export default Input
