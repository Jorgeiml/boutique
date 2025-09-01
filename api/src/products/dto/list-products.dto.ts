import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class ListProductsDto {
  // RUC de 13 dígitos (obligatorio)
  @Matches(/^\d{13}$/, { message: 'ruc debe tener 13 dígitos' })
  ruc!: string;

  @IsOptional() @IsString()
  q?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit: number = 20;
}
