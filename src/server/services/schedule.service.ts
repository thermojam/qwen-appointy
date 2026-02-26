import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';

interface CreateScheduleInput {
  masterId: string;
  date: Date;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

interface UpdateScheduleInput {
  startTime?: string;
  endTime?: string;
  breakStart?: string | null;
  breakEnd?: string | null;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export const scheduleService = {
  async createSchedule(data: CreateScheduleInput) {
    const master = await prisma.master.findUnique({ where: { id: data.masterId } });
    if (!master) throw AppError.notFound('Master not found');

    const startMinutes = timeToMinutes(data.startTime);
    const endMinutes = timeToMinutes(data.endTime);
    if (startMinutes === endMinutes) {
      throw AppError.badRequest('Start time and end time cannot be the same');
    }

    if (data.breakStart && data.breakEnd) {
      if (timeToMinutes(data.breakStart) === timeToMinutes(data.breakEnd)) {
        throw AppError.badRequest('Break start and end time cannot be the same');
      }
    }

    try {
      const schedule = await prisma.schedule.create({
        data: {
          masterId: data.masterId,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          breakStart: data.breakStart || null,
          breakEnd: data.breakEnd || null,
        },
      });
      return schedule;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw AppError.conflict('Schedule for this date already exists');
      }
      throw error;
    }
  },

  async updateSchedule(scheduleId: string, data: UpdateScheduleInput) {
    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) throw AppError.notFound('Schedule not found');

    const startTime = data.startTime || schedule.startTime;
    const endTime = data.endTime || schedule.endTime;

    if (timeToMinutes(startTime) === timeToMinutes(endTime)) {
      throw AppError.badRequest('Start time and end time cannot be the same');
    }

    const updated = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime && { endTime: data.endTime }),
        ...('breakStart' in data && { breakStart: data.breakStart }),
        ...('breakEnd' in data && { breakEnd: data.breakEnd }),
      },
    });
    return updated;
  },

  async deleteSchedule(scheduleId: string) {
    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) throw AppError.notFound('Schedule not found');
    await prisma.schedule.delete({ where: { id: scheduleId } });
  },

  async getScheduleByMaster(masterId: string) {
    return prisma.schedule.findMany({
      where: { masterId },
      orderBy: { date: 'asc' },
    });
  },

  async getScheduleById(scheduleId: string) {
    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) throw AppError.notFound('Schedule not found');
    return schedule;
  },

  async getAvailableSlots(masterId: string, date: Date, serviceDuration: number) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const schedule = await prisma.schedule.findFirst({
      where: {
        masterId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (!schedule) return [];

    const startMinutes = timeToMinutes(schedule.startTime);
    const endMinutes = timeToMinutes(schedule.endTime);
    const isOvernight = startMinutes > endMinutes;

    const startOfQueryDay = new Date(date);
    startOfQueryDay.setUTCHours(0, 0, 0, 0);
    const endOfQueryDay = new Date(date);
    endOfQueryDay.setUTCHours(23, 59, 59, 999);
    const endOfNextDay = new Date(startOfQueryDay);
    endOfNextDay.setUTCDate(endOfNextDay.getUTCDate() + 1);
    endOfNextDay.setUTCHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        masterId,
        dateTime: { gte: startOfQueryDay, lte: isOvernight ? endOfNextDay : endOfQueryDay },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      include: { service: { select: { duration: true } } },
      orderBy: { dateTime: 'asc' },
    });

    const slots: string[] = [];
    const [workStartHour, workStartMin] = schedule.startTime.split(':').map(Number);
    const [workEndHour, workEndMin] = schedule.endTime.split(':').map(Number);

    let currentTime = new Date(date);
    currentTime.setHours(workStartHour, workStartMin, 0, 0);

    let workEndTime = new Date(date);
    workEndTime.setHours(workEndHour, workEndMin, 0, 0);
    if (isOvernight) workEndTime.setDate(workEndTime.getDate() + 1);

    let breakStart: Date | null = null;
    let breakEnd: Date | null = null;
    if (schedule.breakStart && schedule.breakEnd) {
      const [bsh, bsm] = schedule.breakStart.split(':').map(Number);
      const [beh, bem] = schedule.breakEnd.split(':').map(Number);
      breakStart = new Date(date);
      breakStart.setHours(bsh, bsm, 0, 0);
      breakEnd = new Date(date);
      breakEnd.setHours(beh, bem, 0, 0);
      if (isOvernight && bsh * 60 + bsm < startMinutes) {
        breakStart.setDate(breakStart.getDate() + 1);
        breakEnd.setDate(breakEnd.getDate() + 1);
      }
    }

    while (currentTime < workEndTime) {
      const slotEnd = new Date(currentTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration);
      if (slotEnd > workEndTime) break;

      if (breakStart && breakEnd && currentTime < breakEnd && slotEnd > breakStart) {
        currentTime = new Date(breakEnd);
        continue;
      }

      const hasConflict = appointments.some((apt) => {
        const aptStart = new Date(apt.dateTime);
        const aptEnd = new Date(aptStart.getTime() + apt.service.duration * 60000);
        return (currentTime >= aptStart && currentTime < aptEnd) ||
               (slotEnd > aptStart && slotEnd <= aptEnd) ||
               (currentTime <= aptStart && slotEnd >= aptEnd);
      });

      if (!hasConflict) {
        const hours = currentTime.getHours().toString().padStart(2, '0');
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
        slots.push(`${hours}:${minutes}`);
      }

      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    return slots;
  },
};
