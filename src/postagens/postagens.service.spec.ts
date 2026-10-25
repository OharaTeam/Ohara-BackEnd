import { Test, TestingModule } from '@nestjs/testing';
import { PostagensService } from './postagens.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { tipoEvento } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FeedTipoFilter } from './dto/query-feed.dto';

describe('PostagensService', () => {
  let service: PostagensService;
  let prisma: {
    post: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
    comment: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      post: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      comment: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostagensService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PostagensService>(PostagensService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createComment', () => {
    const postId = 'post-123';
    const userId = 'user-456';
    const dto: CreateCommentDto = {
      content: 'Comentário teste',
      media: ['https://exemplo.com/imagem.png'],
    };

    it('deve lançar NotFoundException quando a postagem não existir', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(service.createComment(postId, userId, dto)).rejects.toThrow(
        new NotFoundException('Postagem não encontrada'),
      );

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(prisma.comment.create).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      prisma.post.findUnique.mockResolvedValue({
        id: postId,
        tittle: 'Título',
      });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.createComment(postId, userId, dto)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prisma.comment.create).not.toHaveBeenCalled();
    });

    it('deve criar e retornar o comentário com sucesso associando ao autor e post', async () => {
      const mockPost = {
        id: postId,
        tittle: 'Título',
      };
      const mockUser = {
        id: userId,
        discordId: 'discord-789',
        username: 'caetano',
      };
      const mockCreatedComment = {
        id: 'comment-abc',
        content: dto.content,
        media: dto.media,
        postId: mockPost.id,
        authorId: mockUser.discordId,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: mockUser.id,
          username: mockUser.username,
          globalName: 'Caetano',
          avatarUrl: 'https://exemplo.com/avatar.png',
        },
      };

      prisma.post.findUnique.mockResolvedValue(mockPost);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.comment.create.mockResolvedValue(mockCreatedComment);

      const result = await service.createComment(postId, userId, dto);

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          content: dto.content,
          media: dto.media,
          postId: mockPost.id,
          authorId: mockUser.discordId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              globalName: true,
              avatarUrl: true,
            },
          },
        },
      });
      expect(result).toEqual(mockCreatedComment);
    });
  });

  describe('getFeed', () => {
    const mockDate = new Date();
    const mockPostsFromDb = [
      {
        id: 'post-1',
        tittle: 'Post Comum',
        content: 'Conteúdo comum',
        media: [
          'https://cdn.exemplo.com/foto1.png',
          'https://cdn.exemplo.com/foto2.png',
        ],
        createdAt: mockDate,
        updatedAt: mockDate,
        author: {
          id: 'user-1',
          username: 'user1',
          globalName: 'User 1',
          avatarUrl: 'https://cdn.exemplo.com/avatar1.png',
        },
        evento: null,
      },
      {
        id: 'post-2',
        tittle: 'Torneio Cobblemon',
        content: 'Grande torneio',
        media: ['https://cdn.exemplo.com/evento.png'],
        createdAt: mockDate,
        updatedAt: mockDate,
        author: {
          id: 'user-2',
          username: 'user2',
          globalName: 'User 2',
          avatarUrl: null,
        },
        evento: {
          id: 'evento-uuid-1',
          nomeEvento: 'Torneio Cobblemon',
          tipoEvento: tipoEvento.COBBLEMON,
          dataInicio: mockDate,
          dataEncerramento: mockDate,
          media: ['https://cdn.exemplo.com/evento.png'],
        },
      },
    ];

    it('deve retornar o feed formatado com postagens e metadados enriquecidos de evento', async () => {
      prisma.post.findMany.mockResolvedValue(mockPostsFromDb);
      prisma.post.count.mockResolvedValue(2);

      const result = await service.getFeed({ page: 1, limit: 5 });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 0,
          where: {},
          orderBy: { updatedAt: 'desc' },
        }),
      );
      expect(prisma.post.count).toHaveBeenCalledWith({ where: {} });

      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(1);
      expect(result.data).toHaveLength(2);

      // Post 1 comum: sem evento, capa extraída do primeiro item de media
      expect(result.data[0].id).toBe('post-1');
      expect(result.data[0].capa).toBe('https://cdn.exemplo.com/foto1.png');
      expect(result.data[0].isEvento).toBe(false);
      expect(result.data[0].evento).toBeNull();

      // Post 2 evento: com metadados enriquecidos e isEvento = true
      expect(result.data[1].id).toBe('post-2');
      expect(result.data[1].capa).toBe('https://cdn.exemplo.com/evento.png');
      expect(result.data[1].isEvento).toBe(true);
      expect(result.data[1].evento).toBeDefined();
      expect(result.data[1].evento?.nomeEvento).toBe('Torneio Cobblemon');
      expect(result.data[1].evento?.tipoEvento).toBe(tipoEvento.COBBLEMON);
    });

    it('deve aplicar filtro de apenas postagens comuns (tipo: FeedTipoFilter.POSTS)', async () => {
      prisma.post.findMany.mockResolvedValue([mockPostsFromDb[0]]);
      prisma.post.count.mockResolvedValue(1);

      const result = await service.getFeed({
        tipo: FeedTipoFilter.POSTS,
        page: 1,
        limit: 10,
      });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { eventoId: null },
          take: 10,
          skip: 0,
        }),
      );
      expect(prisma.post.count).toHaveBeenCalledWith({
        where: { eventoId: null },
      });
      expect(result.total).toBe(1);
    });

    it('deve aplicar filtro de apenas eventos (tipo: FeedTipoFilter.EVENTOS)', async () => {
      prisma.post.findMany.mockResolvedValue([mockPostsFromDb[1]]);
      prisma.post.count.mockResolvedValue(1);

      const result = await service.getFeed({
        tipo: FeedTipoFilter.EVENTOS,
        page: 2,
        limit: 5,
      });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { eventoId: { not: null } },
          take: 5,
          skip: 5,
        }),
      );
      expect(prisma.post.count).toHaveBeenCalledWith({
        where: { eventoId: { not: null } },
      });
      expect(result.page).toBe(2);
    });

    it('deve aplicar filtro por tipoEvento (tipoEvento: COBBLEMON)', async () => {
      prisma.post.findMany.mockResolvedValue([mockPostsFromDb[1]]);
      prisma.post.count.mockResolvedValue(1);

      await service.getFeed({
        tipoEvento: tipoEvento.COBBLEMON,
      });

      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            evento: {
              tipoEvento: tipoEvento.COBBLEMON,
            },
          },
        }),
      );
    });
  });

  describe('getPost', () => {
    const postId = 'post-123';
    const mockDate = new Date();

    it('deve buscar postagem por id selecionando _count de comentários e formatando a capa', async () => {
      const mockPost = {
        id: postId,
        tittle: 'Título do Post',
        content: 'Conteúdo detalhado',
        media: [
          'https://exemplo.com/capa.png',
          'https://exemplo.com/extra.png',
        ],
        authorId: 'discord-123',
        author: {
          globalName: 'Autor Post',
          avatarUrl: 'https://exemplo.com/avatar.png',
          roles: [{ name: 'Membro' }],
        },
        createdAt: mockDate,
        updatedAt: mockDate,
        _count: {
          comentarios: 3,
        },
        evento: null,
      };

      prisma.post.findUnique.mockResolvedValue(mockPost);

      const result = await service.getPost(postId);

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
        select: expect.objectContaining({
          _count: {
            select: {
              comentarios: true,
            },
          },
        }),
      });
      expect(result.id).toBe(postId);
      expect(result._count.comentarios).toBe(3);
      expect(result.capa).toBe('https://exemplo.com/capa.png');
    });

    it('deve lançar NotFoundException quando a postagem não existir', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(service.getPost(postId)).rejects.toThrow(
        new NotFoundException('Postagem não encontrada.'),
      );

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
        select: expect.any(Object),
      });
    });
  });

  describe('getComments', () => {
    const postId = 'post-123';
    const mockDate = new Date();
    const mockComments = [
      {
        id: 'comment-1',
        content: 'Primeiro comentário',
        media: ['https://exemplo.com/img.png'],
        createdAt: mockDate,
        updatedAt: mockDate,
        author: {
          id: 'user-1',
          username: 'usuario1',
          globalName: 'Usuário Um',
          avatarUrl: 'https://exemplo.com/avatar1.png',
          roles: [{ name: 'Moderador' }],
        },
      },
    ];

    it('deve lançar NotFoundException quando a postagem não for encontrada', async () => {
      prisma.post.findUnique.mockResolvedValue(null);

      await expect(service.getComments(postId, {})).rejects.toThrow(
        new NotFoundException('Postagem não encontrada.'),
      );

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
        select: { id: true },
      });
      expect(prisma.comment.findMany).not.toHaveBeenCalled();
      expect(prisma.comment.count).not.toHaveBeenCalled();
    });

    it('deve retornar comentários paginados com valores padrão (page: 1, limit: 5, order: "asc")', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: postId });
      prisma.comment.findMany.mockResolvedValue(mockComments);
      prisma.comment.count.mockResolvedValue(11);

      const result = await service.getComments(postId, {});

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
        select: { id: true },
      });
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { postId },
        take: 5,
        skip: 0,
        orderBy: {
          createdAt: 'asc',
        },
        select: expect.objectContaining({
          id: true,
          content: true,
          media: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              username: true,
              globalName: true,
              avatarUrl: true,
              roles: {
                select: {
                  name: true,
                },
              },
            },
          },
        }),
      });
      expect(prisma.comment.count).toHaveBeenCalledWith({
        where: { postId },
      });

      expect(result).toEqual({
        data: mockComments,
        total: 11,
        page: 1,
        limit: 5,
        totalPages: 3,
      });
    });

    it('deve retornar comentários paginados com parâmetros customizados (page: 2, limit: 5, order: "desc")', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: postId });
      prisma.comment.findMany.mockResolvedValue(mockComments);
      prisma.comment.count.mockResolvedValue(7);

      const result = await service.getComments(postId, {
        page: 2,
        limit: 5,
        order: 'desc',
      });

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { postId },
        take: 5,
        skip: 5,
        orderBy: {
          createdAt: 'desc',
        },
        select: expect.any(Object),
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.total).toBe(7);
      expect(result.totalPages).toBe(2);
    });

    it('deve restringir o limite a no máximo 5 caso valor maior seja fornecido', async () => {
      prisma.post.findUnique.mockResolvedValue({ id: postId });
      prisma.comment.findMany.mockResolvedValue([]);
      prisma.comment.count.mockResolvedValue(0);

      const result = await service.getComments(postId, {
        page: 1,
        limit: 10,
      });

      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 0,
        }),
      );
      expect(result.limit).toBe(5);
    });
  });
});
