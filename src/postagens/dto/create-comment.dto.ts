import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Conteúdo do comentário',
    example: 'Excelente postagem sobre o novo evento!',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString({ message: 'O conteúdo deve ser uma string.' })
  @IsNotEmpty({ message: 'O conteúdo não pode ser vazio.' })
  @MinLength(1, { message: 'O conteúdo deve conter no mínimo 1 caractere.' })
  @MaxLength(1000, {
    message: 'O conteúdo deve conter no máximo 1000 caracteres.',
  })
  content: string;

  @ApiPropertyOptional({
    description: 'URLs de anexos ou mídias do comentário',
    type: [String],
    example: ['https://exemplo.com/imagem.png'],
  })
  @IsOptional()
  @IsArray({ message: 'Mídias deve ser um array de URLs.' })
  @IsString({
    each: true,
    message: 'Cada item de mídia deve ser uma URL em formato string.',
  })
  @ArrayMaxSize(10, {
    message: 'O comentário pode conter no máximo 10 mídias.',
  })
  media?: string[];
}
