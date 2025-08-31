import { Router, Request, Response } from 'express'
import { z } from 'zod'
import jwt, { SignOptions } from 'jsonwebtoken'
import type { StringValue } from 'ms'
import { User } from '../models'
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  COOKIE_NAME,
  NODE_ENV,
} from '../config/env'
import { requireAdmin } from '../middleware/auth'

// If your middleware already exports this, import it instead.
// This local type avoids @ts-expect-error by telling TS about req.user
type AuthedRequest = Request & {
  user?: { userId: string; role: string }
}

const router = Router()

// -----------------------------
// Validation
// -----------------------------
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// Helper to get a properly typed expiresIn
function resolveExpiresIn(): number | StringValue {
  // env gives us a string like "7d"; fall back to "7d" if empty
  return ((JWT_EXPIRES_IN || '7d') as unknown) as StringValue
}

// -----------------------------
// POST /api/auth/login
// -----------------------------
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    // Find user & verify password
    const user = await User.findOne({ email: email.toLowerCase() })
    const valid = user ? await user.comparePassword(password) : false
    if (!user || !valid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }

    // Create JWT
    const payload = { userId: String(user._id), role: 'admin' as const }
    const options: SignOptions = { expiresIn: resolveExpiresIn() }
    const token = jwt.sign(payload, JWT_SECRET, options)

    // ✅ Set cross-site, signed cookie (Vercel ↔ Railway)
    const isProd = NODE_ENV === 'production'
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,     // HTTPS required in prod
      sameSite: 'none',   // required for cross-site cookie
      signed: true,       // matches cookieParser(COOKIE_SECRET)
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'admin',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      })
      return
    }
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: 'Internal server error during login' })
  }
})

// -----------------------------
// POST /api/auth/logout
// -----------------------------
router.post('/logout', (_req: Request, res: Response): void => {
  try {
    const isProd = NODE_ENV === 'production'
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'none',
      signed: true,
      path: '/',
    })
    res.status(200).json({ success: true, message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ success: false, message: 'Internal server error during logout' })
  }
})

// -----------------------------
// GET /api/auth/me (protected)
// -----------------------------
router.get('/me', requireAdmin, async (req: AuthedRequest, res: Response): Promise<void> => {
  try {
    const uid = req.user?.userId
    if (!uid) {
      res.status(401).json({ success: false, message: 'User not authenticated' })
      return
    }

    const user = await User.findById(uid).select('-password -passwordHash')
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    res.status(200).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: 'admin' },
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// -----------------------------
// GET /api/auth/check (public)
// -----------------------------
router.get('/check', (req: Request, res: Response): void => {
  try {
    const token =
      // prefer signed cookie (since we set signed: true)
      (req.signedCookies && req.signedCookies[COOKIE_NAME]) ||
      (req.cookies && req.cookies[COOKIE_NAME])

    if (!token) {
      res.status(200).json({ success: true, authenticated: false, message: 'No token found' })
      return
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      res.status(200).json({ success: true, authenticated: true, user: decoded })
    } catch {
      res.status(200).json({ success: true, authenticated: false, message: 'Invalid or expired token' })
    }
  } catch (error) {
    console.error('Auth check error:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

export default router
