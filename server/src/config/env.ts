import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables
dotenv.config()

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  MONGODB_URI: z.string().default('mongodb+srv://car-res:car-res@car-res.nva1jqn.mongodb.net/car-tech-reservations'),
  JWT_SECRET: z.string().default('dev-jwt-secret-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_NAME: z.string().default('ct_admin'),
  COOKIE_SECRET: z.string().default('dev-cookie-secret-change-in-production'),
  CORS_ORIGIN: z.string().default('http://localhost:3000')
})

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.'))
      console.warn(`⚠️  Environment variable validation warnings: ${missingVars.join(', ')}`)
      console.warn('⚠️  Using default values for development')
      
      // Return default values for development
      return {
        NODE_ENV: 'development',
        PORT: 4000,
        MONGODB_URI: 'mongodb+srv://car-res:car-res@car-res.nva1jqn.mongodb.net/car-tech-reservations',
        JWT_SECRET: 'dev-jwt-secret-change-in-production',
        JWT_EXPIRES_IN: '7d',
        COOKIE_NAME: 'ct_admin',
        COOKIE_SECRET: 'dev-cookie-secret-change-in-production',
        CORS_ORIGIN: 'http://localhost:3000'
      }
    }
    throw error
  }
}

// Export validated environment variables
export const env = parseEnv()

// Export individual variables for convenience
export const {
  NODE_ENV,
  PORT,
  MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  COOKIE_NAME,
  COOKIE_SECRET,
  CORS_ORIGIN
} = env

// Type for environment variables
export type Env = z.infer<typeof envSchema>
