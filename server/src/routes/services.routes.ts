import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Service, Magazin } from '../models'
import { requireAdmin } from '../middleware/auth'

const router = Router()

// Service creation/update schema
const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100, 'Service name too long'),
  description: z.string().optional()
})

/**
 * GET /api/services
 * Get all services (public)
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find({})
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
      data: services,
      count: services.length
    })

  } catch (error) {
    console.error('Get services error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * GET /api/services/:id
 * Get service details (public)
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id'] || '')

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      })
      return
    }

    const service = await Service.findById(id).lean()

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      data: service
    })

  } catch (error) {
    console.error('Get service error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * POST /api/services (ADMIN ONLY)
 * Create a new service
 */
router.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const serviceData = serviceSchema.parse(req.body)

    // Check if service name already exists
    const existingService = await Service.findOne({ name: serviceData.name })
    if (existingService) {
      res.status(409).json({
        success: false,
        message: 'Service with this name already exists'
      })
      return
    }

    // Create service
    const service = new Service(serviceData)
    await service.save()

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
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

    console.error('Create service error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * PUT /api/services/:id (ADMIN ONLY)
 * Update a service
 */
router.put('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id'] || '')

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      })
      return
    }

    // Validate request body
    const serviceData = serviceSchema.parse(req.body)

    // Check if service name already exists (excluding current service)
    const existingService = await Service.findOne({ 
      name: serviceData.name, 
      _id: { $ne: id } 
    })
    if (existingService) {
      res.status(409).json({
        success: false,
        message: 'Service with this name already exists'
      })
      return
    }

    // Find and update service
    const service = await Service.findByIdAndUpdate(
      id,
      serviceData,
      { new: true, runValidators: true }
    )

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
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

    console.error('Update service error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * DELETE /api/services/:id (ADMIN ONLY)
 * Delete a service
 */
router.delete('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id'] || '')

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      })
      return
    }

    // Check if service is used by any magazins
    const magazinsUsingService = await Magazin.countDocuments({
      services: id
    })

    if (magazinsUsingService > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete service used by ${magazinsUsingService} magazin(s)`
      })
      return
    }

    // Check if service has any appointments
    const { Appointment } = require('../models')
    const appointmentsUsingService = await Appointment.countDocuments({
      serviceId: id
    })

    if (appointmentsUsingService > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete service with ${appointmentsUsingService} appointment(s)`
      })
      return
    }

    // Delete service
    const service = await Service.findByIdAndDelete(id)

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
      data: service
    })

  } catch (error) {
    console.error('Delete service error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router
