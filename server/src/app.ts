import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

// Import validated env vars
import { COOKIE_SECRET, CORS_ORIGIN } from './config/env'

// Import routes
import authRoutes from './routes/auth.routes'
import magazinsRoutes from './routes/magazins.routes'
import appointmentsRoutes from './routes/appointments.routes'
import servicesRoutes from './routes/services.routes'
import reportsRoutes from './routes/reports.routes'

const app = express()

// ✅ Trust proxy (important for Railway + secure cookies)
app.set('trust proxy', 1)

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ✅ Cookie parsing (using validated secret)
app.use(cookieParser(COOKIE_SECRET))

// ✅ CORS configuration (support multiple origins via env, comma-separated)
const allowedOrigins = CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true) // allow curl/postman/no-origin
      return allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error(`Not allowed by CORS: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

// Explicit preflight handler
app.options('*', cors({ origin: allowedOrigins, credentials: true }))

// Logging middleware
app.use(morgan('combined'))

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/magazins', magazinsRoutes)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/reports', reportsRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
})

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Global error handler:', err)
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error'
    })
  }
)

export default app
