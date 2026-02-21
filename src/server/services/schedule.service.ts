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

export const scheduleService = {
  async createSchedule(data: CreateScheduleInput) {
    // Verify master exists
    const master = await prisma.master.findUnique({
      where: { id: data.masterId },
    });

    if (!master) {
      throw AppError.notFound('Master not found');
    }

    // Validate time range
    if (data.startTime >= data.endTime) {
      throw AppError.badRequest('Start time must be before end time');
    }

    // Validate break times if provided
    if (data.breakStart && data.breakEnd) {
      if (data.breakStart >= data.breakEnd) {
        throw AppError.badRequest('Break start must be before break end');
      }
      if (data.breakStart < data.startTime || data.breakEnd > data.endTime) {
        throw AppError.badRequest('Break time must be within working hours');
      }
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

    // Validate time range if provided
    const startTime = data.startTime || schedule.startTime;
    const endTime = data.endTime || schedule.endTime;

    if (startTime >= endTime) {
      throw AppError.badRequest('Start time must be before end time');
    }

    // Validate break times if provided
    const breakStart = data.breakStart ?? schedule.breakStart;
    const breakEnd = data.breakEnd ?? schedule.breakEnd;

    if (breakStart && breakEnd) {
      if (breakStart >= breakEnd) {
        throw AppError.badRequest('Break start must be before break end');
      }
      if (breakStart < startTime || breakEnd > endTime) {
        throw AppError.badRequest('Break time must be within working hours');
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
    const dayOfWeekString = date.toLocaleDateString('en-US', {
      weekday: 'long',
    }).toUpperCase() as DayOfWeek;

    // Get schedule for this day
    const schedule = await prisma.schedule.findFirst({
      where: {
        masterId,
        dayOfWeek: dayOfWeekString,
        isActive: true,
      },
    });

    if (!schedule) {
      return []; // No working hours on this day
    }

    // Get existing appointments for this day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        masterId,
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
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

    const workEndTime = new Date(date);
    workEndTime.setHours(workEndHour, workEndMin, 0, 0);

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
        slots.push(currentTime.toISOString());
      }

      // Move to next 15-minute slot
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    return slots;
  },
};
