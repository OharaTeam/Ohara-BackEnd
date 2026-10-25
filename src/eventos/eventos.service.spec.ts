import { Test, TestingModule } from '@nestjs/testing';
import { EventosService } from './eventos.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { tipoEvento } from '@prisma/client';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';

describe('EventosService', () => {
  let service: EventosService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
    };
    oharaEventos: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    post: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      updateMany: jest.Mock;
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
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      post: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
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

  describe('getEventoById', () => {
    it('deve retornar o evento com dados formatados quando encontrado', async () => {
      const mockEvento = {
        id: 'evento-123',
        nomeEvento: 'Torneio Cobblemon',
        tipoEvento: tipoEvento.COBBLEMON,
        descricao: 'Descrição detalhada',
        authorId: 'discord-123',
        dataInicio: new Date('2026-11-01T18:00:00Z'),
        dataEncerramento: new Date('2026-11-01T22:00:00Z'),
        author: {
          id: 'user-1',
          username: 'caetano',
          globalName: 'Jean',
          avatarUrl: null,
        },
        posts: [{ id: 'post-999' }],
        _count: {
          pokemonsCapturados: 3,
        },
      };

      prisma.oharaEventos.findUnique.mockResolvedValue(mockEvento);

      const result = await service.getEventoById('evento-123');

      expect(prisma.oharaEventos.findUnique).toHaveBeenCalledWith({
        where: { id: 'evento-123' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              globalName: true,
              avatarUrl: true,
            },
          },
          posts: {
            select: {
              id: true,
            },
            take: 1,
          },
          _count: {
            select: {
              pokemonsCapturados: true,
            },
          },
        },
      });
      expect(result.id).toBe('evento-123');
      expect(result.postId).toBe('post-999');
      expect(result._count?.pokemonsCapturados).toBe(3);
    });

    it('deve lançar NotFoundException quando o evento não existir', async () => {
      prisma.oharaEventos.findUnique.mockResolvedValue(null);

      await expect(service.getEventoById('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateEvento', () => {
    const existingEvento = {
      id: 'evento-123',
      nomeEvento: 'Evento Antigo',
      tipoEvento: tipoEvento.COBBLEMON,
      descricao: 'Descrição original',
      media: [],
      authorId: 'discord-autor',
      dataInicio: new Date('2026-11-01T18:00:00Z'),
      dataEncerramento: new Date('2026-11-01T22:00:00Z'),
      posts: [{ id: 'post-123' }],
    };

    const authorUser = {
      id: 'user-1',
      discordId: 'discord-autor',
      username: 'autor',
      roles: ['Membro'],
    };

    const devUser = {
      id: 'user-2',
      discordId: 'discord-dev',
      username: 'dev_user',
      roles: ['Dev'],
    };

    const adminUserNotDev = {
      id: 'user-3',
      discordId: 'discord-admin',
      username: 'admin_fake',
      roles: ['Admin', 'Moderador'],
    };

    it('deve permitir atualização com sucesso quando o requisitante for o autor', async () => {
      prisma.oharaEventos.findUnique.mockResolvedValue(existingEvento);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          oharaEventos: {
            update: jest.fn().mockResolvedValue({
              ...existingEvento,
              descricao: 'Nova descrição atualizada',
              author: {
                id: 'user-1',
                username: 'autor',
                globalName: null,
                avatarUrl: null,
              },
              posts: [{ id: 'post-123' }],
            }),
          },
          post: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        });
      });

      const dto: UpdateEventoDto = { descricao: 'Nova descrição atualizada' };
      const result = await service.updateEvento('evento-123', authorUser, dto);

      expect(result.descricao).toBe('Nova descrição atualizada');
      expect(result.postId).toBe('post-123');
    });

    it('deve permitir atualização com sucesso quando o requisitante NÃO for o autor, mas tiver a role Dev', async () => {
      prisma.oharaEventos.findUnique.mockResolvedValue(existingEvento);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          oharaEventos: {
            update: jest.fn().mockResolvedValue({
              ...existingEvento,
              descricao: 'Alterado por dev',
              author: {
                id: 'user-1',
                username: 'autor',
                globalName: null,
                avatarUrl: null,
              },
              posts: [{ id: 'post-123' }],
            }),
          },
          post: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        });
      });

      const dto: UpdateEventoDto = { descricao: 'Alterado por dev' };
      const result = await service.updateEvento('evento-123', devUser, dto);

      expect(result.descricao).toBe('Alterado por dev');
    });

    it('deve lançar ForbiddenException quando o requisitante não for autor e não possuir o cargo Dev (mesmo tendo cargo Admin ou Moderador)', async () => {
      prisma.oharaEventos.findUnique.mockResolvedValue(existingEvento);

      const dto: UpdateEventoDto = { descricao: 'Tentativa não autorizada' };

      await expect(
        service.updateEvento('evento-123', adminUserNotDev, dto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException quando o evento não existir', async () => {
      prisma.oharaEventos.findUnique.mockResolvedValue(null);

      await expect(
        service.updateEvento('inexistente', authorUser, {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se dataEncerramento for anterior a dataInicio', async () => {
      prisma.oharaEventos.findUnique.mockResolvedValue(existingEvento);

      const dto: UpdateEventoDto = {
        dataInicio: '2026-11-05T10:00:00Z',
        dataEncerramento: '2026-11-04T10:00:00Z',
      };

      await expect(
        service.updateEvento('evento-123', authorUser, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se nomeEvento já estiver cadastrado em outro evento', async () => {
      prisma.oharaEventos.findUnique.mockResolvedValue(existingEvento);
      prisma.oharaEventos.findFirst.mockResolvedValue({ id: 'outro-evento' });

      const dto: UpdateEventoDto = {
        nomeEvento: 'Nome Duplicado',
      };

      await expect(
        service.updateEvento('evento-123', authorUser, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se nomeEvento já estiver cadastrado em outra postagem', async () => {
      prisma.oharaEventos.findUnique.mockResolvedValue(existingEvento);
      prisma.oharaEventos.findFirst.mockResolvedValue(null);
      prisma.post.findFirst.mockResolvedValue({ id: 'outro-post' });

      const dto: UpdateEventoDto = {
        nomeEvento: 'Título Já Usado',
      };

      await expect(
        service.updateEvento('evento-123', authorUser, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteEvento', () => {
    const existingEvento = {
      id: 'evento-123',
      nomeEvento: 'Evento Para Deletar',
      authorId: 'discord-autor',
    };

    const authorUser = {
      id: 'user-1',
      discordId: 'discord-autor',
      username: 'autor',
      roles: ['Membro'],
    };

    const devUser = {
      id: 'user-2',
      discordId: 'discord-dev',
      username: 'dev_user',
      roles: ['Dev'],
    };

    const nonAuthorNonDev = {
      id: 'user-3',
      discordId: 'discord-outro',
      username: 'outro',
      roles: ['Moderador', 'Admin'],
    };

    it('deve excluir o evento com sucesso quando o requisitante for o autor', async () => {
      prisma.oharaEventos.findUnique.mockResolvedValue(existingEvento);
      prisma.oharaEventos.delete.mockResolvedValue(existingEvento);

      const result = await service.deleteEvento('evento-123', authorUser);

      expect(prisma.oharaEventos.delete).toHaveBeenCalledWith({
        where: { id: 'evento-123' },
      });
      expect(result).toEqual({ message: 'Evento excluído com sucesso.' });
    });

    it('deve excluir o evento com sucesso quando o requisitante tiver a role Dev', async () => {
      prisma.oharaEventos.findUnique.mockResolvedValue(existingEvento);
      prisma.oharaEventos.delete.mockResolvedValue(existingEvento);

      const result = await service.deleteEvento('evento-123', devUser);

      expect(prisma.oharaEventos.delete).toHaveBeenCalledWith({
        where: { id: 'evento-123' },
      });
      expect(result).toEqual({ message: 'Evento excluído com sucesso.' });
    });

    it('deve lançar ForbiddenException quando o requisitante não for autor e não possuir o cargo Dev', async () => {
      prisma.oharaEventos.findUnique.mockResolvedValue(existingEvento);

      await expect(
        service.deleteEvento('evento-123', nonAuthorNonDev),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException quando o evento não existir', async () => {
      prisma.oharaEventos.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteEvento('inexistente', authorUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
