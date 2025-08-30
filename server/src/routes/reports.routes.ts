import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Appointment, Magazin } from '../models'
import { requireAdmin } from '../middleware/auth'
import PDFDocument from 'pdfkit'

const router = Router()

// Query parameter validation
const dailyReportSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
})

/**
 * GET /api/reports/daily (ADMIN ONLY)
 * Get daily report with confirmed appointments per magazin
 */
router.get('/daily', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const { date } = dailyReportSchema.parse(req.query)

    // Parse date range
    const startOfDay = new Date(date + 'T00:00:00.000Z')
    const endOfDay = new Date(date + 'T23:59:59.999Z')

    // Get all magazins
    const magazins = await Magazin.find({ active: true })
      .populate('services', 'name durationMinutes')
      .sort({ name: 1 })
      .lean()

    // Get confirmed appointments for the date
    const appointments = await Appointment.find({
      start: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed'
    })
    .populate('magazinId', 'name city address')
    .populate('serviceId', 'name durationMinutes')
    .sort({ start: 1 })
    .lean()

    // Group appointments by magazin
    const appointmentsByMagazin = appointments.reduce((acc: any, appointment: any) => {
      const magazinId = appointment.magazinId._id.toString()
      if (!acc[magazinId]) {
        acc[magazinId] = []
      }
      acc[magazinId].push(appointment)
      return acc
    }, {})

    // Build report data
    const reportData = magazins.map((magazin: any) => {
      const magazinId = magazin._id.toString()
      const magazinAppointments = appointmentsByMagazin[magazinId] || []
      
      return {
        magazin: {
          id: magazin._id,
          name: magazin.name,
          city: magazin.city,
          address: magazin.address
        },
        appointments: magazinAppointments.map((appointment: any) => ({
          id: appointment._id,
          reference: appointment.reference,
          customer: appointment.customer,
          service: {
            name: appointment.serviceId?.name || 'N/A',
            durationMinutes: appointment.serviceId?.durationMinutes || 0
          },
          start: appointment.start,
          end: appointment.end,
          status: appointment.status,
          createdAt: appointment.createdAt
        })),
        totalAppointments: magazinAppointments.length,
        totalDuration: magazinAppointments.reduce((sum: number, app: any) => 
          sum + (app.serviceId?.durationMinutes || 0), 0
        )
      }
    })

    // Calculate summary
    const totalAppointments = appointments.length
    const totalDuration = appointments.reduce((sum: number, app: any) => 
      sum + (app.serviceId?.durationMinutes || 0), 0
    )

    res.status(200).json({
      success: true,
      data: {
        date: date,
        summary: {
          totalMagazins: magazins.length,
          totalAppointments,
          totalDuration
        },
        magazins: reportData
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

    console.error('Daily report error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * GET /api/reports/daily/:magazinId.pdf (ADMIN ONLY)
 * Get PDF export for a specific magazin on a specific date
 */
router.get('/daily/:magazinId.pdf', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const magazinId = String(req.params['magazinId'] || '')
    const { date } = dailyReportSchema.parse(req.query)

    // Validate ObjectId format
    if (!magazinId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid magazin ID format'
      })
      return
    }

    // Parse date range
    const startOfDay = new Date(date + 'T00:00:00.000Z')
    const endOfDay = new Date(date + 'T23:59:59.999Z')

    // Get magazin
    const magazin = await Magazin.findById(magazinId).lean()
    if (!magazin) {
      res.status(404).json({
        success: false,
        message: 'Magazin not found'
      })
      return
    }

    // Get confirmed appointments for the date and magazin
    const appointments = await Appointment.find({
      magazinId,
      start: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed'
    })
    .populate('serviceId', 'name durationMinutes')
    .sort({ start: 1 })
    .lean()

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 })
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="daily-report-${magazin.name}-${date}.pdf"`)
    
    // Pipe PDF to response
    doc.pipe(res)

    // Add header
    doc.fontSize(20).text('Daily Appointment Report', { align: 'center' })
    doc.moveDown()
    doc.fontSize(14).text(`Technical Center: ${magazin.name}`, { align: 'center' })
    doc.fontSize(12).text(`City: ${magazin.city}`, { align: 'center' })
    doc.fontSize(12).text(`Date: ${new Date(date).toLocaleDateString('en-US')}`, { align: 'center' })
    doc.moveDown(2)

    // Add summary
    doc.fontSize(16).text('Summary', { underline: true })
    doc.fontSize(12).text(`Total Appointments: ${appointments.length}`)
    doc.moveDown()

    if (appointments.length === 0) {
      // Add message for no appointments
      doc.fontSize(14).text('No appointments found for this date.', { align: 'center' })
      doc.moveDown()
    } else {
      // Add appointments table
      doc.fontSize(16).text('Appointments', { underline: true })
      doc.moveDown()

      // Table headers
      const tableTop = doc.y
      const tableLeft = 50
      const colWidths = [80, 80, 100, 80, 80, 100]
      const headers = ['Time', 'Client', 'Phone', 'Car Plate', 'Service', 'Notes']
      
      // Draw headers
      doc.fontSize(10).font('Helvetica-Bold')
      headers.forEach((header, i) => {
        doc.text(header, tableLeft + colWidths.slice(0, i).reduce((a, b) => a + b, 0), tableTop)
      })
      doc.moveDown()

      // Draw appointments
      doc.fontSize(10).font('Helvetica')
      appointments.forEach((appointment: any) => {
        const rowData = [
          new Date(appointment.start).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          appointment.customer?.name || 'N/A',
          appointment.customer?.phone || 'N/A',
          appointment.customer?.carPlate || 'N/A',
          appointment.serviceId?.name || 'N/A',
          appointment.customer?.notes || '-'
        ]
        
        rowData.forEach((cell, i) => {
          const x = tableLeft + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
          const y = doc.y
          doc.text(cell, x, y)
        })
        doc.moveDown()
      })
    }

    // Finalize PDF
    doc.end()

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

    console.error('PDF export error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * GET /api/reports/daily/all.pdf (ADMIN ONLY)
 * Get PDF export for all magazins on a specific date
 */
router.get('/daily/all.pdf', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = dailyReportSchema.parse(req.query)

    // Parse date range
    const startOfDay = new Date(date + 'T00:00:00.000Z')
    const endOfDay = new Date(date + 'T23:59:59.999Z')

    // Get all confirmed appointments for the date
    const appointments = await Appointment.find({
      start: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed'
    })
    .populate('magazinId', 'name city address')
    .populate('serviceId', 'name durationMinutes')
    .sort({ start: 1 })
    .lean()

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 })
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="all-appointments-${date}.pdf"`)
    
    // Pipe PDF to response
    doc.pipe(res)

    // Add header
    doc.fontSize(20).text('Daily Appointment Report - All Centers', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text(`Date: ${new Date(date).toLocaleDateString('en-US')}`, { align: 'center' })
    doc.moveDown(2)

    // Add summary
    doc.fontSize(16).text('Summary', { underline: true })
    doc.fontSize(12).text(`Total Appointments: ${appointments.length}`)
    doc.moveDown()

    if (appointments.length === 0) {
      // Add message for no appointments
      doc.fontSize(14).text('No appointments found for this date.', { align: 'center' })
      doc.moveDown()
    } else {
      // Group appointments by magazin
      const appointmentsByMagazin = appointments.reduce((acc: any, appointment: any) => {
        const magazinId = appointment.magazinId._id.toString()
        if (!acc[magazinId]) {
          acc[magazinId] = {
            name: appointment.magazinId.name,
            city: appointment.magazinId.city,
            appointments: []
          }
        }
        acc[magazinId].appointments.push(appointment)
        return acc
      }, {})

      // Add appointments by magazin
      Object.values(appointmentsByMagazin).forEach((magazinData: any) => {
        doc.fontSize(14).text(`${magazinData.name} - ${magazinData.city}`, { underline: true })
        doc.fontSize(12).text(`Appointments: ${magazinData.appointments.length}`)
        doc.moveDown()

        // Table headers
        const tableTop = doc.y
        const tableLeft = 50
        const colWidths = [80, 80, 100, 80, 80, 100]
        const headers = ['Time', 'Client', 'Phone', 'Car Plate', 'Service', 'Notes']
        
        // Draw headers
        doc.fontSize(10).font('Helvetica-Bold')
        headers.forEach((header, i) => {
          doc.text(header, tableLeft + colWidths.slice(0, i).reduce((a, b) => a + b, 0), tableTop)
        })
        doc.moveDown()

        // Draw appointments
        doc.fontSize(10).font('Helvetica')
        magazinData.appointments.forEach((appointment: any) => {
          const rowData = [
            new Date(appointment.start).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            appointment.customer?.name || 'N/A',
            appointment.customer?.phone || 'N/A',
            appointment.customer?.carPlate || 'N/A',
            appointment.serviceId?.name || 'N/A',
            appointment.customer?.notes || '-'
          ]
          
          rowData.forEach((cell, i) => {
            const x = tableLeft + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
            const y = doc.y
            doc.text(cell, x, y)
          })
          doc.moveDown()
        })
        
        doc.moveDown(2)
      })
    }

    // Finalize PDF
    doc.end()

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

    console.error('All PDF export error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router
