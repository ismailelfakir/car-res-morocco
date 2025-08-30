import mongoose, { Document, Schema } from 'mongoose'

export interface ICustomer {
  name: string
  phone: string
  carPlate: string
  notes?: string
}

export interface IAppointment extends Document {
  reference: string
  customer: ICustomer
  magazinId: mongoose.Types.ObjectId
  serviceId: mongoose.Types.ObjectId
  start: Date
  end: Date
  status: 'pending' | 'confirmed' | 'canceled'
}

const customerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^0[0-9]{9}$/, 'Please enter a valid Moroccan phone number starting with 0']
  },
  carPlate: {
    type: String,
    required: [true, 'Car plate number is required'],
    trim: true,
    uppercase: true,
    maxlength: [20, 'Car plate number cannot exceed 20 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
})

const appointmentSchema = new Schema<IAppointment>({
  reference: {
    type: String,
    required: [true, 'Reference code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]{6,10}$/, 'Reference must be 6-10 alphanumeric characters']
  },
  customer: {
    type: customerSchema,
    required: [true, 'Customer information is required']
  },
  magazinId: {
    type: Schema.Types.ObjectId,
    ref: 'Magazin',
    required: [true, 'Magazin ID is required']
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required']
  },
  start: {
    type: Date,
    required: [true, 'Start time is required']
  },
  end: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'canceled'],
      message: 'Status must be pending, confirmed, or canceled'
    },
    default: 'pending'
  },
  // Removed holdExpiresAt field - no longer needed
}, {
  timestamps: true
})

// Unique compound index on { magazinId, start } with partial filter on status
appointmentSchema.index(
  { magazinId: 1, start: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $in: ['pending', 'confirmed'] } 
    }
  }
)

// Index for status
appointmentSchema.index({ status: 1 })

// Index for magazinId
appointmentSchema.index({ magazinId: 1 })

// Index for serviceId
appointmentSchema.index({ serviceId: 1 })

// Index for start date
appointmentSchema.index({ start: 1 })

// Compound index for status and start date
appointmentSchema.index({ status: 1, start: 1 })

// Compound index for magazinId and status
appointmentSchema.index({ magazinId: 1, status: 1 })

// Compound index for magazinId and date range queries
appointmentSchema.index({ magazinId: 1, start: 1, end: 1 })

// Pre-save middleware to set end time if not provided
appointmentSchema.pre('save', function(next) {
  if (this.isModified('start') && !this.end) {
    // This will be handled by the service layer when creating appointments
    // as we need the service duration to calculate the end time
  }
  next()
})

// Removed auto-expiration middleware - appointments should stay until manually handled

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema)

