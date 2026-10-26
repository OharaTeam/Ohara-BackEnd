import { Test, TestingModule } from '@nestjs/testing';
import { EventosController } from './eventos.controller';
import { EventosService } from './eventos.service';
import { tipoEvento } from '@prisma/client';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { QueryEventoDto } from './dto/query-evento.dto';

describe('EventosController', () => {
  let controller: EventosController;
  let service: {
    createEvento: jest.Mock;
    getEventos: jest.Mock;
    getEventoById: jest.Mock;
    updateEvento: jest.Mock;
    deleteEvento: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      createEvento: jest.fn(),
      getEventos: jest.fn(),
      getEventoById: jest.fn(),
      updateEvento: jest.fn(),
      deleteEvento: jest.fn(),
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

  describe('getEventoById', () => {
    it('deve chamar service.getEventoById com o ID e retornar o resultado', async () => {
      const mockEvento = {
        id: 'm8L9p2Xq4M',
        nomeEvento: 'Torneio Especial',
        postId: 'post-1',
      };

      service.getEventoById.mockResolvedValue(mockEvento);

      const result = await controller.getEventoById('m8L9p2Xq4M');

      expect(service.getEventoById).toHaveBeenCalledWith('m8L9p2Xq4M');
      expect(result).toEqual(mockEvento);
    });
  });

  describe('updateEvento', () => {
    it('deve chamar service.updateEvento com id, user e dto', async () => {
      const dto: UpdateEventoDto = {
        descricao: 'Nova descrição',
      };

      const req = {
        user: {
          id: 'user-id-123',
          discordId: 'discord-98765',
          username: 'caetano',
          roles: ['Dev'],
        },
      };

      const mockResponse = {
        id: 'm8L9p2Xq4M',
        descricao: 'Nova descrição',
      };

      service.updateEvento.mockResolvedValue(mockResponse);

      const result = await controller.updateEvento('m8L9p2Xq4M', dto, req);

      expect(service.updateEvento).toHaveBeenCalledWith(
        'm8L9p2Xq4M',
        req.user,
        dto,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteEvento', () => {
    it('deve chamar service.deleteEvento com id e user', async () => {
      const req = {
        user: {
          id: 'user-id-123',
          discordId: 'discord-98765',
          username: 'caetano',
          roles: ['Dev'],
        },
      };

      const mockResponse = { message: 'Evento excluído com sucesso.' };
      service.deleteEvento.mockResolvedValue(mockResponse);

      const result = await controller.deleteEvento('m8L9p2Xq4M', req);

      expect(service.deleteEvento).toHaveBeenCalledWith('m8L9p2Xq4M', req.user);
      expect(result).toEqual(mockResponse);
    });
  });
});
