import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required']
  }
}, {
  timestamps: true
})

// Method to compare password
userSchema.methods['comparePassword'] = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this['passwordHash'])
}

// Pre-save middleware to hash password if modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next()
  
  try {
    // If passwordHash is not already hashed (length < 60), hash it
    if (this['passwordHash'].length < 60) {
      const salt = await bcrypt.genSalt(12)
      this['passwordHash'] = await bcrypt.hash(this['passwordHash'], salt)
    }
    next()
  } catch (error) {
    next(error as Error)
  }
})

export const User = mongoose.model<IUser>('User', userSchema)
