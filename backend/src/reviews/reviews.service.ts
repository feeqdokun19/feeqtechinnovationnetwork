import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerId: string, createReviewDto: CreateReviewDto) {
    const { orderId, rating, comment } = createReviewDto;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenException(
        'Only the requester can review this order',
      );
    }

    if (order.status !== 'COMPLETED') {
      throw new ForbiddenException(
        'You can only review an order after it has been completed',
      );
    }

    if (!order.providerApproved || !order.customerApproved) {
      throw new ForbiddenException(
        'You can only review an order after both the provider and requester have approved it',
      );
    }

    const existingReview = await this.prisma.review.findUnique({
      where: {
        orderId,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this order',
      );
    }

    return this.prisma.review.create({
      data: {
        rating,
        comment,
        userId: customerId,
        serviceId: order.serviceId,
        orderId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findServiceReviews(serviceId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const reviews = await this.prisma.review.findMany({
      where: {
        serviceId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews;

    return {
      service: {
        id: service.id,
        title: service.title,
      },
      summary: {
        totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
      },
      reviews,
    };
  }

  async findMyReviews(customerId: string) {
    return this.prisma.review.findMany({
      where: {
        userId: customerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });
  }

  async findProviderReviews(providerId: string) {
    return this.prisma.review.findMany({
      where: {
        service: {
          providerId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
}
