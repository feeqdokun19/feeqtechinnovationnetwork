import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';



@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createServiceDto: CreateServiceDto,
    providerId: string,
    role: string,
  ) {
    if (role !== 'PROVIDER') {
      throw new ForbiddenException(
        'Only service providers can create services',
      );
    }

    return this.prisma.service.create({
      data: {
        title: createServiceDto.title,
        description: createServiceDto.description,
        price: createServiceDto.price,
        category: createServiceDto.category,
        providerId,
      },
    });
  }

  async findAll() {
    return this.prisma.service.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async findProviderServices(providerId: string) {
    return this.prisma.service.findMany({
      where: {
        providerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateService(
    serviceId: string,
    providerId: string,
    updateServiceDto: UpdateServiceDto,
  ) {
    const service = await this.prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });
  
    if (!service) {
      throw new NotFoundException('Service not found');
    }
  
    if (service.providerId !== providerId) {
      throw new ForbiddenException(
        'You can only update your own services',
      );
    }
  
    if (
      updateServiceDto.price !== undefined &&
      updateServiceDto.price < 0
    ) {
      throw new BadRequestException(
        'Service price cannot be negative',
      );
    }
  
    const updatedService = await this.prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        ...(updateServiceDto.title !== undefined && {
          title: updateServiceDto.title,
        }),
        ...(updateServiceDto.description !== undefined && {
          description: updateServiceDto.description,
        }),
        ...(updateServiceDto.price !== undefined && {
          price: updateServiceDto.price,
        }),
        ...(updateServiceDto.category !== undefined && {
          category: updateServiceDto.category,
        }),
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  
    return {
      message: 'Service updated successfully',
      service: updatedService,
    };
  }
  
  async updateServiceStatus(
    serviceId: string,
    providerId: string,
    status: 'ACTIVE' | 'INACTIVE',
  ) {
    const service = await this.prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });
  
    if (!service) {
      throw new NotFoundException('Service not found');
    }
  
    if (service.providerId !== providerId) {
      throw new ForbiddenException(
        'You can only manage your own services',
      );
    }
  
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      throw new BadRequestException(
        'Status must be ACTIVE or INACTIVE',
      );
    }
  
    const updatedService = await this.prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        status,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  
    return {
      message:
        status === 'ACTIVE'
          ? 'Service activated successfully'
          : 'Service deactivated successfully',
      service: updatedService,
    };
  }
}