// src/products/products.service.ts
import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCompanyOrThrow(ruc: string) {
    const company = await this.prisma.company.findUnique({ where: { ruc } });
    if (!company) throw new NotFoundException('Empresa no encontrada para el RUC');
    return company;
  }

  private normalizeCode(code?: string | null) {
    const v = (code ?? '').trim();
    return v ? v.toUpperCase() : null;
  }

  async list(dto: { ruc: string; q?: string; page: number; limit: number }) {
    const { ruc, q, page, limit } = dto;

    if (page < 1 || limit < 1 || limit > 100) {
      throw new BadRequestException('Parámetros de paginación inválidos');
    }

    const company = await this.getCompanyOrThrow(ruc);

    const where: Prisma.ProductWhereInput = {
      companyId: company.id,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' as const } },
              { code: { contains: q, mode: 'insensitive' as const } },
              { variants: { some: { sku: { contains: q, mode: 'insensitive' as const } } } },
            ],
          }
        : {}),
    };

     const orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: {
          variants: {
            select: { id: true, sku: true, color: true, size: true, price: true, stock: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(ruc: string, id: string) {
    const company = await this.getCompanyOrThrow(ruc);

    const product = await this.prisma.product.findFirst({
      where: { id, companyId: company.id },
      include: { variants: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(ruc: string, dto: { name: string; code?: string | null }) {
    const company = await this.getCompanyOrThrow(ruc);

    try {
      return await this.prisma.product.create({
        data: {
          name: dto.name.trim(),
          code: this.normalizeCode(dto.code),
          companyId: company.id,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('El código de producto ya existe en esta empresa');
      }
      throw e;
    }
  }

async update(ruc: string, id: string, dto: { name?: string; code?: string | null }) {
  const company = await this.getCompanyOrThrow(ruc);

  const existing = await this.prisma.product.findFirst({
    where: { id, companyId: company.id },
  });
  if (!existing) throw new NotFoundException('Producto no encontrado');

  // Normaliza y compara el code entrante con el existente
  let nextCode = existing.code;
  if (dto.code !== undefined) {
    const normalized = this.normalizeCode(dto.code);
    // Si es igual al actual, no intentamos reescribirlo (evita P2002 “único”)
    nextCode = normalized === existing.code ? existing.code : normalized;
  }

  // Si no hay cambios reales, puedes opcionalmente devolver el existente
  const nextName = dto.name?.trim() ?? existing.name;
  if (nextName === existing.name && nextCode === existing.code) {
    return existing; // no-op
  }

  try {
    return await this.prisma.product.update({
      where: { id: existing.id },
      data: {
        name: nextName,
        code: nextCode,
      },
    });
  } catch (e: any) {
    if (e.code === 'P2002') {
      // @@unique([companyId, code]) — otro producto ya tiene ese code
      throw new ConflictException('El código de producto ya existe en esta empresa');
    }
    throw e;
  }
}


  async remove(ruc: string, id: string) {
    const company = await this.getCompanyOrThrow(ruc);

    const product = await this.prisma.product.findFirst({
      where: { id, companyId: company.id },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    // Contar variantes sin depender de _count para evitar error de tipos
    const variantsCount = await this.prisma.variant.count({
      where: { productId: product.id },
    });
    if (variantsCount > 0) {
      throw new ConflictException('No se puede eliminar: el producto tiene variantes');
    }

    await this.prisma.product.delete({ where: { id: product.id } });
    return { ok: true };
  }
}
