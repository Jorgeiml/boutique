import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class RucQueryDto {
  @ApiProperty({ example: '1790012345001', description: 'RUC de la empresa (13 dígitos)' })
  @IsString()
  @Matches(/^\d{13}$/, { message: 'ruc debe tener 13 dígitos' })
  ruc!: string;
}
