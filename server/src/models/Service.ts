import mongoose, { Document, Schema } from 'mongoose'

export interface IService extends Document {
  name: string
  description?: string
}

const serviceSchema = new Schema<IService>({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
})

// Index for service name uniqueness
serviceSchema.index({ name: 1 }, { unique: true })

export const Service = mongoose.model<IService>('Service', serviceSchema)

