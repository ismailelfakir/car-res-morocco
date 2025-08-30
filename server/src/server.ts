import app from './app'
import { connectDB } from './db/connect'
import { PORT, NODE_ENV } from './config/env'

// Start server first
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Environment: ${NODE_ENV}`)
})

// Try to connect to MongoDB (but don't fail if it doesn't work)
connectDB().catch((error) => {
  console.log('⚠️  MongoDB connection failed, but server is running for testing')
  console.log('⚠️  Some endpoints may not work without database connection')
  console.log(`⚠️  Error: ${error.message}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})
