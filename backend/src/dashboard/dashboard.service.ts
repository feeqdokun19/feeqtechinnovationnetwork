import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomerDashboard(customerId: string) {
    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      completedOrders,
      cancelledOrders,
      spending,
      recentOrders,
      recentTransactions,
    ] = await Promise.all([
      this.prisma.order.count({
        where: { customerId },
      }),

      this.prisma.order.count({
        where: {
          customerId,
          status: 'PENDING',
        },
      }),

      this.prisma.order.count({
        where: {
          customerId,
          status: 'PAID',
        },
      }),

      this.prisma.order.count({
        where: {
          customerId,
          status: 'COMPLETED',
        },
      }),

      this.prisma.order.count({
        where: {
          customerId,
          status: 'CANCELLED',
        },
      }),

      this.prisma.transaction.aggregate({
        where: {
          customerId,
          status: 'SUCCESS',
        },
        _sum: {
          amount: true,
        },
      }),

      this.prisma.order.findMany({
        where: {
          customerId,
        },
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          service: {
            select: {
              id: true,
              title: true,
              category: true,
              price: true,
              provider: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          transaction: true,
        },
      }),

      this.prisma.transaction.findMany({
        where: {
          customerId,
        },
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          service: {
            select: {
              id: true,
              title: true,
            },
          },
          order: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      }),
    ]);

    return {
      summary: {
        totalOrders,
        pendingOrders,
        paidOrders,
        completedOrders,
        cancelledOrders,
        totalSpent: spending._sum.amount ?? 0,
      },
      recentOrders,
      recentTransactions,
    };
  }

  async getProviderDashboard(providerId: string) {
    const [
      totalServices,
      activeServices,
      inactiveServices,
      totalOrders,
      pendingOrders,
      paidOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
      revenue,
      recentOrders,
      recentTransactions,
    ] = await Promise.all([
      this.prisma.service.count({
        where: { providerId },
      }),

      this.prisma.service.count({
        where: {
          providerId,
          status: 'ACTIVE',
        },
      }),

      this.prisma.service.count({
        where: {
          providerId,
          status: 'INACTIVE',
        },
      }),

      this.prisma.order.count({
        where: {
          service: {
            providerId,
          },
        },
      }),

      this.prisma.order.count({
        where: {
          service: {
            providerId,
          },
          status: 'PENDING',
        },
      }),

      this.prisma.order.count({
        where: {
          service: {
            providerId,
          },
          status: 'PAID',
        },
      }),

      this.prisma.order.count({
        where: {
          service: {
            providerId,
          },
          status: 'IN_PROGRESS',
        },
      }),

      this.prisma.order.count({
        where: {
          service: {
            providerId,
          },
          status: 'COMPLETED',
        },
      }),

      this.prisma.order.count({
        where: {
          service: {
            providerId,
          },
          status: 'CANCELLED',
        },
      }),

      this.prisma.transaction.aggregate({
        where: {
          service: {
            providerId,
          },
          status: 'SUCCESS',
        },
        _sum: {
          amount: true,
        },
      }),

      this.prisma.order.findMany({
        where: {
          service: {
            providerId,
          },
        },
        take: 5,
        orderBy: {
          createdAt: 'desc',
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
            select: {
              id: true,
              title: true,
              category: true,
              price: true,
            },
          },
          transaction: true,
        },
      }),

      this.prisma.transaction.findMany({
        where: {
          service: {
            providerId,
          },
        },
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
            },
          },
          order: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      }),
    ]);

    return {
      summary: {
        totalServices,
        activeServices,
        inactiveServices,
        totalOrders,
        pendingOrders,
        paidOrders,
        inProgressOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: revenue._sum.amount ?? 0,
      },
      recentOrders,
      recentTransactions,
    };
  }
}
