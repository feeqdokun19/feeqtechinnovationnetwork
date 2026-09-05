import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(
    customerId: string,
    serviceId: string,
    notes?: string,
  ) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (service.status !== 'ACTIVE') {
      throw new BadRequestException(
        'This service is currently unavailable',
      );
    }

    const order = await this.prisma.order.create({
      data: {
        customerId,
        serviceId,
        amount: service.price,
        notes,
        transaction: {
          create: {
            amount: service.price,
            customerId,
            serviceId,
            status: 'PENDING',
          },
        },
      },
      include: {
        service: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        transaction: true,
      },
    });

    return order;
  }

  async getCustomerOrders(customerId: string) {
    return this.prisma.order.findMany({
      where: {
        customerId,
      },
      include: {
        service: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        transaction: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getProviderOrders(providerId: string) {
    return this.prisma.order.findMany({
      where: {
        service: {
          providerId,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: true,
        transaction: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        transaction: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isCustomer = order.customerId === userId;
    const isProvider = order.service.providerId === userId;

    if (!isCustomer && !isProvider) {
      throw new ForbiddenException(
        'You are not authorized to view this order',
      );
    }

    return order;
  }

  async updateStatus(
    orderId: string,
    providerId: string,
    newStatus: 'IN_PROGRESS' | 'COMPLETED',
  ) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        service: true,
        transaction: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.service.providerId !== providerId) {
      throw new ForbiddenException(
        'Only the service provider can update this order',
      );
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException(
        'A cancelled order cannot be updated',
      );
    }

    if (order.status === 'PENDING') {
      throw new BadRequestException(
        'Order must be paid before the provider can start the service',
      );
    }

    if (
      newStatus === 'IN_PROGRESS' &&
      order.status !== 'PAID'
    ) {
      throw new BadRequestException(
        'Only a PAID order can be moved to IN_PROGRESS',
      );
    }

    if (
      newStatus === 'COMPLETED' &&
      order.status !== 'IN_PROGRESS'
    ) {
      throw new BadRequestException(
        'Only an IN_PROGRESS order can be completed',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: newStatus,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        transaction: true,
      },
    });

    return {
      message: `Order status updated to ${newStatus}`,
      order: updatedOrder,
    };
  }
}