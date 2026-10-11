import {
  IsString,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  ArrayMaxSize,
  IsISO8601,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { tipoEvento } from '@prisma/client';

export class CreateEventoDto {
  @ApiProperty({
    description: 'Nome único do evento',
    example: 'Torneio Cobblemon - Copa Ohara 2026',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'O nome do evento deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome do evento não pode ser vazio.' })
  @MinLength(3, {
    message: 'O nome do evento deve conter no mínimo 3 caracteres.',
  })
  @MaxLength(100, {
    message: 'O nome do evento deve conter no máximo 100 caracteres.',
  })
  nomeEvento: string;

  @ApiProperty({
    description: 'Tipo do evento',
    enum: tipoEvento,
    example: tipoEvento.COBBLEMON,
  })
  @IsEnum(tipoEvento, {
    message: 'O tipo de evento deve ser COBBLEMON ou OUTRO.',
  })
  @IsNotEmpty({ message: 'O tipo do evento é obrigatório.' })
  tipoEvento: tipoEvento;

  @ApiProperty({
    description: 'Descrição detalhada do evento (texto rico)',
    example:
      'Venha participar do grande torneio Cobblemon da comunidade Ohara! Inscrições abertas.',
    minLength: 5,
    maxLength: 10000,
  })
  @IsString({ message: 'A descrição deve ser uma string.' })
  @IsNotEmpty({ message: 'A descrição não pode ser vazia.' })
  @MinLength(5, { message: 'A descrição deve conter no mínimo 5 caracteres.' })
  @MaxLength(10000, {
    message: 'A descrição deve conter no máximo 10000 caracteres.',
  })
  descricao: string;

  @ApiProperty({
    description: 'Data e hora de início do evento em formato ISO 8601',
    example: '2026-11-01T18:00:00.000Z',
  })
  @IsISO8601(
    {},
    { message: 'A data de início deve estar no formato ISO 8601 válido.' },
  )
  @IsNotEmpty({ message: 'A data de início é obrigatória.' })
  dataInicio: string;

  @ApiProperty({
    description: 'Data e hora de encerramento do evento em formato ISO 8601',
    example: '2026-11-01T22:00:00.000Z',
  })
  @IsISO8601(
    {},
    {
      message: 'A data de encerramento deve estar no formato ISO 8601 válido.',
    },
  )
  @IsNotEmpty({ message: 'A data de encerramento é obrigatória.' })
  dataEncerramento: string;

  @ApiPropertyOptional({
    description:
      'URLs de imagens ou banners promocionais do evento (até 10 itens)',
    type: [String],
    example: ['https://exemplo.com/banner-evento.png'],
  })
  @IsOptional()
  @IsArray({ message: 'Mídias deve ser um array de URLs.' })
  @IsString({
    each: true,
    message: 'Cada item de mídia deve ser uma URL em formato string.',
  })
  @ArrayMaxSize(10, {
    message: 'O evento pode conter no máximo 10 mídias.',
  })
  media?: string[];
}
