import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { tipoEvento } from '@prisma/client';

export class EventoAuthorDto {
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

export class EventoCountDto {
  @ApiPropertyOptional({
    description: 'Quantidade de Pokémons capturados associados ao evento',
    example: 5,
  })
  pokemonsCapturados?: number;
}

export class EventoResponseDto {
  @ApiProperty({
    description: 'ID único do evento (UUID)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: 'Nome único do evento',
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
    description: 'Descrição detalhada do evento',
    example: 'Venha participar...',
  })
  descricao: string;

  @ApiPropertyOptional({
    description: 'URLs das mídias associadas',
    type: [String],
    example: ['https://exemplo.com/banner.png'],
  })
  media?: string[] | null;

  @ApiProperty({
    description: 'Discord ID do autor',
    example: '123456789012345678',
  })
  authorId: string;

  @ApiProperty({
    description: 'Data e hora de início do evento',
    example: '2026-11-01T18:00:00.000Z',
  })
  dataInicio: Date;

  @ApiProperty({
    description: 'Data e hora de encerramento do evento',
    example: '2026-11-01T22:00:00.000Z',
  })
  dataEncerramento: Date;

  @ApiProperty({
    description: 'Data de criação do evento',
    example: '2026-10-11T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2026-10-11T12:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Dados públicos do criador do evento',
    type: EventoAuthorDto,
  })
  author?: EventoAuthorDto;

  @ApiPropertyOptional({
    description: 'ID da postagem associada no feed',
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  })
  postId?: string;

  @ApiPropertyOptional({
    description: 'Contagens de entidades associadas ao evento',
    type: EventoCountDto,
  })
  _count?: EventoCountDto;
}

export class EventoListResponseDto {
  @ApiProperty({
    description: 'Lista de eventos da agenda',
    type: [EventoResponseDto],
  })
  data: EventoResponseDto[];

  @ApiProperty({ description: 'Total de eventos encontrados', example: 12 })
  total: number;

  @ApiProperty({ description: 'Página atual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Limite de itens por página', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total de páginas', example: 2 })
  totalPages: number;
}
