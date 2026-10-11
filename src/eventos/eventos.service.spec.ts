import { Test, TestingModule } from '@nestjs/testing';
import { EventosService } from './eventos.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { tipoEvento } from '@prisma/client';
import { CreateEventoDto } from './dto/create-evento.dto';

describe('EventosService', () => {
  let service: EventosService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
    };
    oharaEventos: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
    post: {
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      oharaEventos: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      post: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventosService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<EventosService>(EventosService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createEvento', () => {
    const discordId = 'discord-12345';
    const dto: CreateEventoDto = {
      nomeEvento: 'Copa Cobblemon 2026',
      tipoEvento: tipoEvento.COBBLEMON,
      descricao: 'Descrição do grande torneio de Cobblemon.',
      dataInicio: '2026-11-01T18:00:00.000Z',
      dataEncerramento: '2026-11-01T22:00:00.000Z',
      media: ['https://exemplo.com/banner.png'],
    };

    it('deve lançar BadRequestException se dataEncerramento for anterior a dataInicio', async () => {
      const invalidDatesDto: CreateEventoDto = {
        ...dto,
        dataInicio: '2026-11-02T18:00:00.000Z',
        dataEncerramento: '2026-11-01T18:00:00.000Z',
      };

      await expect(
        service.createEvento(discordId, invalidDatesDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar NotFoundException se o usuário autor não existir', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.createEvento(discordId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { discordId },
        select: {
          id: true,
          discordId: true,
          username: true,
          globalName: true,
          avatarUrl: true,
        },
      });
    });

    it('deve lançar BadRequestException se já existir evento com mesmo nome', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        discordId,
        username: 'caetano',
      });
      prisma.oharaEventos.findUnique.mockResolvedValue({
        id: 'evento-existente-id',
        nomeEvento: dto.nomeEvento,
      });

      await expect(service.createEvento(discordId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se já existir postagem com mesmo título', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        discordId,
        username: 'caetano',
      });
      prisma.oharaEventos.findUnique.mockResolvedValue(null);
      prisma.post.findUnique.mockResolvedValue({
        id: 'post-existente-id',
        tittle: dto.nomeEvento,
      });

      await expect(service.createEvento(discordId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve criar evento e post no feed atomicamente via $transaction', async () => {
      const mockUser = {
        id: 'user-uuid-1',
        discordId,
        username: 'caetano',
        globalName: 'Jean Caetano',
        avatarUrl: 'https://exemplo.com/avatar.png',
      };

      const mockCreatedEvento = {
        id: 'evento-uuid-1',
        nomeEvento: dto.nomeEvento,
        tipoEvento: dto.tipoEvento,
        descricao: dto.descricao,
        media: dto.media,
        authorId: discordId,
        dataInicio: new Date(dto.dataInicio),
        dataEncerramento: new Date(dto.dataEncerramento),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCreatedPost = {
        id: 'post-uuid-1',
        tittle: dto.nomeEvento,
        content: dto.descricao,
        authorId: discordId,
        eventoId: mockCreatedEvento.id,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.oharaEventos.findUnique.mockResolvedValue(null);
      prisma.post.findUnique.mockResolvedValue(null);

      // Simula a execução da callback da $transaction
      prisma.$transaction.mockImplementation(
        (callback: (tx: unknown) => Promise<unknown>) => {
          const tx = {
            oharaEventos: {
              create: jest.fn().mockResolvedValue(mockCreatedEvento),
            },
            post: {
              create: jest.fn().mockResolvedValue(mockCreatedPost),
            },
          };
          return callback(tx);
        },
      );

      const result = await service.createEvento(discordId, dto);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.id).toBe(mockCreatedEvento.id);
      expect(result.postId).toBe(mockCreatedPost.id);
      expect(result.author.username).toBe(mockUser.username);
    });
  });

  describe('getEventos', () => {
    it('deve retornar lista paginada de eventos da agenda', async () => {
      const mockEventos = [
        {
          id: 'evento-1',
          nomeEvento: 'Evento 1',
          tipoEvento: tipoEvento.COBBLEMON,
          descricao: 'Desc 1',
          media: [],
          authorId: 'discord-1',
          dataInicio: new Date('2026-11-01T18:00:00Z'),
          dataEncerramento: new Date('2026-11-01T22:00:00Z'),
          author: {
            id: 'user-1',
            username: 'caetano',
            globalName: 'Jean',
            avatarUrl: null,
          },
          posts: [{ id: 'post-1' }],
        },
      ];

      prisma.oharaEventos.findMany.mockResolvedValue(mockEventos);
      prisma.oharaEventos.count.mockResolvedValue(1);

      const result = await service.getEventos({
        page: 1,
        limit: 10,
        upcoming: 'true',
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].postId).toBe('post-1');
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(prisma.oharaEventos.findMany).toHaveBeenCalled();
    });
  });
});
