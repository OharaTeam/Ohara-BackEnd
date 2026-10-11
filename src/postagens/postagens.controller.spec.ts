import { Test, TestingModule } from '@nestjs/testing';
import { PostagensController } from './postagens.controller';
import { PostagensService } from './postagens.service';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('PostagensController', () => {
  let controller: PostagensController;
  let service: jest.Mocked<Partial<PostagensService>>;

  beforeEach(async () => {
    service = {
      createComment: jest.fn(),
      createPost: jest.fn(),
      getFeed: jest.fn(),
      getPost: jest.fn(),
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
});
