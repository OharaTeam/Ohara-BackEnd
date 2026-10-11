import { Test, TestingModule } from '@nestjs/testing';
import { EventosController } from './eventos.controller';
import { EventosService } from './eventos.service';
import { tipoEvento } from '@prisma/client';
import { CreateEventoDto } from './dto/create-evento.dto';
import { QueryEventoDto } from './dto/query-evento.dto';

describe('EventosController', () => {
  let controller: EventosController;
  let service: {
    createEvento: jest.Mock;
    getEventos: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      createEvento: jest.fn(),
      getEventos: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventosController],
      providers: [
        {
          provide: EventosService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<EventosController>(EventosController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('createEvento', () => {
    it('deve chamar o service.createEvento com discordId do req.user e o DTO', async () => {
      const dto: CreateEventoDto = {
        nomeEvento: 'Torneio Especial',
        tipoEvento: tipoEvento.COBBLEMON,
        descricao: 'Grande torneio',
        dataInicio: '2026-11-01T18:00:00.000Z',
        dataEncerramento: '2026-11-01T22:00:00.000Z',
      };

      const req = {
        user: {
          id: 'user-id-123',
          discordId: 'discord-98765',
        },
      };

      const mockResponse = {
        id: 'evento-1',
        nomeEvento: dto.nomeEvento,
        postId: 'post-1',
      };

      service.createEvento.mockResolvedValue(mockResponse);

      const result = await controller.createEvento(dto, req);

      expect(service.createEvento).toHaveBeenCalledWith(
        req.user.discordId,
        dto,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getEventos', () => {
    it('deve chamar service.getEventos com a query', async () => {
      const query: QueryEventoDto = {
        page: 1,
        limit: 10,
        upcoming: 'true',
      };

      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      service.getEventos.mockResolvedValue(mockResponse);

      const result = await controller.getEventos(query);

      expect(service.getEventos).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });
  });
});
