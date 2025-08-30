import React from 'react'
import { clsx } from 'clsx'

export interface CardProps {
  children: React.ReactNode
  className?: string
}

export interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

export interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={clsx(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm',
      className
    )}>
      {children}
    </div>
  )
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={clsx(
      'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
      className
    )}>
      {children}
    </div>
  )
}

const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
  return (
    <div className={clsx(
      'px-6 py-4',
      className
    )}>
      {children}
    </div>
  )
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={clsx(
      'px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50',
      className
    )}>
      {children}
    </div>
  )
}

export { CardHeader, CardBody, CardFooter }
export default Card
