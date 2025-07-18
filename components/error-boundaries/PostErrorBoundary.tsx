'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@heroui/react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class PostErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PostErrorBoundary caught an error:', error, errorInfo)
    
    // Call the optional onError prop
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Send error to monitoring service (Sentry)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-background border border-danger/20 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-danger mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Algo deu errado
          </h2>
          <p className="text-foreground/70 mb-4 max-w-md">
            Ocorreu um erro inesperado ao carregar este conteúdo. Tente novamente ou recarregue a página.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-4 p-4 bg-danger/10 rounded border text-left text-sm">
              <summary className="cursor-pointer font-medium">Detalhes do erro</summary>
              <pre className="mt-2 text-xs overflow-auto">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <Button
            color="primary"
            variant="flat"
            startContent={<RefreshCw className="h-4 w-4" />}
            onPress={this.handleRetry}
          >
            Tentar novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper component for easier usage
interface PostErrorWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function PostErrorWrapper({ children, fallback }: PostErrorWrapperProps) {
  return (
    <PostErrorBoundary
      fallback={fallback}
      onError={(error, errorInfo) => {
        // Custom error logging
        console.error('Post error:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        })
      }}
    >
      {children}
    </PostErrorBoundary>
  )
}

// Specialized error boundaries for different post components
export function TimelineErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <PostErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-danger mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Erro ao carregar timeline
          </h3>
          <p className="text-foreground/70 mb-4">
            Não foi possível carregar os posts. Verifique sua conexão e tente novamente.
          </p>
          <Button
            color="primary"
            variant="flat"
            onPress={() => window.location.reload()}
          >
            Recarregar página
          </Button>
        </div>
      }
    >
      {children}
    </PostErrorBoundary>
  )
}

export function PostCardErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <PostErrorBoundary
      fallback={
        <div className="p-4 border border-danger/20 rounded-lg bg-danger/5">
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Erro ao carregar post</span>
          </div>
        </div>
      }
    >
      {children}
    </PostErrorBoundary>
  )
}

export function CommentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <PostErrorBoundary
      fallback={
        <div className="p-3 border border-danger/20 rounded bg-danger/5">
          <p className="text-sm text-danger">Erro ao carregar comentário</p>
        </div>
      }
    >
      {children}
    </PostErrorBoundary>
  )
}