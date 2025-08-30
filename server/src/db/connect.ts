import mongoose from 'mongoose'
import { MONGODB_URI } from '../config/env'

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI)
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.log('⚠️  MongoDB connection failed, but continuing...')
    console.log(`⚠️  Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    // Don't throw error, just log it
  }
}
