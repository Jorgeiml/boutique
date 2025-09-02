import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min, } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { IsEcuadorRuc } from '../../common/validators/is-ecuador-ruc';

export class ListProductsDto {
  @ApiProperty({ example: '1790012345001', description: 'RUC de la empresa (EC)' })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEcuadorRuc()
  ruc!: string;

  @ApiPropertyOptional({ example: 'camisa' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  q?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
