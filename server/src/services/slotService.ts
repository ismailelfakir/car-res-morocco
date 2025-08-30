import { Slot, ISlot } from '../models/Slot'
// Removed unused import

export interface WorkingHour {
  start: string
  end: string
}

export interface SlotGenerationConfig {
  magazinId: string
  date: string
  workingHours: WorkingHour[]
  slotDurationMinutes: number
  capacityPerSlot: number
}

export interface GeneratedSlot {
  startTime: string
  endTime: string
  startISO: Date
  endISO: Date
}

/**
 * Generate time slots for a specific date based on working hours
 */
export function generateTimeSlots(
  workingHours: WorkingHour[],
  slotDurationMinutes: number,
  date: string
): GeneratedSlot[] {
  const slots: GeneratedSlot[] = []
  
  workingHours.forEach(period => {
    const startMinutes = timeToMinutes(period.start)
    const endMinutes = timeToMinutes(period.end)
    
    let currentSlotMinutes = startMinutes
    
    while (currentSlotMinutes + slotDurationMinutes <= endMinutes) {
      const slotEndMinutes = currentSlotMinutes + slotDurationMinutes
      
      const startTime = minutesToTime(currentSlotMinutes)
      const endTime = minutesToTime(slotEndMinutes)
      
      // Create proper ISO dates for the slot
      const startISO = new Date(`${date}T${startTime}:00.000`)
      const endISO = new Date(`${date}T${endTime}:00.000`)
      
      slots.push({
        startTime,
        endTime,
        startISO,
        endISO
      })
      
      currentSlotMinutes = slotEndMinutes
    }
  })
  
  return slots
}

/**
 * Convert time string to minutes for easier comparison
 */
function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':')
  const hours = parseInt(parts[0] || '0', 10)
  const minutes = parseInt(parts[1] || '0', 10)
  return hours * 60 + minutes
}

/**
 * Convert minutes back to time string
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Generate and save slots for a specific date
 */
export async function generateAndSaveSlots(config: SlotGenerationConfig): Promise<ISlot[]> {
  const { magazinId, date, workingHours, slotDurationMinutes, capacityPerSlot } = config
  
  // Generate time slots
  const generatedSlots = generateTimeSlots(workingHours, slotDurationMinutes, date)
  
  // Check if slots already exist for this date
  const existingSlots = await Slot.find({ magazinId, date })
  
  if (existingSlots.length > 0) {
    // Update existing slots
    const updatedSlots: ISlot[] = []
    
    for (const generatedSlot of generatedSlots) {
      const existingSlot = existingSlots.find(slot => slot.startTime === generatedSlot.startTime)
      
      if (existingSlot) {
        // Update existing slot
        existingSlot.endTime = generatedSlot.endTime
        existingSlot.endISO = generatedSlot.endISO
        existingSlot.capacity = capacityPerSlot
        await existingSlot.save()
        updatedSlots.push(existingSlot)
      } else {
        // Create new slot
        const newSlot = new Slot({
          magazinId,
          date,
          startTime: generatedSlot.startTime,
          endTime: generatedSlot.endTime,
          startISO: generatedSlot.startISO,
          endISO: generatedSlot.endISO,
          capacity: capacityPerSlot,
          available: true,
          takenCount: 0,
          status: 'available'
        })
        await newSlot.save()
        updatedSlots.push(newSlot)
      }
    }
    
    // Remove slots that are no longer in working hours
    for (const existingSlot of existingSlots) {
      const stillExists = generatedSlots.some(gs => gs.startTime === existingSlot.startTime)
      if (!stillExists) {
        await Slot.findByIdAndDelete(existingSlot._id)
      }
    }
    
    return updatedSlots
  } else {
    // Create all new slots
    const newSlots = generatedSlots.map(generatedSlot => new Slot({
      magazinId,
      date,
      startTime: generatedSlot.startTime,
      endTime: generatedSlot.endTime,
      startISO: generatedSlot.startISO,
      endISO: generatedSlot.endISO,
      capacity: capacityPerSlot,
      available: true,
      takenCount: 0,
      status: 'available'
    }))
    
    const savedSlots = await Slot.insertMany(newSlots)
    return savedSlots
  }
}

/**
 * Get available slots for a specific date and magazin
 */
export async function getAvailableSlots(magazinId: string, date: string): Promise<ISlot[]> {
  return await Slot.find({
    magazinId,
    date,
    available: true,
    status: 'available'
  }).sort({ startTime: 1 })
}

/**
 * Update slot availability when appointment is created
 */
export async function updateSlotAvailability(
  magazinId: string,
  startISO: Date,
  endISO: Date,
  increment: boolean = true
): Promise<void> {
  const slots = await Slot.find({
    magazinId,
    startISO: { $lt: endISO },
    endISO: { $gt: startISO },
    status: 'available'
  })
  
  for (const slot of slots) {
    if (increment) {
      slot.takenCount += 1
      if (slot.takenCount >= slot.capacity) {
        slot.available = false
        slot.status = 'booked'
      }
    } else {
      slot.takenCount = Math.max(0, slot.takenCount - 1)
      if (slot.takenCount < slot.capacity) {
        slot.available = true
        slot.status = 'available'
      }
    }
    await slot.save()
  }
}

/**
 * Generate slots for multiple dates (useful for admin setup)
 */
export async function generateSlotsForDateRange(
  magazinId: string,
  startDate: string,
  endDate: string,
  workingHours: WorkingHour[],
  slotDurationMinutes: number,
  capacityPerSlot: number
): Promise<void> {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0] || ''
    if (dateStr) {
      await generateAndSaveSlots({
        magazinId,
        date: dateStr,
        workingHours,
        slotDurationMinutes,
        capacityPerSlot
      })
    }
  }
}
