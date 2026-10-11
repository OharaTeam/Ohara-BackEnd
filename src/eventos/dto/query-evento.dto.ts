import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsBooleanString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { tipoEvento } from '@prisma/client';

export class QueryEventoDto {
  @ApiPropertyOptional({
    description:
      'Filtrar apenas eventos futuros ou em andamento (dataEncerramento >= agora)',
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString({ message: 'O filtro upcoming deve ser "true" ou "false".' })
  upcoming?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de evento',
    enum: tipoEvento,
    example: tipoEvento.COBBLEMON,
  })
  @IsOptional()
  @IsEnum(tipoEvento, { message: 'O tipo deve ser COBBLEMON ou OUTRO.' })
  tipo?: tipoEvento;

  @ApiPropertyOptional({
    description: 'Número da página (padrão: 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro.' })
  @Min(1, { message: 'A página deve ser maior ou igual a 1.' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de eventos por página (padrão: 10, máximo: 50)',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro.' })
  @Min(1, { message: 'O limite deve ser no mínimo 1.' })
  @Max(50, { message: 'O limite deve ser no máximo 50.' })
  limit?: number = 10;
}
