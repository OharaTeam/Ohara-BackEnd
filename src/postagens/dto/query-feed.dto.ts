import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { tipoEvento } from '@prisma/client';

export enum FeedTipoFilter {
  TODOS = 'todos',
  POSTS = 'posts',
  EVENTOS = 'eventos',
}

export class QueryFeedDto {
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
    description: 'Quantidade de postagens por página (padrão: 5, máximo: 50)',
    example: 5,
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro.' })
  @Min(1, { message: 'O limite deve ser no mínimo 1.' })
  @Max(50, { message: 'O limite deve ser no máximo 50.' })
  limit?: number = 5;

  @ApiPropertyOptional({
    description:
      'Filtrar por tipo de postagem: todos, apenas posts ou apenas eventos',
    enum: FeedTipoFilter,
    example: FeedTipoFilter.TODOS,
    default: FeedTipoFilter.TODOS,
  })
  @IsOptional()
  @IsEnum(FeedTipoFilter, {
    message: 'O tipo deve ser "todos", "posts" ou "eventos".',
  })
  tipo?: FeedTipoFilter = FeedTipoFilter.TODOS;

  @ApiPropertyOptional({
    description:
      'Filtrar eventos por categoria específica (COBBLEMON ou OUTRO)',
    enum: tipoEvento,
    example: tipoEvento.COBBLEMON,
  })
  @IsOptional()
  @IsEnum(tipoEvento, {
    message: 'O tipoEvento deve ser COBBLEMON ou OUTRO.',
  })
  tipoEvento?: tipoEvento;
}
