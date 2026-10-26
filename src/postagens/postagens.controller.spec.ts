import { Test, TestingModule } from '@nestjs/testing';
import { PostagensController } from './postagens.controller';
import { PostagensService } from './postagens.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryFeedDto, FeedTipoFilter } from './dto/query-feed.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';

describe('PostagensController', () => {
  let controller: PostagensController;
  let service: jest.Mocked<Partial<PostagensService>>;

  beforeEach(async () => {
    service = {
      createComment: jest.fn(),
      createPost: jest.fn(),
      getFeed: jest.fn(),
      getPost: jest.fn(),
      getComments: jest.fn(),
      deleteComment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostagensController],
      providers: [
        {
          provide: PostagensService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<PostagensController>(PostagensController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('createPost', () => {
    it('deve chamar o service.createPost com o discordId do usuário autenticado e o DTO', async () => {
      const dto: CreatePostDto = {
        tittle: 'Novo Post da Comunidade',
        content: 'Conteúdo do post...',
        media: ['https://cdn.exemplo.com/foto.png'],
      };
      const req = {
        user: {
          id: 'user-uuid-123',
          discordId: 'discord-auth-456',
          username: 'autor',
        },
      };
      const expectedResult = {
        id: 'post-uuid-1',
        tittle: dto.tittle,
        content: dto.content,
        authorId: 'discord-auth-456',
        media: dto.media,
        eventoId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (service.createPost as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.createPost(dto, req);

      expect(service.createPost).toHaveBeenCalledWith('discord-auth-456', dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('uploadImagens', () => {
    it('deve retornar URLs públicas para arquivos válidos enviados', () => {
      const mockFiles = [
        { filename: 'img1.png' },
        { filename: 'img2.jpg' },
      ] as Express.Multer.File[];
      const mockReq = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      } as unknown as Request;

      const result = controller.uploadImagens(mockFiles, mockReq);

      expect(result).toEqual({
        urls: [
          'http://localhost:3000/uploads/images/img1.png',
          'http://localhost:3000/uploads/images/img2.jpg',
        ],
      });
    });

    it('deve lançar BadRequestException se nenhum arquivo for enviado', () => {
      const mockReq = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      } as unknown as Request;

      expect(() => controller.uploadImagens([], mockReq)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('createComment', () => {
    it('deve chamar o service com postId, userId e createCommentDto e retornar o comentário criado', async () => {
      const postId = 'post-uuid-123';
      const userId = 'user-uuid-456';
      const dto: CreateCommentDto = {
        content: 'Comentário de teste',
        media: ['https://cdn.exemplo.com/foto.png'],
      };
      const req = { user: { id: userId, discordId: 'discord-789' } };

      const expectedResult = {
        id: 'comment-1',
        content: dto.content,
        media: dto.media,
        postId,
        authorId: 'discord-789',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: userId,
          username: 'tester',
          globalName: 'Tester',
          avatarUrl: 'https://cdn.discord.com/avatar.png',
        },
      };

      (service.createComment as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.createComment(postId, dto, req);

      expect(service.createComment).toHaveBeenCalledWith(postId, userId, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getFeed', () => {
    it('deve chamar o service.getFeed com o QueryFeedDto e retornar o feed formatado', async () => {
      const query: QueryFeedDto = {
        page: 1,
        limit: 5,
        tipo: FeedTipoFilter.EVENTOS,
      };

      const expectedFeed = {
        data: [
          {
            id: 'post-1',
            tittle: 'Torneio Cobblemon',
            media: ['https://cdn.exemplo.com/banner.png'],
            capa: 'https://cdn.exemplo.com/banner.png',
            isEvento: true,
            evento: {
              id: 'evento-1',
              nomeEvento: 'Torneio Cobblemon',
              tipoEvento: 'COBBLEMON',
              dataInicio: new Date(),
              dataEncerramento: new Date(),
              media: ['https://cdn.exemplo.com/banner.png'],
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 5,
        totalPages: 1,
      };

      (service.getFeed as jest.Mock).mockResolvedValue(expectedFeed);

      const result = await controller.getFeed(query);

      expect(service.getFeed).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedFeed);
    });
  });

  describe('getComments', () => {
    it('deve chamar o service.getComments com postId e QueryCommentDto e retornar a resposta paginada', async () => {
      const postId = 'post-uuid-123';
      const query: QueryCommentDto = {
        page: 1,
        limit: 5,
        order: 'asc',
      };

      const expectedComments = {
        data: [
          {
            id: 'comment-1',
            content: 'Primeiro comentário',
            media: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            author: {
              id: 'author-1',
              username: 'autor1',
              globalName: 'Autor Um',
              avatarUrl: 'https://exemplo.com/avatar.png',
              roles: [{ name: 'Membro' }],
            },
          },
        ],
        total: 1,
        page: 1,
        limit: 5,
        totalPages: 1,
      };

      (service.getComments as jest.Mock).mockResolvedValue(expectedComments);

      const result = await controller.getComments(postId, query);

      expect(service.getComments).toHaveBeenCalledWith(postId, query);
      expect(result).toEqual(expectedComments);
    });
  });

  describe('deleteComment', () => {
    it('deve chamar o service.deleteComment com postId, commentId e req.user.id e retornar mensagem de sucesso', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const commentId = '123e4567-e89b-12d3-a456-426614174999';
      const req = {
        user: {
          id: 'user-uuid-789',
          discordId: 'discord-789',
          username: 'usuario',
          roles: ['Dev'],
        },
      };
      const expectedResult = { message: 'Comentário removido com sucesso' };

      (service.deleteComment as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.deleteComment(postId, commentId, req);

      expect(service.deleteComment).toHaveBeenCalledWith(
        postId,
        commentId,
        req.user.id,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
