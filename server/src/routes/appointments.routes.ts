import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Appointment, Magazin, Service } from '../models'
import { updateSlotAvailability } from '../services/slotService'
import { requireAdmin } from '../middleware/auth'
 
const router = Router()

/**
 * GET /api/appointments
 * Get available time slots for a specific date and magazin (PUBLIC)
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, magazinId } = req.query

    // Validate required parameters
    if (!date || !magazinId) {
      res.status(400).json({
        success: false,
        message: 'Date and magazinId are required'
      })
      return
    }

    // Validate date format
    if (!date.toString().match(/^\d{4}-\d{2}-\d{2}$/)) {
      res.status(400).json({
        success: false,
        message: 'Date must be in YYYY-MM-DD format'
      })
      return
    }

    // Validate magazinId format
    if (!magazinId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid magazin ID format'
      })
      return
    }

    // Get magazin and existing appointments
    const [magazin, existingAppointments] = await Promise.all([
      Magazin.findById(magazinId).lean(),
      Appointment.find({
        magazinId,
        start: {
          $gte: new Date(date + 'T00:00:00.000Z'),
          $lt: new Date(date + 'T23:59:59.999Z')
        },
        status: { $in: ['pending', 'confirmed'] }
      }).lean()
    ])

    if (!magazin) {
      res.status(404).json({
        success: false,
        message: 'Magazin not found'
      })
      return
    }

    // Return available slots info
    res.status(200).json({
      success: true,
      data: existingAppointments,
      magazin: {
        workingHours: magazin.workingHours,
        capacityPerSlot: magazin.capacityPerSlot,
        slotDurationMinutes: magazin.slotDurationMinutes
      }
    })

  } catch (error) {
    console.error('Get available slots error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})
 
// Appointment creation schema validation
const createAppointmentSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Customer name is required').max(100, 'Name too long'),
    phone: z.string().min(1, 'Phone number is required'),
    carPlate: z.string().min(1, 'Car plate is required').max(20, 'Car plate too long'),
    notes: z.string().optional()
  }),
  magazinId: z.string().min(1, 'Magazin ID is required'),
  serviceId: z.string().min(1, 'Service ID is required'),
  startISO: z.string().min(1, 'Start time is required')
})

// Admin query filters schema
const adminQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'canceled']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  magazinId: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional()
})
 
/**
 * POST /api/appointments
 * Create a new appointment
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { customer, magazinId, serviceId, startISO } = createAppointmentSchema.parse(req.body)
 
    // Validate ObjectId formats
    if (!magazinId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid magazin ID format'
      })
      return
    }
 
    if (!serviceId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      })
      return
    }
 
    // Parse start time
    const start = new Date(startISO)
    if (isNaN(start.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid start time format'
      })
      return
    }
 
    // Check if start time is in the future
    if (start <= new Date()) {
      res.status(400).json({
        success: false,
        message: 'Start time must be in the future'
      })
      return
    }
 
    // Get magazin and service
    const [magazin, service] = await Promise.all([
      Magazin.findById(magazinId).lean(),
      Service.findById(serviceId).lean()
    ])
 
    if (!magazin) {
      res.status(404).json({
        success: false,
        message: 'Magazin not found'
      })
      return
    }
 
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      })
      return
    }
 
    // Check if service is available at this magazin
    const serviceAvailable = magazin.services.some(service => {
      if (typeof service === 'object' && service._id) {
        return service._id.toString() === serviceId
      }
      return service.toString() === serviceId
    })
    
    if (!serviceAvailable) {
      res.status(400).json({
        success: false,
        message: 'Service not available at this magazin'
      })
      return
    }
 
    // Calculate end time using magazin's slot duration
    const slotDurationMinutes = (magazin as any).slotDurationMinutes || 20 // Default to 20 minutes if not specified
    const end = new Date(start.getTime() + slotDurationMinutes * 60 * 1000)
    
    // DEBUG: Log the calculated times
    console.log('Appointment time calculation:', {
      start: start.toISOString(),
      end: end.toISOString(),
      slotDurationMinutes,
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5)
    })
 
        // Check if magazin is open at this time
    // FIXED: Use local time instead of UTC for working hours check
    const dayOfWeek = start.getDay() // Use local day instead of UTC
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const currentDay = dayNames[dayOfWeek]
    const workingHours = (magazin.workingHours as any)[currentDay as keyof typeof magazin.workingHours]
    
    // DEBUG: Log magazin and working hours data
    console.log('Magazin working hours check:', {
      magazinId,
      dayOfWeek,
      currentDay,
      allWorkingHours: magazin.workingHours,
      currentDayHours: workingHours
    })
    
    if (!workingHours || workingHours.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Magazin is closed on this day'
      })
      return
    }
 
    // Check if time falls within working hours
    // FIXED: Use local time strings for comparison
    const startTime = start.toTimeString().slice(0, 5) // HH:MM format in local time
    const endTime = end.toTimeString().slice(0, 5)     // HH:MM format in local time
    
    // DEBUG: Log working hours and time comparison
    console.log('Working hours check:', {
      dayOfWeek: currentDay,
      workingHours,
      startTime,
      endTime,
      start: start.toISOString(),
      end: end.toISOString()
    })
    
    const isWithinWorkingHours = (workingHours as Array<{ start: string; end: string }>).some(period => {
      // SIMPLIFIED: Allow appointments that start within working hours
      // Even if they end slightly after closing (within 1 hour grace period)
      const startWithin = startTime >= period.start && startTime < period.end
      
      // Simple string comparison for end time with grace period
      // Convert times to comparable format (HH:MM)
      const periodEndParts = period.end.split(':')
      const periodEndHour = parseInt(periodEndParts[0] || '0', 10)
      const periodEndMin = parseInt(periodEndParts[1] || '0', 10)
      
      // Allow 1 hour grace period after closing
      let gracePeriodHour = periodEndHour + 1
      let gracePeriodMin = periodEndMin
      if (gracePeriodMin >= 60) {
        gracePeriodHour += 1
        gracePeriodMin = 0
      }
      
      const gracePeriodEnd = `${gracePeriodHour.toString().padStart(2, '0')}:${gracePeriodMin.toString().padStart(2, '0')}`
      
      const endWithinGrace = endTime <= gracePeriodEnd
      const isWithin = startWithin && endWithinGrace
      
      console.log(`Period ${period.start}-${period.end}: startTime ${startTime} >= ${period.start} = ${startTime >= period.start}, startTime < ${period.end} = ${startTime < period.end}, endTime ${endTime} <= ${gracePeriodEnd} (grace) = ${endTime <= gracePeriodEnd}, result: ${isWithin}`)
      return isWithin
    })
    
    console.log('Final working hours result:', isWithinWorkingHours)
 
    if (!isWithinWorkingHours) {
      res.status(400).json({
        success: false,
        message: `Appointment time is outside working hours. Requested: ${startTime}-${endTime}, Available: ${workingHours.map((p: any) => `${p.start}-${p.end}`).join(', ')}`
      })
      return
    }
 
    // Check if it's a blackout day
    // FIXED: Use local date instead of UTC date
    const dateYYYYMMDD = start.toLocaleDateString('en-CA') // Returns YYYY-MM-DD in local timezone
    if (magazin.blackoutDays.includes(dateYYYYMMDD)) {
      res.status(400).json({
        success: false,
        message: 'Magazin is closed on this date (blackout day)'
      })
      return
    }

    // CRITICAL: Check for booking conflicts before creating appointment
    // FIXED: Only block ACTUAL overlapping slots, not adjacent ones
    
    // DEBUG: Log the conflict check parameters
    console.log('Conflict check parameters:', {
      magazinId: magazinId.toString(),
      start: start.toISOString(),
      end: end.toISOString(),
      slotDurationMinutes,
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5)
    })
    
    const conflictCheck = await Appointment.findOne({
      magazinId,
      start: { $lt: end }, // Appointment starts before this one ends
      end: { $gt: start }, // Appointment ends after this one starts
      status: { $in: ['pending', 'confirmed'] } // Only check active appointments
    })

    if (conflictCheck) {
      // DEBUG: Log the conflict details
      console.log('CONFLICT DETECTED:', {
        newAppointment: {
          start: start.toISOString(),
          end: end.toISOString(),
          duration: `${slotDurationMinutes} minutes`
        },
        existingAppointment: {
          reference: conflictCheck.reference,
          start: conflictCheck.start.toISOString(),
          end: conflictCheck.end.toISOString(),
          duration: `${Math.round((conflictCheck.end.getTime() - conflictCheck.start.getTime()) / (1000 * 60))} minutes`
        }
      })
      
      res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please select a different time.',
        conflict: {
          existingReference: conflictCheck.reference,
          existingStart: conflictCheck.start,
          existingEnd: conflictCheck.end
        }
      })
      return
    }
 
    // Generate unique reference code
    const generateReference = (): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = ''
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }
 
    let reference: string = ''
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10
 
    while (!isUnique && attempts < maxAttempts) {
      reference = generateReference()
      const existing = await Appointment.findOne({ reference })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }
 
    if (!isUnique) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate unique reference code'
      })
      return
    }
 
    // Create appointment
    const appointment = new Appointment({
      reference,
      customer,
      magazinId,
      serviceId,
      start,
      end,
      status: 'pending'
    })
 
    try {
      await appointment.save()
      
      // Update slot availability after successful appointment creation
      await updateSlotAvailability(magazinId, start, end, true)
      
    } catch (saveError: any) {
      // Check if it's a duplicate key error (index conflict)
      if (saveError.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'Time slot is already taken'
        })
        return
      }
      throw saveError
    }
 
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        reference: appointment.reference,
        customer: appointment.customer,
        magazin: {
          id: (magazin as any)._id,
          name: magazin.name,
          city: magazin.city,
          address: magazin.address
        },
        service: {
          id: (service as any)._id,
          name: service.name
        },
        start: appointment.start,
        end: appointment.end,
        status: appointment.status
      }
    })
 
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
      return
    }

    console.error('Create appointment error:', error)
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      details: process.env['NODE_ENV'] === 'development' && error instanceof Error ? error.message : undefined
    })
  }
})

/**
 * GET /api/appointments (ADMIN ONLY)
 * Get appointments with optional filters
 */
router.get('/admin', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const { status, date, magazinId, page: pageStr, limit: limitStr } = adminQuerySchema.parse(req.query)

    // Build query
    const query: any = {}
    
    if (status) {
      query.status = status
    }
    
    if (date) {
      const startOfDay = new Date(date + 'T00:00:00.000Z')
      const endOfDay = new Date(date + 'T23:59:59.999Z')
      query.start = { $gte: startOfDay, $lte: endOfDay }
    }
    
    if (magazinId) {
      if (!magazinId.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
          success: false,
          message: 'Invalid magazin ID format'
        })
        return
      }
      query.magazinId = magazinId
    }

    // Pagination params (defaults)
    const page = Math.max(parseInt(pageStr || '1', 10), 1)
    const limit = Math.max(parseInt(limitStr || '10', 10), 1)
    const skip = (page - 1) * limit

    // Count total for pagination
    const total = await Appointment.countDocuments(query)

    // Get appointments with populated magazin and service (latest first)
    const appointments = await Appointment.find(query)
      .populate('magazinId', 'name city address')
      .populate('serviceId', 'name')
      .sort({ start: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Add cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    })
    
    res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
      return
    }

    console.error('Get appointments error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})
 
/**
 * GET /api/appointments/:reference
 * Get appointment summary and status
 */
router.get('/:reference', async (req: Request, res: Response): Promise<void> => {
  try {
    const reference = String(req.params['reference'] || '')
 
    // Validate reference format
    if (!reference.match(/^[A-Z0-9]{6}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid reference format'
      })
      return
    }
 
    // Get appointment with populated magazin and service
    const appointment = await Appointment.findOne({ reference })
      .populate('magazinId', 'name city address')
      .populate('serviceId', 'name durationMinutes')
      .lean()
 
    if (!appointment) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
      return
    }
 
    res.status(200).json({
      success: true,
      data: {
        reference: (appointment as any).reference,
        customer: (appointment as any).customer,
        magazin: (appointment as any).magazinId,
        service: (appointment as any).serviceId,
        start: (appointment as any).start,
        end: (appointment as any).end,
        status: (appointment as any).status,
        createdAt: (appointment as any).createdAt,
        updatedAt: (appointment as any).updatedAt
      }
    })
 
  } catch (error) {
    console.error('Get appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * POST /api/appointments/:id/confirm (ADMIN ONLY)
 * Confirm an appointment
 */
router.post('/:id/confirm', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id'] || '')

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format'
      })
      return
    }

    // Find and update appointment
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        $set: { status: 'confirmed' }
      },
      { new: true }
    ).populate('magazinId', 'name city address')
     .populate('serviceId', 'name durationMinutes')
     .lean()

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: appointment
    })

  } catch (error) {
    console.error('Confirm appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * POST /api/appointments/:id/cancel (ADMIN ONLY)
 * Cancel an appointment
 */
router.post('/:id/cancel', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id'] || '')

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format'
      })
      return
    }

    // Find and update appointment
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        $set: { status: 'canceled' }
      },
      { new: true }
    ).populate('magazinId', 'name city address')
     .populate('serviceId', 'name durationMinutes')
     .lean()

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Appointment canceled successfully',
      data: appointment
    })

  } catch (error) {
    console.error('Cancel appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})
 
export default router
