import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';
import { DayOfWeek } from '@prisma/client';

interface CreateScheduleInput {
  masterId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isActive?: boolean;
}

interface UpdateScheduleInput {
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  breakStart?: string;
  breakEnd?: string;
  isActive?: boolean;
}

// Helper function to convert time string to minutes since midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export const scheduleService = {
  async createSchedule(data: CreateScheduleInput) {
    // Verify master exists
    const master = await prisma.master.findUnique({
      where: { id: data.masterId },
    });

    if (!master) {
      throw AppError.notFound('Master not found');
    }

    // Validate time range (support overnight shifts like 23:00 - 02:00)
    const startMinutes = timeToMinutes(data.startTime);
    const endMinutes = timeToMinutes(data.endTime);
    
    // For same-day shifts: start must be before end
    // For overnight shifts: start can be after end (e.g., 23:00 - 02:00)
    // But they can't be equal
    if (startMinutes === endMinutes) {
      throw AppError.badRequest('Start time and end time cannot be the same');
    }

    // Validate break times if provided
    if (data.breakStart && data.breakEnd) {
      const breakStartMinutes = timeToMinutes(data.breakStart);
      const breakEndMinutes = timeToMinutes(data.breakEnd);
      
      if (breakStartMinutes === breakEndMinutes) {
        throw AppError.badRequest('Break start and end time cannot be the same');
      }
      
      // For overnight shifts, break time validation is more complex
      // For simplicity, we'll allow any break time that's not equal
      // Advanced validation can be added if needed
    }

    // Check for overlapping schedule on the same day
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        masterId: data.masterId,
        dayOfWeek: data.dayOfWeek,
        isActive: true,
      },
    });

    if (existingSchedule) {
      throw AppError.conflict(
        `Schedule for ${data.dayOfWeek} already exists. Only one schedule per day is allowed.`
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        masterId: data.masterId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        breakStart: data.breakStart,
        breakEnd: data.breakEnd,
        isActive: data.isActive ?? true,
      },
    });

    return schedule;
  },

  async updateSchedule(scheduleId: string, data: UpdateScheduleInput) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw AppError.notFound('Schedule not found');
    }

    // Validate time range if provided (support overnight shifts)
    const startTime = data.startTime || schedule.startTime;
    const endTime = data.endTime || schedule.endTime;
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes === endMinutes) {
      throw AppError.badRequest('Start time and end time cannot be the same');
    }

    // Validate break times if provided
    const breakStart = data.breakStart ?? schedule.breakStart;
    const breakEnd = data.breakEnd ?? schedule.breakEnd;

    if (breakStart && breakEnd) {
      const breakStartMinutes = timeToMinutes(breakStart);
      const breakEndMinutes = timeToMinutes(breakEnd);
      
      if (breakStartMinutes === breakEndMinutes) {
        throw AppError.badRequest('Break start and end time cannot be the same');
      }
    }

    const updated = await prisma.schedule.update({
      where: { id: scheduleId },
      data,
    });

    return updated;
  },

  async deleteSchedule(scheduleId: string) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw AppError.notFound('Schedule not found');
    }

    await prisma.schedule.delete({
      where: { id: scheduleId },
    });
  },

  async getScheduleByMaster(masterId: string) {
    const schedules = await prisma.schedule.findMany({
      where: { masterId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return schedules;
  },

  async getScheduleById(scheduleId: string) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw AppError.notFound('Schedule not found');
    }

    return schedule;
  },

  async toggleSchedule(scheduleId: string) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw AppError.notFound('Schedule not found');
    }

    const updated = await prisma.schedule.update({
      where: { id: scheduleId },
      data: { isActive: !schedule.isActive },
    });

    return updated;
  },

  async getAvailableSlots(
    masterId: string,
    date: Date,
    serviceDuration: number
  ) {
    console.log('[ScheduleService] getAvailableSlots:', { masterId, date, serviceDuration });

    const dayOfWeekString = date.toLocaleDateString('en-US', {
      weekday: 'long',
    }).toUpperCase() as DayOfWeek;

    console.log('[ScheduleService] Day of week:', dayOfWeekString);

    // Get schedule for this day
    const schedule = await prisma.schedule.findFirst({
      where: {
        masterId,
        dayOfWeek: dayOfWeekString,
        isActive: true,
      },
    });

    console.log('[ScheduleService] Schedule:', schedule);

    if (!schedule) {
      return []; // No working hours on this day
    }

    // Check if this is an overnight shift (e.g., 23:00 - 02:00)
    const startMinutes = timeToMinutes(schedule.startTime);
    const endMinutes = timeToMinutes(schedule.endTime);
    const isOvernight = startMinutes > endMinutes;

    // Get existing appointments
    // For overnight shifts, we need to check appointments from both days
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // For overnight shifts, also check the next day
    const endOfNextDay = new Date(startOfDay);
    endOfNextDay.setDate(endOfNextDay.getDate() + 1);
    endOfNextDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        masterId,
        dateTime: {
          gte: startOfDay,
          lte: isOvernight ? endOfNextDay : endOfDay,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      include: {
        service: {
          select: {
            duration: true,
          },
        },
      },
      orderBy: { dateTime: 'asc' },
    });

    // Generate available slots
    const slots: string[] = [];
    const [workStartHour, workStartMin] = schedule.startTime.split(':').map(Number);
    const [workEndHour, workEndMin] = schedule.endTime.split(':').map(Number);

    let currentTime = new Date(date);
    currentTime.setHours(workStartHour, workStartMin, 0, 0);

    // For overnight shifts, set end time to next day
    let workEndTime = new Date(date);
    workEndTime.setHours(workEndHour, workEndMin, 0, 0);
    
    if (isOvernight) {
      workEndTime.setDate(workEndTime.getDate() + 1);
    }

    console.log('[ScheduleService] Work hours:', {
      start: currentTime.toISOString(),
      end: workEndTime.toISOString(),
      isOvernight,
    });

    // Handle break time
    let breakStart: Date | null = null;
    let breakEnd: Date | null = null;

    if (schedule.breakStart && schedule.breakEnd) {
      const [breakStartHour, breakStartMin] = schedule.breakStart.split(':').map(Number);
      const [breakEndHour, breakEndMin] = schedule.breakEnd.split(':').map(Number);

      breakStart = new Date(date);
      breakStart.setHours(breakStartHour, breakStartMin, 0, 0);

      breakEnd = new Date(date);
      breakEnd.setHours(breakEndHour, breakEndMin, 0, 0);
      
      // For overnight shifts, adjust break times if they're after midnight
      const breakStartMinutesVal = breakStartHour * 60 + breakStartMin;
      if (isOvernight && breakStartMinutesVal < startMinutes) {
        breakStart.setDate(breakStart.getDate() + 1);
        breakEnd.setDate(breakEnd.getDate() + 1);
      }
    }

    while (currentTime < workEndTime) {
      const slotEnd = new Date(currentTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration);

      // Check if slot fits within working hours
      if (slotEnd > workEndTime) {
        break;
      }

      // Check if slot overlaps with break
      if (breakStart && breakEnd) {
        if (currentTime < breakEnd && slotEnd > breakStart) {
          // Move to after break
          currentTime = new Date(breakEnd);
          continue;
        }
      }

      // Check if slot overlaps with existing appointments
      const hasConflict = appointments.some((apt) => {
        const aptStart = new Date(apt.dateTime);
        const aptEnd = new Date(aptStart.getTime() + apt.service.duration * 60000);

        return (
          (currentTime >= aptStart && currentTime < aptEnd) ||
          (slotEnd > aptStart && slotEnd <= aptEnd) ||
          (currentTime <= aptStart && slotEnd >= aptEnd)
        );
      });

      if (!hasConflict) {
        // Return time in HH:MM format
        const hours = currentTime.getHours().toString().padStart(2, '0');
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
        slots.push(`${hours}:${minutes}`);
      }

      // Move to next 15-minute slot
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    return slots;
  },
};
