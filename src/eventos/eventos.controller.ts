import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
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
}
