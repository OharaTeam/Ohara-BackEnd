import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Status de saúde da API', description: 'Retorna uma mensagem simples indicando que o servidor está ativo.' })
  @ApiResponse({ status: 200, description: 'Servidor operacional.' })
  getHello(): string {
    return this.appService.getHello();
  }
}

