import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ListProductsDto } from './dto/list-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RucQueryDto } from './dto/ruc-query.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // GET /products?ruc=&q=&page=&limit=
  @Get()
  @ApiResponse({ status: 200, description: 'Listado paginado de productos' })
  async list(@Query() dto: ListProductsDto) {
    return this.service.list({
      ruc: dto.ruc,
      q: dto.q,
      page: dto.page,
      limit: dto.limit,
    });
  }

  // GET /products/:id?ruc=
  @Get(':id')
  @ApiQuery({ name: 'ruc', required: true })
  @ApiResponse({ status: 200, description: 'Detalle de producto (incluye variantes)' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async getOne(@Param('id') id: string, @Query() q: RucQueryDto) {
    return this.service.findOne(q.ruc, id);
  }

  // POST /products?ruc=
  @Post()
  @ApiQuery({ name: 'ruc', required: true })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Producto creado' })
  @ApiResponse({ status: 409, description: 'Conflicto: code ya existe en la empresa' })
  async create(@Query() q: RucQueryDto, @Body() body: CreateProductDto) {
    return this.service.create(q.ruc, body);
  }

  // PATCH /products/:id?ruc=
  @Patch(':id')
  @ApiQuery({ name: 'ruc', required: true })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto: code ya existe en la empresa' })
  async update(
    @Param('id') id: string,
    @Query() q: RucQueryDto,
    @Body() body: UpdateProductDto,
  ) {
    return this.service.update(q.ruc, id, body);
  }

  // DELETE /products/:id?ruc=
  @Delete(':id')
  @ApiQuery({ name: 'ruc', required: true })
  @ApiResponse({ status: 200, description: 'Producto eliminado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar: tiene variantes' })
  async remove(@Param('id') id: string, @Query() q: RucQueryDto) {
    return this.service.remove(q.ruc, id);
  }
}
