
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

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

    await this.notificationsService.createNotification({
      userId: service.providerId,
      orderId: order.id,
      type: 'NEW_ORDER',
      title: 'New order received',
      message: `You have received a new order for "${service.title}".`,
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
        events: {
          orderBy: {
            createdAt: 'asc',
          },
        },
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
        ...(newStatus === 'IN_PROGRESS'
          ? { startedAt: new Date() }
          : {}),
        ...(newStatus === 'COMPLETED'
          ? { completedAt: new Date() }
          : {}),
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

    if (newStatus === 'IN_PROGRESS') {
      await this.notificationsService.createNotification({
        userId: order.customerId,
        orderId: order.id,
        type: 'ORDER_IN_PROGRESS',
        title: 'Your order is now in progress',
        message: `The provider has started working on "${order.service.title}".`,
      });
    }

    await this.prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'SERVICE_STARTED',
        message: `Service started for "${order.service.title}".`,
      },
    });

    if (newStatus === 'COMPLETED') {
      await this.notificationsService.createNotification({
        userId: order.customerId,
        orderId: order.id,
        type: 'ORDER_COMPLETED',
        title: 'Your order has been completed',
        message: `Your order for "${order.service.title}" has been completed.`,
      });
    }
    await this.prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'SERVICE_COMPLETED',
        message: `Service completed for "${order.service.title}".`,
      },
    });

    return {
      message: `Order status updated to ${newStatus}`,
      order: updatedOrder,
    };
  }


async acceptByProvider(
  orderId: string,
  providerId: string,
) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
    include: {
      service: true,
    },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  if (order.service.providerId !== providerId) {
    throw new ForbiddenException(
      'Only the service provider can accept this order',
    );
  }

  if (order.status !== 'PENDING') {
    throw new BadRequestException(
      'Only a pending order can be accepted',
    );
  }

  if (order.providerAccepted) {
    throw new BadRequestException(
      'This order has already been accepted by the provider',
    );
  }

  const updatedOrder = await this.prisma.order.update({
    where: { id: orderId },
    data: {
      providerAccepted: true,
      providerAcceptedAt: new Date(),
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

  await this.notificationsService.createNotification({
    userId: order.customerId,
    orderId: order.id,
    type: 'PROVIDER_ACCEPTED',
    title: 'Provider accepted your request',
    message: `The provider has accepted your request for "${order.service.title}".`,
  });

  await this.prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: 'PROVIDER_ACCEPTED',
      message: `Provider accepted the service request for "${order.service.title}".`,
    },
  });

  return {
    message: 'Order accepted successfully by provider',
    order: updatedOrder,
  };
}

  async declineByProvider(
    orderId: string,
    providerId: string,
    reason?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.service.providerId !== providerId) {
      throw new ForbiddenException(
        'Only the service provider can decline this order',
      );
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        'Only a pending order can be declined',
      );
    }

    if (order.providerAccepted) {
      throw new BadRequestException(
        'This order has already been accepted by the provider',
      );
    }

    if (order.providerDeclinedAt) {
      throw new BadRequestException(
        'This order has already been declined by the provider',
      );
    }

    const declineReason = reason?.trim() || null;

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        providerDeclinedAt: new Date(),
        providerDeclineReason: declineReason,
        status: 'CANCELLED',
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

    await this.notificationsService.createNotification({
      userId: order.customerId,
      orderId: order.id,
      type: 'ORDER_CANCELLED',
      title: 'Request declined by provider',
      message: declineReason
        ? `The provider declined your request for "${order.service.title}". Reason: ${declineReason}`
        : `The provider declined your request for "${order.service.title}".`,
    });

    await this.prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'PROVIDER_DECLINED',
        message: declineReason
          ? `Provider declined the order. Reason: ${declineReason}`
          : 'Provider declined the order.',
      },
    });

    return {
      message: 'Order declined successfully by provider',
      order: updatedOrder,
    };
  }

  async approveByProvider(
    orderId: string,
    providerId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        service: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.service.providerId !== providerId) {
      throw new ForbiddenException(
        'Only the service provider can approve this order',
      );
    }

    if (order.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Only a completed order can be approved',
      );
    }

    if (order.providerApproved) {
      throw new BadRequestException(
        'This order has already been approved by the provider',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        providerApproved: true,
        providerApprovedAt: new Date(),
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

    await this.notificationsService.createNotification({
      userId: order.customerId,
      orderId: order.id,
      type: 'PROVIDER_APPROVED',
      title: 'Provider approved your order',
      message: `The provider has approved your completed order for "${order.service.title}".`,
    });

    await this.prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'PROVIDER_APPROVED',
        message: `Provider approved the completed order for "${order.service.title}".`,
      },
    });

    return {
      message: 'Order approved successfully by provider',
      order: updatedOrder,
    };
  }

  async approveByCustomer(
    orderId: string,
    customerId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        service: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenException(
        'Only the requester can approve this order',
      );
    }

    if (order.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Only a completed order can be approved',
      );
    }

    if (order.customerApproved) {
      throw new BadRequestException(
        'This order has already been approved by the requester',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        customerApproved: true,
        customerApprovedAt: new Date(),
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

    await this.notificationsService.createNotification({
      userId: order.service.providerId,
      orderId: order.id,
      type: 'CUSTOMER_APPROVED',
      title: 'Requester approved your order',
      message: `The requester has approved the completed order for "${order.service.title}".`,
    });

    await this.prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'CUSTOMER_APPROVED',
        message: `Requester approved the completed order for "${order.service.title}".`,
      },
    });

    return {
      message: 'Order approved successfully by requester',
      order: updatedOrder,
    };
  }
}
