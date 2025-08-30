import React, { Component, ErrorInfo, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundaryClass extends Component<Props & { t: (key: string) => string }, State> {
  constructor(props: Props & { t: (key: string) => string }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    console.error('Error stack:', error.stack)
    console.error('Error info:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {this.props.t('errorBoundary.title')}
            </h1>
            <p className="text-gray-600 mb-6">
              {this.props.t('errorBoundary.message')}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {this.props.t('errorBoundary.reload')}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper component to provide translation context
const ErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  const { t, ready } = useTranslation()
  
  // Always provide fallback text as backup, even when i18n is ready
  const getText = (key: string) => {
    const fallbacks: Record<string, string> = {
      'errorBoundary.title': 'Something went wrong',
      'errorBoundary.message': 'We encountered an unexpected error. Please try refreshing the page.',
      'errorBoundary.reload': 'Reload Page'
    }
    
    // Try to get translation, fallback to English if not available
    if (ready && t) {
      const translated = t(key)
      // If translation returns the key itself, use fallback
      return translated !== key ? translated : fallbacks[key] || key
    }
    
    return fallbacks[key] || key
  }
  
  return <ErrorBoundaryClass t={getText} fallback={fallback}>{children}</ErrorBoundaryClass>
}

export default ErrorBoundary
