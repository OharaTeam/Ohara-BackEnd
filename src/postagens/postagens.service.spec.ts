import { Test, TestingModule } from '@nestjs/testing';
import { PostagensService } from './postagens.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('PostagensService', () => {
  let service: PostagensService;
  let prisma: {
    post: {
      findUnique: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
    comment: {
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      post: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      comment: {
        create: jest.fn(),
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
});
