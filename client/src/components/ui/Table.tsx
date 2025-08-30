import React from 'react'
import { clsx } from 'clsx'

export interface TableColumn<T = any> {
  key: string
  header: string
  render?: (value: any, item: T) => React.ReactNode
  className?: string
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  className?: string
  emptyMessage?: string
  loading?: boolean
}

export interface TableHeaderProps {
  children: React.ReactNode
  className?: string
}

export interface TableBodyProps {
  children: React.ReactNode
  className?: string
}

export interface TableRowProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export interface TableCellProps {
  children: React.ReactNode
  className?: string
}

const Table = <T extends Record<string, any>>({ 
  columns, 
  data, 
  className,
  emptyMessage = "No data available",
  loading = false
}: TableProps<T>) => {
  if (loading) {
    return (
      <div className={clsx('animate-pulse', className)}>
        <div className="bg-gray-200 dark:bg-gray-700 h-8 rounded mb-2"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-12 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={clsx('text-center py-8 text-gray-500 dark:text-gray-400', className)}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={clsx(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={clsx(
                    'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
                    column.className
                  )}
                >
                  {column.render 
                    ? column.render(item[column.key], item)
                    : item[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return (
    <thead className={clsx('bg-gray-50 dark:bg-gray-800', className)}>
      {children}
    </thead>
  )
}

const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return (
    <tbody className={clsx('bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700', className)}>
      {children}
    </tbody>
  )
}

const TableRow: React.FC<TableRowProps> = ({ children, className, onClick }) => {
  return (
    <tr 
      className={clsx(
        'hover:bg-gray-50 dark:hover:bg-gray-700',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

const TableCell: React.FC<TableCellProps> = ({ children, className }) => {
  return (
    <td className={clsx('px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100', className)}>
      {children}
    </td>
  )
}

export { TableHeader, TableBody, TableRow, TableCell }
export default Table
