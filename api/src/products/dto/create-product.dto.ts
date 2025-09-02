import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Camisa básica' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: 'CAM-001', description: 'Único por compañía; opcional' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  code?: string | null;
}
