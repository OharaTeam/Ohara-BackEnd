import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { QueryEventoDto } from './dto/query-evento.dto';
import {
  EventoResponseDto,
  EventoListResponseDto,
} from './dto/evento-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedUser {
  id: string;
  discordId: string;
  username: string;
  roles?: any[];
}

interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

@ApiTags('eventos')
@Controller('eventos')
export class EventosController {
  private readonly logger = new Logger(EventosController.name);

  constructor(private readonly eventosService: EventosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar novo evento e publicar no feed',
    description:
      'Cria um novo evento no sistema e gera automaticamente a postagem correspondente no feed da comunidade Ohara de forma atômica.',
  })
  @ApiBody({ type: CreateEventoDto })
  @ApiResponse({
    status: 201,
    description: 'Evento e postagem no feed criados com sucesso.',
    type: EventoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Payload inválido, data de encerramento anterior ao início ou nome já cadastrado.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado: Token JWT ausente ou inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário autor não encontrado no banco de dados.',
  })
  createEvento(
    @Body() createEventoDto: CreateEventoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(
      `Recebida solicitação de criação de evento por usuário discordId: ${req.user.discordId}`,
    );
    return this.eventosService.createEvento(
      req.user.discordId,
      createEventoDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Consultar agenda de eventos',
    description:
      'Retorna a lista de eventos com suporte a filtros por eventos futuros (upcoming=true/false), tipo de evento e paginação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Agenda de eventos retornada com sucesso.',
    type: EventoListResponseDto,
  })
  getEventos(@Query() query: QueryEventoDto) {
    this.logger.log(
      `Recebida consulta de agenda de eventos: ${JSON.stringify(query)}`,
    );
    return this.eventosService.getEventos(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter detalhes de um evento',
    description:
      'Retorna as informações completas de um evento pelo seu ID único (UUID), incluindo autor e postagem vinculada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do evento (UUID)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do evento retornados com sucesso.',
    type: EventoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (esperado UUID válido).',
  })
  @ApiResponse({
    status: 404,
    description: 'Evento não encontrado.',
  })
  getEventoById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    this.logger.log(`Recebida solicitação de detalhes do evento ID: ${id}`);
    return this.eventosService.getEventoById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar dados de um evento',
    description:
      'Permite que o autor do evento ou administradores com cargo Dev atualizem os dados do evento.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do evento (UUID)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiBody({ type: UpdateEventoDto })
  @ApiResponse({
    status: 200,
    description: 'Evento atualizado com sucesso.',
    type: EventoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Payload inválido, conflito de nome ou data de encerramento anterior ao início.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado: Token JWT ausente ou inválido.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Acesso negado: apenas o organizador ou administradores (Dev) têm permissão para atualizar o evento.',
  })
  @ApiResponse({
    status: 404,
    description: 'Evento não encontrado.',
  })
  updateEvento(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateEventoDto: UpdateEventoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(
      `Recebida solicitação de atualização do evento ${id} por usuário discordId: ${req.user.discordId}`,
    );
    return this.eventosService.updateEvento(id, req.user, updateEventoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Excluir um evento',
    description:
      'Remove um evento do sistema. Apenas o autor do evento ou administradores com cargo Dev têm permissão.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do evento (UUID)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Evento excluído com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (esperado UUID válido).',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado: Token JWT ausente ou inválido.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Acesso negado: apenas o organizador ou administradores (Dev) têm permissão para excluir o evento.',
  })
  @ApiResponse({
    status: 404,
    description: 'Evento não encontrado.',
  })
  deleteEvento(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(
      `Recebida solicitação de exclusão do evento ${id} por usuário discordId: ${req.user.discordId}`,
    );
    return this.eventosService.deleteEvento(id, req.user);
  }
}
