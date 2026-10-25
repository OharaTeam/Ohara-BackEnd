import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryFeedDto, FeedTipoFilter } from './dto/query-feed.dto';
import { QueryCommentDto } from './dto/query-comment.dto';

@Injectable()
export class PostagensService {
  private readonly logger = new Logger(PostagensService.name);
  constructor(private prisma: PrismaService) {}

  async createPost(createPostDto: CreatePostDto) {
    this.logger.log(
      `Solicitação de criação de post recebida por ${createPostDto.discordId}`,
    );
    try {
      const postExiste = await this.prisma.post.findUnique({
        where: {
          tittle: createPostDto.tittle,
        },
      });

      if (postExiste) {
        throw new BadRequestException(`Já existe um post com esse titulo.`);
      }

      if (createPostDto.media!.length > 10) {
        throw new BadRequestException(`O post deve ter menos de 10 mídias.`);
      }

      return this.prisma.post.create({
        data: {
          tittle: createPostDto.tittle,
          content: createPostDto.content,
          authorId: createPostDto.discordId,
          media: createPostDto.media,
          eventoId: createPostDto.eventoId,
        },
      });
    } catch (error) {
      this.logger.warn(`Erro ao criar post: ${error}`);
      throw new InternalServerErrorException(`Erro ao criar post`);
    }
  }

  async getFeed(query: QueryFeedDto = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 5;
    const skip = (page - 1) * limit;

    this.logger.log(
      `Solicitação de feed recebida com paginação: ${page}, limite: ${limit}, tipo: ${query.tipo || 'todos'}${query.tipoEvento ? `, tipoEvento: ${query.tipoEvento}` : ''}`,
    );

    const where: Prisma.PostWhereInput = {};

    if (query.tipo === FeedTipoFilter.POSTS) {
      where.eventoId = null;
    } else if (query.tipo === FeedTipoFilter.EVENTOS) {
      where.eventoId = { not: null };
    }

    if (query.tipoEvento) {
      where.evento = {
        tipoEvento: query.tipoEvento,
      };
    }

    try {
      const [feed, total] = await Promise.all([
        this.prisma.post.findMany({
          where,
          take: limit,
          skip,
          orderBy: {
            updatedAt: 'desc', // Os últimos feitos ou editados
          },
          select: {
            id: true,
            tittle: true,
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
              },
            },
            evento: {
              select: {
                id: true,
                nomeEvento: true,
                tipoEvento: true,
                dataInicio: true,
                dataEncerramento: true,
                media: true,
              },
            },
          },
        }),
        this.prisma.post.count({ where }),
      ]);

      // Adiciona a foto de capa (primeira mídia do array), flag isEvento e formata a resposta
      const formattedFeed = feed.map((post) => {
        let capa: string | null = null;

        // O campo media no banco é JSON, verificamos se é um array
        const mediaArray = post.media as string[] | null;
        if (Array.isArray(mediaArray) && mediaArray.length > 0) {
          capa = mediaArray[0];
        }

        return {
          ...post,
          capa,
          isEvento: !!post.evento,
        };
      });

      return {
        data: formattedFeed,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (error) {
      this.logger.warn(`Erro ao obter feed: ${error}`);
      throw new InternalServerErrorException(`Erro ao obter feed`);
    }
  }

  async getPost(id: string) {
    this.logger.log(`Solicitação de post recebida com id: ${id}`);
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          tittle: true,
          content: true,
          media: true,
          authorId: true,
          author: {
            select: {
              globalName: true,
              avatarUrl: true,
              roles: {
                select: {
                  name: true,
                },
              },
            },
          },
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              comentarios: true,
            },
          },
          evento: {
            select: {
              id: true,
              nomeEvento: true,
              tipoEvento: true,
              media: true,
              descricao: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
              dataInicio: true,
              dataEncerramento: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!post) {
        throw new NotFoundException(`Postagem não encontrada.`);
      }
      const formattedPost = {
        ...post,
        capa:
          Array.isArray(post.media) && post.media.length > 0
            ? post.media[0]
            : null,
      };

      return formattedPost;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.warn(`Erro ao obter post: ${error}`);
      throw new InternalServerErrorException(`Erro ao obter post`);
    }
  }

  async createComment(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    this.logger.log(
      `Solicitação de criação de comentário no post ${postId} pelo usuário ${userId}`,
    );
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException('Postagem não encontrada');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const comment = await this.prisma.comment.create({
        data: {
          content: createCommentDto.content,
          media: createCommentDto.media,
          postId: post.id,
          authorId: user.discordId,
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

      return comment;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.warn(`Erro ao criar comentário: ${error}`);
      throw new InternalServerErrorException('Erro ao criar comentário');
    }
  }

  async getComments(postId: string, query: QueryCommentDto = {}) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 5, 5);
    const order = query.order === 'desc' ? 'desc' : 'asc';
    const skip = (page - 1) * limit;

    this.logger.log(
      `Solicitação de comentários para o post ${postId}: página ${page}, limite ${limit}, ordem ${order}`,
    );

    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: { id: true },
      });

      if (!post) {
        throw new NotFoundException('Postagem não encontrada.');
      }

      const [comments, total] = await Promise.all([
        this.prisma.comment.findMany({
          where: { postId },
          take: limit,
          skip,
          orderBy: {
            createdAt: order,
          },
          select: {
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
          },
        }),
        this.prisma.comment.count({
          where: { postId },
        }),
      ]);

      return {
        data: comments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.warn(`Erro ao obter comentários: ${error}`);
      throw new InternalServerErrorException('Erro ao obter comentários');
    }
  }
  async deleteComment(postId: string, commentId: string, userId: string) {
    this.logger.log(
      `Solicitação de exclusão do comentário ${commentId} no post ${postId} pelo usuário ${userId}`,
    );
    try {
      // 1. Busca o comentário DENTRO da postagem da URL
      const comment = await this.prisma.comment.findFirst({
        where: { id: commentId, postId },
        select: { id: true, authorId: true },
      });

      if (!comment) {
        throw new NotFoundException('Comentário não encontrado');
      }

      // 2. Busca o usuário autenticado com seus cargos
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          discordId: true,
          roles: { select: { name: true } },
        },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      // 3. Regras de permissão
      const ehAutor = comment.authorId === user.discordId;
      // Cargo com permissáo de exclusão
      const cargosComPermissao = ['Dev'];
      const ehAdminOuModerador = user.roles.some((role) =>
        cargosComPermissao.includes(role.name.toLowerCase()),
      );

      if (!ehAutor && !ehAdminOuModerador) {
        throw new ForbiddenException(
          'Você não tem permissão para excluir este comentário',
        );
      }

      // 4. Exclui
      await this.prisma.comment.delete({ where: { id: comment.id } });

      return { message: 'Comentário removido com sucesso' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.warn(`Erro ao excluir comentário: ${error}`);
      throw new InternalServerErrorException('Erro ao excluir comentário');
    }
  }
}
