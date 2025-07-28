interface LogContext {
  userId?: string
  tenantId?: string
  method?: string
  url?: string
  ip?: string
  userAgent?: string
  [key: string]: any
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...(context && { context }),
      environment: process.env.NODE_ENV
    }

    return this.isDevelopment 
      ? JSON.stringify(logEntry, null, 2)
      : JSON.stringify(logEntry)
  }

  error(message: string, context?: LogContext) {
    console.error(this.formatMessage(LogLevel.ERROR, message, context))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage(LogLevel.WARN, message, context))
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage(LogLevel.INFO, message, context))
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context))
    }
  }

  apiRequest(method: string, url: string, context?: LogContext) {
    this.info(`API ${method} ${url}`, {
      method,
      url,
      ...context
    })
  }

  apiResponse(method: string, url: string, status: number, duration: number, context?: LogContext) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
    this[level](`API ${method} ${url} - ${status} (${duration}ms)`, {
      method,
      url,
      status,
      duration,
      ...context
    })
  }

  databaseQuery(query: string, duration: number, context?: LogContext) {
    this.debug(`DB Query: ${query} (${duration}ms)`, {
      query,
      duration,
      ...context
    })
  }

  security(event: string, context?: LogContext) {
    this.warn(`Security Event: ${event}`, context)
  }
}

export const logger = new Logger()