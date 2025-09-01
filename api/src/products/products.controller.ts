// src/products/products.controller.ts
import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ListProductsDto } from './dto/list-products.dto';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly service: ProductsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiQuery({ name: 'ruc', type: String, required: true, example: '1790012345001' })
  @ApiQuery({ name: 'q', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 20 })
  async list(@Query() dto: ListProductsDto) {
    const companyId = await this.resolveCompanyIdByRuc(dto.ruc);
    return this.service.list({
      companyId,
      q: dto.q,
      page: dto.page,
      limit: dto.limit,
    });
  }

  @Get(':id')
  @ApiQuery({ name: 'ruc', type: String, required: true, example: '1790012345001' })
  async getOne(@Param('id') id: string, @Query() dto: ListProductsDto) {
    const companyId = await this.resolveCompanyIdByRuc(dto.ruc);
    return this.service.findOne(companyId, id);
  }

  private async resolveCompanyIdByRuc(ruc: string) {
    const company = await this.prisma.company.findUnique({ where: { ruc } });
    if (!company) throw new BadRequestException('Empresa no encontrada para ese RUC');
    return company.id;
  }
}
