import { IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum CommentOrderDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryCommentDto {
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
    description: 'Quantidade de comentários por página (padrão: 5, máximo: 5)',
    example: 5,
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro.' })
  @Min(1, { message: 'O limite deve ser no mínimo 1.' })
  @Max(5, { message: 'O limite deve ser no máximo 5.' })
  limit?: number = 5;

  @ApiPropertyOptional({
    description: 'Direção da ordenação por data de criação',
    enum: ['asc', 'desc'],
    example: 'asc',
    default: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'A ordem deve ser "asc" ou "desc".' })
  order?: 'asc' | 'desc' = 'asc';
}
