import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommentAuthorRoleDto {
  @ApiProperty({ description: 'Nome do cargo', example: 'Admin' })
  name: string;
}

export class CommentAuthorDto {
  @ApiProperty({
    description: 'ID do autor no banco',
    example: 'd3b07384-d113-494a-80bb-010df0498b95',
  })
  id: string;

  @ApiProperty({ description: 'Username do Discord', example: 'caetano_dev' })
  username: string;

  @ApiPropertyOptional({
    description: 'Nome global de exibição',
    example: 'Jean Caetano',
  })
  globalName?: string | null;

  @ApiPropertyOptional({
    description: 'URL do avatar do usuário',
    example: 'https://cdn.discordapp.com/avatars/...',
  })
  avatarUrl?: string | null;

  @ApiProperty({
    description: 'Lista de cargos do autor',
    type: [CommentAuthorRoleDto],
  })
  roles: CommentAuthorRoleDto[];
}

export class CommentResponseDto {
  @ApiProperty({
    description: 'ID único do comentário',
    example: 'c47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: 'Conteúdo em texto do comentário',
    example: 'Excelente postagem, muito informativo!',
  })
  content: string;

  @ApiPropertyOptional({
    description: 'Mídias anexadas ao comentário (links de imagens/gifs)',
    type: [String],
    example: ['https://exemplo.com/comentario.png'],
  })
  media?: string[] | null;

  @ApiProperty({ description: 'Data de criação do comentário' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização do comentário' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Dados públicos do autor do comentário',
    type: CommentAuthorDto,
  })
  author: CommentAuthorDto;
}

export class PaginatedCommentsResponseDto {
  @ApiProperty({
    description: 'Lista de comentários da página',
    type: [CommentResponseDto],
  })
  data: CommentResponseDto[];

  @ApiProperty({
    description: 'Total de comentários da postagem',
    example: 42,
  })
  total: number;

  @ApiProperty({ description: 'Número da página atual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Limite de comentários por página', example: 5 })
  limit: number;

  @ApiProperty({ description: 'Total de páginas calculadas', example: 9 })
  totalPages: number;
}
