import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, COOKIE_NAME } from '../config/env'

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        role: string
      }
    }
  }
}

export interface JWTPayload {
  userId: string
  role: 'admin'
  iat?: number
  exp?: number
}

/**
 * Middleware to require admin authentication
 * Reads JWT from HTTP-only cookie and verifies it
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from cookie
    const token = req.cookies[COOKIE_NAME]

    if (!token) {
      res.status(401).json({ 
        message: 'Access denied. No authentication token provided.' 
      })
      return
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

    // Check if user has admin role
    if (decoded.role !== 'admin') {
      res.status(403).json({ 
        message: 'Access denied. Admin role required.' 
      })
      return
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    }

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        message: 'Access denied. Token expired.' 
      })
      return
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        message: 'Access denied. Invalid token.' 
      })
      return
    }

    // Other errors
    console.error('Auth middleware error:', error)
    res.status(500).json({ 
      message: 'Internal server error during authentication.' 
    })
  }
}

/**
 * Optional middleware to get user info if token exists
 * Does not require authentication
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies[COOKIE_NAME]

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
      req.user = {
        userId: decoded.userId,
        role: decoded.role
      }
    }

    next()
  } catch (error) {
    // If token is invalid, just continue without user info
    next()
  }
}
