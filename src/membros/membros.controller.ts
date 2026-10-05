import { Controller, UseGuards, Post, Body, Get, Query, BadRequestException, Logger } from '@nestjs/common';
import { MembrosService } from './membros.service';
import { BotKeyGuard } from '../auth/bot-key.guard';
import { CreateMembroDto } from './dto/create-membro.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('membros')
@Controller('membros')
export class MembrosController {
  private readonly logger = new Logger(MembrosController.name);
  constructor(private readonly membrosService: MembrosService) { }

  @Post()
  @SkipThrottle()
  @UseGuards(BotKeyGuard)
  @ApiSecurity('BOT_KEY')
  @ApiOperation({
    summary: 'Sincronizar membros do Discord',
    description: 'Recebe um array com os membros do servidor e seus cargos enviados pelo bot do Discord para sincronizar no banco de dados.',
  })
  @ApiBody({
    description: 'Array de objetos representando os membros a serem sincronizados com os cargos recebidos pelo bot do Discord',
    type: [CreateMembroDto],
  })
  @ApiResponse({ status: 201, description: 'Membros sincronizados com sucesso.' })
  @ApiResponse({ status: 401, description: 'Chave de API do bot (X-API-KEY) ausente ou inválida.' })
  create(@Body() createMembroDto: CreateMembroDto[]) {
    this.logger.log(`Membros recebidos no controlador: ${createMembroDto.length}`);
    return this.membrosService.syncMembers(createMembroDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar membros com paginação',
    description: 'Retorna a lista paginada de membros da comunidade, priorizando desenvolvedores no topo da listagem.',
  })
  @ApiQuery({ name: 'page', description: 'Número da página a ser listada', required: false, example: '1', type: String })
  @ApiQuery({ name: 'limit', description: 'Número de membros por página', required: false, example: '10', type: String })
  @ApiResponse({ status: 200, description: 'Lista paginada de membros retornada com sucesso.' })
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    this.logger.log(`Listando membros - Página: ${page}, Limite: ${limit}`);
    return this.membrosService.findAll(page, limit);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar membro por nome',
    description: 'Busca insensível a maiúsculas/minúsculas pelo nome de usuário, apelido no servidor ou nome global.',
  })
  @ApiQuery({ name: 'name', description: 'Nome ou apelido do membro para busca', required: true, example: 'Jeans' })
  @ApiResponse({ status: 200, description: 'Membros encontrados com sucesso.' })
  @ApiResponse({ status: 400, description: 'O parâmetro de busca "name" é obrigatório.' })
  async searchMember(@Query('name') name: string) {
    if (!name) {
      throw new BadRequestException('O nome para busca é obrigatório');
    }
    this.logger.log(`Buscando membro pelo nome: ${name}`);
    return await this.membrosService.findOne(name);
  }
}

