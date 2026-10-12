import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { tipoEvento } from '@prisma/client';

export class FeedAuthorDto {
  @ApiProperty({
    description: 'ID do usuário no banco',
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
}

export class FeedEventoMetadataDto {
  @ApiProperty({
    description: 'ID único do evento (UUID)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do evento',
    example: 'Torneio Cobblemon - Copa Ohara 2026',
  })
  nomeEvento: string;

  @ApiProperty({
    description: 'Tipo do evento',
    enum: tipoEvento,
    example: tipoEvento.COBBLEMON,
  })
  tipoEvento: tipoEvento;

  @ApiProperty({
    description: 'Data de início do evento',
    example: '2026-11-01T18:00:00.000Z',
  })
  dataInicio: Date;

  @ApiProperty({
    description: 'Data de término do evento',
    example: '2026-11-01T22:00:00.000Z',
  })
  dataEncerramento: Date;

  @ApiPropertyOptional({
    description: 'Mídias do evento',
    type: [String],
    example: ['https://exemplo.com/banner.png'],
  })
  media?: string[] | null;
}

export class FeedPostItemDto {
  @ApiProperty({
    description: 'ID da postagem',
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  })
  id: string;

  @ApiProperty({
    description: 'Título da postagem',
    example: 'Torneio Cobblemon - Copa Ohara 2026',
  })
  tittle: string;

  @ApiPropertyOptional({ description: 'Conteúdo textual rico da postagem' })
  content?: string;

  @ApiPropertyOptional({
    description: 'Array de mídias anexadas à postagem',
    type: [String],
  })
  media?: string[] | null;

  @ApiPropertyOptional({
    description: 'Foto de capa extraída da primeira mídia',
    example: 'https://exemplo.com/capa.png',
  })
  capa?: string | null;

  @ApiProperty({
    description: 'Indica se a postagem é vinculada a um evento',
    example: true,
  })
  isEvento: boolean;

  @ApiPropertyOptional({
    description: 'Metadados enriquecidos do evento (se for post de evento)',
    type: FeedEventoMetadataDto,
  })
  evento?: FeedEventoMetadataDto | null;

  @ApiPropertyOptional({
    description: 'Dados do autor da postagem',
    type: FeedAuthorDto,
  })
  author?: FeedAuthorDto;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}

export class FeedResponseDto {
  @ApiProperty({
    description: 'Lista de postagens do feed',
    type: [FeedPostItemDto],
  })
  data: FeedPostItemDto[];

  @ApiProperty({
    description: 'Total de postagens encontradas para os filtros aplicados',
    example: 42,
  })
  total: number;

  @ApiProperty({ description: 'Página atual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Limite de itens por página', example: 5 })
  limit: number;

  @ApiProperty({ description: 'Total de páginas', example: 9 })
  totalPages: number;
}
