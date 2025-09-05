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

    // Create PDF document with smaller margins for more content
    const doc = new PDFDocument({ 
      margin: 30,
      size: 'A4',
      info: {
        Title: `Daily Report - ${magazin.name}`,
        Author: 'CarTech Morocco',
        Subject: `Appointments for ${date}`,
        Keywords: 'appointments, report, technical center'
      }
    })
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="daily-report-${magazin.name.replace(/[^a-zA-Z0-9]/g, '-')}-${date}.pdf"`)
    
    // Pipe PDF to response
    doc.pipe(res)

    // Add professional header with company branding
    doc.fontSize(18).font('Helvetica-Bold').text('CAR TECHNICAL INSPECTION', { align: 'center' })
    doc.fontSize(14).font('Helvetica').text('Daily Appointment Report', { align: 'center' })
    doc.moveDown(0.5)
    
    // Add center info in a box
    const headerBoxTop = doc.y
    doc.rect(50, headerBoxTop, 500, 60).stroke('#2563eb')
    doc.fontSize(12).font('Helvetica-Bold').text('TECHNICAL CENTER:', 60, headerBoxTop + 10)
    doc.fontSize(11).font('Helvetica').text(magazin.name, 60, headerBoxTop + 25)
    doc.fontSize(10).font('Helvetica').text(`${magazin.city} • ${magazin.address}`, 60, headerBoxTop + 40)
    doc.fontSize(10).font('Helvetica-Bold').text(`REPORT DATE: ${new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 60, headerBoxTop + 50)
    doc.y = headerBoxTop + 80

    // Add summary in a professional format
    doc.fontSize(12).font('Helvetica-Bold').text('SUMMARY', { underline: true })
    doc.moveDown(0.3)
    
    const summaryBoxTop = doc.y
    doc.rect(50, summaryBoxTop, 500, 50).fill('#f8fafc').stroke('#e2e8f0')
    
    // Ensure text color is black for visibility
    doc.fillColor('black')
    
    doc.fontSize(10).font('Helvetica-Bold').text('Total Appointments:', 60, summaryBoxTop + 10)
    doc.fontSize(10).font('Helvetica').text(appointments.length.toString(), 200, summaryBoxTop + 10)
    
    doc.fontSize(10).font('Helvetica-Bold').text('Total Revenue:', 60, summaryBoxTop + 25)
    const totalRevenue = appointments.length * 20
    doc.fontSize(10).font('Helvetica').text(`${totalRevenue} DH`, 200, summaryBoxTop + 25)
    
    doc.fontSize(10).font('Helvetica-Bold').text('Generated:', 60, summaryBoxTop + 40)
    doc.fontSize(10).font('Helvetica').text(new Date().toLocaleString('en-US'), 200, summaryBoxTop + 40)
    doc.y = summaryBoxTop + 70

    if (appointments.length === 0) {
      // Add message for no appointments
      doc.fontSize(12).font('Helvetica').text('No appointments found for this date.', { align: 'center' })
      doc.moveDown()
    } else {
      // Add appointments table with professional styling
      doc.fontSize(12).font('Helvetica-Bold').text('APPOINTMENT DETAILS', { underline: true })
      doc.moveDown(0.5)

      // Table configuration
      const tableTop = doc.y
      const tableLeft = 50
      const colWidths = [70, 90, 90, 80, 100, 100]
      const headers = ['Time', 'Client Name', 'Phone', 'Car Plate', 'Service', 'Notes']
      const rowHeight = 20
      
      // Draw table header with background
      doc.rect(tableLeft, tableTop, colWidths.reduce((a, b) => a + b, 0), rowHeight)
        .fill('#1e40af').stroke('#1e3a8a')
      
      // Ensure header text is white and visible
      doc.fontSize(8).font('Helvetica-Bold').fillColor('white')
      headers.forEach((header, i) => {
        const x = tableLeft + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5
        const y = tableTop + 6
        doc.text(header, x, y)
      })
      
      // Reset to black text for data rows
      doc.fillColor('black')

      // Draw appointments with alternating row colors
      appointments.forEach((appointment: any, index: number) => {
        const rowY = tableTop + (index + 1) * rowHeight
        const isEven = index % 2 === 0
        
        // Alternate row background
        if (isEven) {
          doc.rect(tableLeft, rowY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
            .fill('#f8fafc').stroke('#e2e8f0')
        } else {
          doc.rect(tableLeft, rowY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
            .fill('#ffffff').stroke('#e2e8f0')
        }
        
        const rowData = [
          new Date(appointment.start).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          (appointment.customer?.name || 'N/A').substring(0, 15), // Truncate long names
          (appointment.customer?.phone || 'N/A').substring(0, 12),
          (appointment.customer?.carPlate || 'N/A').substring(0, 10),
          (appointment.serviceId?.name || 'N/A').substring(0, 18),
          (appointment.customer?.notes || '-').substring(0, 20)
        ]
        
        // Ensure data text is black and visible
        doc.fontSize(7).font('Helvetica').fillColor('black')
        rowData.forEach((cell, i) => {
          const x = tableLeft + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5
          const y = rowY + 6
          doc.text(cell, x, y)
        })
      })
      
      // Draw final table border
      const totalHeight = (appointments.length + 1) * rowHeight
      doc.rect(tableLeft, tableTop, colWidths.reduce((a, b) => a + b, 0), totalHeight)
        .stroke('#1e3a8a')
      
      doc.y = tableTop + totalHeight + 20
    }

    // Add footer with proper text color
    doc.fontSize(8).font('Helvetica').fillColor('#6b7280')
      .text('Generated by CarTech Morocco Appointment System', 50, doc.page.height - 50, { align: 'center' })
      .text(`Page 1 of 1 • Generated on ${new Date().toLocaleString('en-US')}`, 50, doc.page.height - 40, { align: 'center' })
    
    // Reset text color to black for any remaining content
    doc.fillColor('black')

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



export default router
