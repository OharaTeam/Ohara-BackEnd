import { Test, TestingModule } from '@nestjs/testing';
import { PostagensController } from './postagens.controller';
import { PostagensService } from './postagens.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryFeedDto, FeedTipoFilter } from './dto/query-feed.dto';
import { QueryCommentDto } from './dto/query-comment.dto';

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
});
