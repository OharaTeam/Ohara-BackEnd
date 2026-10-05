import { Controller, UseGuards, Post, Body, Logger } from '@nestjs/common';
import { CargosService } from './cargos.service';
import { BotKeyGuard } from '../auth/bot-key.guard';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('cargos')
@ApiSecurity('BOT_KEY')
@Controller('cargos')
@UseGuards(BotKeyGuard)
export class CargosController {
  private readonly logger = new Logger(CargosController.name);
  constructor(private readonly cargosService: CargosService) {}

  @Post()
  @SkipThrottle()
  @ApiOperation({
    summary: 'Sincronizar cargos do Discord',
    description: 'Recebe os cargos e permissões do servidor Discord enviados pelo bot para sincronizar no PostgreSQL.',
  })
  @ApiBody({
    description: 'Array de objetos representando os cargos do servidor a serem sincronizados, recebidos pelo bot do Discord',
    type: [CreateCargoDto],
  })
  @ApiResponse({ status: 201, description: 'Cargos sincronizados com sucesso.' })
  @ApiResponse({ status: 401, description: 'Chave de API do bot (X-API-KEY) ausente ou inválida.' })
  create(@Body() createCargoDto: CreateCargoDto[]) {
    this.logger.log(`Cargos recebidos no controlador: ${createCargoDto.length}`);
    return this.cargosService.syncRoles(createCargoDto);
  }
}

