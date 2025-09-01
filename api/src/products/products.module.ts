import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaClient], // o PrismaService si ya lo tienes
  exports: [ProductsService],
})
export class ProductsModule {}
