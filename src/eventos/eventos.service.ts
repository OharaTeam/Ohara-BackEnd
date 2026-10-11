import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { QueryEventoDto } from './dto/query-evento.dto';

@Injectable()
export class EventosService {
  private readonly logger = new Logger(EventosService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo evento e automaticamente publica a postagem correspondente no feed
   * em uma transação atômica do banco de dados.
   */
  async createEvento(discordId: string, dto: CreateEventoDto) {
    this.logger.log(
      `Iniciando criação de evento "${dto.nomeEvento}" pelo autor Discord ID: ${discordId}`,
    );

    const inicio = new Date(dto.dataInicio);
    const fim = new Date(dto.dataEncerramento);

    if (fim < inicio) {
      throw new BadRequestException(
        'A data de encerramento não pode ser anterior à data de início.',
      );
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { discordId },
        select: {
          id: true,
          discordId: true,
          username: true,
          globalName: true,
          avatarUrl: true,
        },
      });

      if (!user) {
        throw new NotFoundException(
          `Usuário autor com Discord ID ${discordId} não foi encontrado.`,
        );
      }

      const existingEvento = await this.prisma.oharaEventos.findUnique({
        where: { nomeEvento: dto.nomeEvento },
      });

      if (existingEvento) {
        throw new BadRequestException(
          `Já existe um evento cadastrado com o nome "${dto.nomeEvento}".`,
        );
      }

      const existingPost = await this.prisma.post.findUnique({
        where: { tittle: dto.nomeEvento },
      });

      if (existingPost) {
        throw new BadRequestException(
          `Já existe uma postagem cadastrada com o título "${dto.nomeEvento}".`,
        );
      }

      const resultado = await this.prisma.$transaction(async (tx) => {
        const evento = await tx.oharaEventos.create({
          data: {
            nomeEvento: dto.nomeEvento,
            tipoEvento: dto.tipoEvento,
            descricao: dto.descricao,
            media: dto.media ?? [],
            authorId: discordId,
            dataInicio: inicio,
            dataEncerramento: fim,
          },
        });

        const post = await tx.post.create({
          data: {
            tittle: dto.nomeEvento,
            content: dto.descricao,
            media: dto.media ?? [],
            authorId: discordId,
            eventoId: evento.id,
          },
        });

        return {
          ...evento,
          postId: post.id,
          author: {
            id: user.id,
            username: user.username,
            globalName: user.globalName,
            avatarUrl: user.avatarUrl,
          },
        };
      });

      this.logger.log(
        `Evento "${resultado.nomeEvento}" e post vinculado (${resultado.postId}) criados com sucesso!`,
      );

      return resultado;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Erro ao criar evento: ${error}`);
      throw new InternalServerErrorException('Erro ao criar evento');
    }
  }

  /**
   * Retorna a agenda de eventos cadastrados com suporte a filtros (upcoming, tipo) e paginação.
   */
  async getEventos(query: QueryEventoDto) {
    this.logger.log(
      `Consultando agenda de eventos com filtros: ${JSON.stringify(query)}`,
    );

    try {
      const where: Prisma.OharaEventosWhereInput = {};

      if (query.upcoming === 'true') {
        where.dataEncerramento = { gte: new Date() };
      } else if (query.upcoming === 'false') {
        where.dataEncerramento = { lt: new Date() };
      }

      if (query.tipo) {
        where.tipoEvento = query.tipo;
      }

      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;

      const [eventos, total] = await Promise.all([
        this.prisma.oharaEventos.findMany({
          where,
          take: limit,
          skip,
          orderBy: { dataInicio: 'asc' },
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
          },
        }),
        this.prisma.oharaEventos.count({ where }),
      ]);

      const formattedData = eventos.map((ev) => {
        const { posts, ...rest } = ev;
        return {
          ...rest,
          postId: posts.length > 0 ? posts[0].id : undefined,
        };
      });

      return {
        data: formattedData,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (error) {
      this.logger.error(`Erro ao consultar agenda de eventos: ${error}`);
      throw new InternalServerErrorException(
        'Erro ao consultar agenda de eventos',
      );
    }
  }
}
