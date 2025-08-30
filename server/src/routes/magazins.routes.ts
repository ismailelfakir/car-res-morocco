import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Magazin, Service, Appointment } from '../models'
import { getAvailableSlots, generateAndSaveSlots, generateSlotsForDateRange } from '../services/slotService'
import { requireAdmin } from '../middleware/auth'

const router = Router()

// Query parameter validation
const listQuerySchema = z.object({
  city: z.string().optional()
})

const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  serviceId: z.string().min(1, 'Service ID is required')
})

// Admin magazin creation/update schema
const magazinSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  city: z.string().min(1, 'City is required').max(50, 'City too long'),
  address: z.string().min(1, 'Address is required').max(200, 'Address too long'),
  geo: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }),
  services: z.array(z.string().min(24, 'Invalid service ID')).min(1, 'At least one service is required'),
  capacityPerSlot: z.number().min(1).max(100),
  slotDurationMinutes: z.number().min(15).max(1440),
  workingHours: z.object({
    mon: z.array(z.object({ start: z.string(), end: z.string() })),
    tue: z.array(z.object({ start: z.string(), end: z.string() })),
    wed: z.array(z.object({ start: z.string(), end: z.string() })),
    thu: z.array(z.object({ start: z.string(), end: z.string() })),
    fri: z.array(z.object({ start: z.string(), end: z.string() })),
    sat: z.array(z.object({ start: z.string(), end: z.string() })),
    sun: z.array(z.object({ start: z.string(), end: z.string() }))
  }),
  timezone: z.string().default('Africa/Casablanca'),
  blackoutDays: z.array(z.string()).default([]),
  active: z.boolean().default(true)
})

/**
 * GET /api/magazins
 * Get active magazins with optional city filter
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const { city } = listQuerySchema.parse(req.query)

    // Build query
    const query: any = { active: true }
    if (city) {
      query.city = { $regex: city, $options: 'i' } // Case-insensitive search
    }

    // Get magazins with populated services
    const magazins = await Magazin.find(query)
      .populate('services', 'name description')
      .select('name city address services workingHours capacityPerSlot slotDurationMinutes timezone')
      .lean()

    res.status(200).json({
      success: true,
      data: magazins,
      count: magazins.length
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

    console.error('Get magazins error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * GET /api/magazins (ADMIN ONLY)
 * Get all magazins (including inactive) for admin management
 */
router.get('/admin', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    // Get all magazins with populated services
    const magazins = await Magazin.find({})
      .populate('services', 'name description')
      .sort({ name: 1 })
      .lean()

    // Add cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    })

    res.status(200).json({
      success: true,
      data: magazins,
      count: magazins.length
    })

  } catch (error) {
    console.error('Get admin magazins error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * POST /api/magazins (ADMIN ONLY)
 * Create a new magazin
 */
router.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // DEBUG: Log the incoming request data
    console.log('Creating magazin with data:', {
      body: req.body,
      services: req.body.services,
      servicesType: typeof req.body.services,
      servicesLength: req.body.services?.length
    })
    
    // Validate request body
    const magazinData = magazinSchema.parse(req.body)

    // DEBUG: Log the validated data
    console.log('Validated magazin data:', {
      services: magazinData.services,
      servicesType: typeof magazinData.services,
      servicesLength: magazinData.services?.length
    })

    // Check if services exist
    // Convert string IDs to ObjectIds if needed
    const serviceIds = magazinData.services.map(id => String(id))
    
    const services = await Service.find({ _id: { $in: serviceIds } })
    console.log('Found services:', {
      requested: magazinData.services,
      requestedType: typeof magazinData.services[0],
      serviceIds,
      found: services.map((s: any) => s._id.toString()),
      count: services.length,
      expected: magazinData.services.length
    })
    
    if (services.length !== magazinData.services.length) {
      res.status(400).json({
        success: false,
        message: `One or more services not found. Requested: ${magazinData.services.length}, Found: ${services.length}`
      })
      return
    }

    // Create magazin
    const magazin = new Magazin(magazinData)
    await magazin.save()

    // Populate services for response
    await magazin.populate('services', 'name description')

    res.status(201).json({
      success: true,
      message: 'Magazin created successfully',
      data: magazin
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

    console.error('Create magazin error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * PUT /api/magazins/:id (ADMIN ONLY)
 * Update a magazin
 */
router.put('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id'] || '')

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid magazin ID format'
      })
      return
    }

    // Validate request body
    const magazinData = magazinSchema.parse(req.body)

    // Check if services exist
    // Convert string IDs to ObjectIds if needed
    const serviceIds = magazinData.services.map(id => String(id))
    
    const services = await Service.find({ _id: { $in: serviceIds } })
    if (services.length !== magazinData.services.length) {
      res.status(400).json({
        success: false,
        message: `One or more services not found. Requested: ${magazinData.services.length}, Found: ${services.length}`
      })
      return
    }

    // Find and update magazin
    const magazin = await Magazin.findByIdAndUpdate(
      id,
      magazinData,
      { new: true, runValidators: true }
    ).populate('services', 'name description')

    if (!magazin) {
      res.status(404).json({
        success: false,
        message: 'Magazin not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Magazin updated successfully',
      data: magazin
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

    console.error('Update magazin error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * DELETE /api/magazins/:id (ADMIN ONLY)
 * Delete a magazin (soft delete by setting active to false)
 */
router.delete('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id'] || '')

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid magazin ID format'
      })
      return
    }

    // Check if magazin has active appointments
    const activeAppointments = await Appointment.countDocuments({
      magazinId: id,
      status: { $in: ['pending', 'confirmed'] }
    })

    if (activeAppointments > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete magazin with ${activeAppointments} active appointments`
      })
      return
    }

    // Soft delete by setting active to false
    const magazin = await Magazin.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    )

    if (!magazin) {
      res.status(404).json({
        success: false,
        message: 'Magazin not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Magazin deleted successfully',
      data: magazin
    })

  } catch (error) {
    console.error('Delete magazin error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * GET /api/magazins/:id
 * Get magazin details with services
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id'] || '')

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid magazin ID format'
      })
      return
    }

    // Get magazin with populated services
    const magazin = await Magazin.findById(id)
      .populate('services', 'name description')
      .lean()

    if (!magazin) {
      res.status(404).json({
        success: false,
        message: 'Magazin not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      data: magazin
    })

  } catch (error) {
    console.error('Get magazin error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * GET /api/magazins/:id/availability
 * Get availability for a specific date and service
 */
router.get('/:id/availability', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id'] || '')
    const { date, serviceId } = availabilityQuerySchema.parse(req.query)

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
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

    // Get magazin and service
    const [magazin, service] = await Promise.all([
      Magazin.findById(id).lean(),
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
    if (!magazin.services.map((s: any) => s.toString()).includes(serviceId)) {
      res.status(400).json({
        success: false,
        message: 'Service not available at this magazin'
      })
      return
    }

    // Generate or get slots for this date
    const workingHours = (magazin as any).workingHours || {}
    const slotDurationMinutes = (magazin as any).slotDurationMinutes || 20
    const capacityPerSlot = (magazin as any).capacityPerSlot || 1
    
    // Get day of week to filter working hours
    const dayOfWeek = new Date(date).getDay()
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const currentDay = dayNames[dayOfWeek] || 'mon'
    const currentDayHours = (workingHours as any)[currentDay] || []
    
    if (currentDayHours.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: 'Magazin is closed on this day'
      })
      return
    }
    
    // Generate slots for this date if they don't exist
    await generateAndSaveSlots({
      magazinId: id,
      date,
      workingHours: currentDayHours,
      slotDurationMinutes,
      capacityPerSlot
    })
    
    // Get available slots from database
    const slots = await getAvailableSlots(id, date)
    
    if (slots.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: 'No available slots for this date'
      })
      return
    }
    
    // Convert slots to frontend format
    const formattedSlots = slots.map(slot => ({
      start: slot.startISO.toISOString(),
      end: slot.endISO.toISOString(),
      time: slot.startTime,
      available: slot.available,
      takenCount: slot.takenCount,
      capacity: slot.capacity
    }))

    res.status(200).json({
      success: true,
      data: {
        magazin: {
          id: (magazin as any)._id,
          name: (magazin as any).name,
          city: (magazin as any).city,
          address: (magazin as any).address,
          capacityPerSlot: (magazin as any).capacityPerSlot,
          slotDurationMinutes: (magazin as any).slotDurationMinutes
        },
        service: {
          id: (service as any)._id,
          name: (service as any).name
        },
        date: date,
        slots: formattedSlots,
        totalSlots: slots.length,
        availableSlots: slots.filter(slot => slot.available).length
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

    console.error('Get availability error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * POST /api/magazins/:id/generate-slots (ADMIN ONLY)
 * Generate time slots for a date range
 */
router.post('/:id/generate-slots', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id'] || '')
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid magazin ID format'
      })
      return
    }
    
    // Validate request body
    const { startDate, endDate } = req.body
    
    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      })
      return
    }
    
    // Get magazin
    const magazin = await Magazin.findById(id).lean()
    if (!magazin) {
      res.status(404).json({
        success: false,
        message: 'Magazin not found'
      })
      return
    }
    
    // Generate slots for the date range
    await generateSlotsForDateRange(
      id,
      startDate,
      endDate,
      (magazin as any).workingHours,
      (magazin as any).slotDurationMinutes || 20,
      (magazin as any).capacityPerSlot || 1
    )
    
    res.status(200).json({
      success: true,
      message: 'Time slots generated successfully',
      data: {
        magazinId: id,
        startDate,
        endDate,
        slotDurationMinutes: (magazin as any).slotDurationMinutes || 20,
        capacityPerSlot: (magazin as any).capacityPerSlot || 1
      }
    })
    
  } catch (error) {
    console.error('Generate slots error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router
