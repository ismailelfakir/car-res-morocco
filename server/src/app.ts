import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

// Import routes
import authRoutes from './routes/auth.routes'
import magazinsRoutes from './routes/magazins.routes'
import appointmentsRoutes from './routes/appointments.routes'
import servicesRoutes from './routes/services.routes'
import reportsRoutes from './routes/reports.routes'

const app = express()

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Cookie parsing middleware
app.use(cookieParser())

// CORS configuration
app.use(cors({
  origin: process.env['CLIENT_URL'] || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))

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
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${_req.originalUrl} not found`
  })
})

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Global error handler:', err)
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  })
})

export default app