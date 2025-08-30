import mongoose, { Document, Schema } from 'mongoose'

export interface IWorkingHour {
  start: string
  end: string
}

export interface IGeo {
  lat: number
  lng: number
}

export interface IMagazin extends Document {
  name: string
  city: string
  address: string
  geo: IGeo
  services: mongoose.Types.ObjectId[]
  capacityPerSlot: number
  slotDurationMinutes: number
  workingHours: {
    mon: IWorkingHour[]
    tue: IWorkingHour[]
    wed: IWorkingHour[]
    thu: IWorkingHour[]
    fri: IWorkingHour[]
    sat: IWorkingHour[]
    sun: IWorkingHour[]
  }
  timezone: string
  blackoutDays: string[]
  active: boolean
}

const workingHourSchema = new Schema<IWorkingHour>({
  start: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
  },
  end: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
  }
})

const geoSchema = new Schema<IGeo>({
  lat: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  lng: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  }
})

const magazinSchema = new Schema<IMagazin>({
  name: {
    type: String,
    required: [true, 'Magazin name is required'],
    trim: true,
    maxlength: [100, 'Magazin name cannot exceed 100 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  geo: {
    type: geoSchema,
    required: [true, 'Geographic coordinates are required']
  },
  services: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Service'
    }],
    required: [true, 'At least one service is required'],
    validate: {
      validator: function(services: any[]) {
        return services && services.length > 0
      },
      message: 'At least one service must be selected'
    }
  },
  capacityPerSlot: {
    type: Number,
    required: [true, 'Capacity per slot is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [100, 'Capacity cannot exceed 100']
  },
  slotDurationMinutes: {
    type: Number,
    required: [true, 'Slot duration is required'],
    min: [15, 'Slot duration must be at least 15 minutes'],
    max: [1440, 'Slot duration cannot exceed 24 hours (1440 minutes)']
  },
  workingHours: {
    mon: [workingHourSchema],
    tue: [workingHourSchema],
    wed: [workingHourSchema],
    thu: [workingHourSchema],
    fri: [workingHourSchema],
    sat: [workingHourSchema],
    sun: [workingHourSchema]
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    default: 'Africa/Casablanca'
  },
  blackoutDays: [{
    type: String,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Blackout days must be in YYYY-MM-DD format']
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// 2dsphere index on geo for geospatial queries
magazinSchema.index({ geo: '2dsphere' })

// Index for city for faster city-based queries
magazinSchema.index({ city: 1 })

// Index for active status
magazinSchema.index({ active: 1 })

// Compound index for name and city
magazinSchema.index({ name: 1, city: 1 })

export const Magazin = mongoose.model<IMagazin>('Magazin', magazinSchema)

