import mongoose, { Document, Schema } from 'mongoose'

export interface ISlot extends Document {
  magazinId: mongoose.Types.ObjectId
  date: string // YYYY-MM-DD format
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  startISO: Date // Full ISO date for storage
  endISO: Date // Full ISO date for storage
  available: boolean
  takenCount: number
  capacity: number
  status: 'available' | 'booked' | 'blocked'
}

const slotSchema = new Schema<ISlot>({
  magazinId: {
    type: Schema.Types.ObjectId,
    ref: 'Magazin',
    required: [true, 'Magazin ID is required'],
    index: true
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    index: true
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'],
    index: true
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
  },
  startISO: {
    type: Date,
    required: [true, 'Start ISO date is required'],
    index: true
  },
  endISO: {
    type: Date,
    required: [true, 'End ISO date is required']
  },
  available: {
    type: Boolean,
    default: true,
    index: true
  },
  takenCount: {
    type: Number,
    default: 0,
    min: [0, 'Taken count cannot be negative']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'booked', 'blocked'],
      message: 'Status must be available, booked, or blocked'
    },
    default: 'available',
    index: true
  }
}, {
  timestamps: true
})

// Compound indexes for efficient queries
slotSchema.index({ magazinId: 1, date: 1, startTime: 1 }, { unique: true })
slotSchema.index({ magazinId: 1, date: 1, available: 1 })
slotSchema.index({ magazinId: 1, startISO: 1, endISO: 1 })

export const Slot = mongoose.model<ISlot>('Slot', slotSchema)
