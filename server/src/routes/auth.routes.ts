import { Router, Request, Response } from 'express'
import { z } from 'zod'
import jwt, { SignOptions } from 'jsonwebtoken'
import { User } from '../models'
import { JWT_SECRET, COOKIE_NAME, NODE_ENV } from '../config/env'
import { requireAdmin } from '../middleware/auth'

const router = Router()

// Login schema validation
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

/**
 * POST /api/auth/login
 * Login admin user with email and password
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { email, password } = loginSchema.parse(req.body)

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      res.status(401).json({ 
        message: 'Invalid email or password' 
      })
      return
    }

    // Check password
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      res.status(401).json({ 
        message: 'Invalid email or password' 
      })
      return
    }

    // Generate JWT token
    const payload = {
      userId: String(user._id),
      role: 'admin' as const
    }

    const options: SignOptions = {
      expiresIn: '7d'
    }
    
    const token = jwt.sign(payload, JWT_SECRET as string, options)

    // Set HTTP-only cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: NODE_ENV === 'production', // HTTPS only in production
      sameSite: NODE_ENV === 'production' ? 'none' : 'strict', // 'none' for cross-domain in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    })

    // Return success response (without token in body)
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'admin'
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
      return
    }

    console.error('Login error:', error)
    res.status(500).json({ 
      message: 'Internal server error during login' 
    })
  }
})

/**
 * POST /api/auth/logout
 * Logout user by clearing cookie
 */
router.post('/logout', (_req: Request, res: Response): void => {
  try {
    // Clear cookie
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'strict'
    })

    res.status(200).json({ 
      message: 'Logout successful' 
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ 
      message: 'Internal server error during logout' 
    })
  }
})

/**
 * GET /api/auth/me
 * Get current user info (protected route for testing)
 */
router.get('/me', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        message: 'User not authenticated' 
      })
      return
    }

    // Get user from database
    const user = await User.findById(req.user.userId).select('-passwordHash')
    if (!user) {
      res.status(404).json({ 
        message: 'User not found' 
      })
      return
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'admin'
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ 
      message: 'Internal server error' 
    })
  }
})

/**
 * GET /api/auth/check
 * Check if user is authenticated (unprotected route for testing)
 */
router.get('/check', (req: Request, res: Response): void => {
  try {
    const token = req.cookies[COOKIE_NAME]
    
    if (!token) {
      res.status(200).json({ 
        authenticated: false,
        message: 'No token found'
      })
      return
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      res.status(200).json({ 
        authenticated: true,
        user: decoded
      })
    } catch (jwtError) {
      res.status(200).json({ 
        authenticated: false,
        message: 'Invalid or expired token'
      })
    }

  } catch (error) {
    console.error('Auth check error:', error)
    res.status(500).json({ 
      message: 'Internal server error' 
    })
  }
})

export default router
