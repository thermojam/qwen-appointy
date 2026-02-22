import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';
import { AppointmentStatus } from '@prisma/client';

interface CreateAppointmentInput {
  masterId: string;
  clientId: string;
  serviceId: string;
  dateTime: Date | string;
  comment?: string;
}

interface UpdateAppointmentStatusInput {
  status: AppointmentStatus;
}

interface GetAppointmentsFilters {
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}

export const appointmentService = {
  async createAppointment(data: CreateAppointmentInput) {
    // Verify master exists
    const master = await prisma.master.findUnique({
      where: { id: data.masterId },
    });

    if (!master) {
      throw AppError.notFound('Master not found');
    }

    // Verify service exists and belongs to master
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service || service.masterId !== data.masterId) {
      throw AppError.notFound('Service not found');
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    // Convert dateTime to Date if it's a string
    const dateTime = typeof data.dateTime === 'string' 
      ? new Date(data.dateTime) 
      : data.dateTime;

    // Check for existing appointments at this time (collision detection)
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        masterId: data.masterId,
        dateTime: dateTime,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (existingAppointment) {
      throw AppError.conflict('This time slot is already booked');
    }

    // Determine initial status based on master settings
    const initialStatus = master.bookingConfirmationRequired
      ? AppointmentStatus.PENDING
      : AppointmentStatus.CONFIRMED;

    const appointment = await prisma.appointment.create({
      data: {
        masterId: data.masterId,
        clientId: data.clientId,
        serviceId: data.serviceId,
        dateTime: dateTime,
        status: initialStatus,
        comment: data.comment,
      },
      include: {
        service: true,
        client: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return appointment;
  },

  async updateStatus(appointmentId: string, data: UpdateAppointmentStatusInput) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw AppError.notFound('Appointment not found');
    }

    // Validate status transitions
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
      NO_SHOW: [],
    };

    if (!validTransitions[appointment.status].includes(data.status)) {
      throw AppError.badRequest(
        `Cannot transition from ${appointment.status} to ${data.status}`
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: data.status },
      include: {
        service: true,
        client: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updated;
  },

  async confirmAppointment(appointmentId: string) {
    return this.updateStatus(appointmentId, { status: AppointmentStatus.CONFIRMED });
  },

  async cancelAppointment(appointmentId: string) {
    return this.updateStatus(appointmentId, { status: AppointmentStatus.CANCELLED });
  },

  async completeAppointment(appointmentId: string) {
    return this.updateStatus(appointmentId, { status: AppointmentStatus.COMPLETED });
  },

  async getAppointmentsByMaster(
    masterId: string,
    filters?: GetAppointmentsFilters
  ) {
    const where: Record<string, unknown> = {
      masterId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.dateTime = {} as Record<string, Date>;
      if (filters?.startDate) {
        (where.dateTime as Record<string, Date>).gte = filters.startDate;
      }
      if (filters?.endDate) {
        (where.dateTime as Record<string, Date>).lte = filters.endDate;
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: true,
        client: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { dateTime: 'asc' },
    });

    return appointments;
  },

  async getAppointmentById(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
        client: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
        master: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!appointment) {
      throw AppError.notFound('Appointment not found');
    }

    return appointment;
  },

  async getAppointmentsByClient(clientId: string) {
    const appointments = await prisma.appointment.findMany({
      where: { clientId },
      include: {
        service: true,
        master: {
          select: {
            fullName: true,
            avatarUrl: true,
            rating: true,
          },
        },
      },
      orderBy: { dateTime: 'asc' },
    });

    return appointments;
  },

  async deleteAppointment(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw AppError.notFound('Appointment not found');
    }

    // Only PENDING or CANCELLED appointments can be deleted
    if (!['PENDING', 'CANCELLED'].includes(appointment.status)) {
      throw AppError.badRequest(
        'Only PENDING or CANCELLED appointments can be deleted'
      );
    }

    await prisma.appointment.delete({
      where: { id: appointmentId },
    });
  },
};
