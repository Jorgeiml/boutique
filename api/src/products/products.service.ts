import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(dto: { companyId: string; q?: string; page: number; limit: number }) {
    const { companyId, q, page, limit } = dto;

    const where: Prisma.ProductWhereInput = {
      companyId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { code: { contains: q, mode: 'insensitive' } },
              { variants: { some: { sku: { contains: q, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: {
          variants: {
            select: { id: true, sku: true, color: true, size: true, price: true, stock: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(companyId: string, id: string) {
    return this.prisma.product.findFirst({
      where: { id, companyId },
      include: { variants: true },
    });
  }
}
