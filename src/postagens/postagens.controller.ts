import { Controller, Post, Get, Body, Param, Req, Query, Logger, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { PostagensService } from './postagens.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';

@ApiTags('postagens')
@Controller('postagens')
export class PostagensController {
    private readonly logger = new Logger(PostagensController.name);
    constructor(private readonly postagensService: PostagensService) { }

    @Get()
    @ApiOperation({
        summary: 'Obter feed de postagens',
        description: 'Retorna a lista paginada de postagens da comunidade com dados dos autores e contagem de comentários.',
    })
    @ApiQuery({ name: 'page', description: 'Página a ser listada', required: false, example: '1' })
    @ApiQuery({ name: 'limit', description: 'Limite de itens por página', required: false, example: '5' })
    @ApiResponse({ status: 200, description: 'Feed retornado com sucesso.' })
    getFeed(@Query('page') page: string = '1', @Query('limit') limit: string = '5') {
        this.logger.log(`Solicitação de feed recebida com paginação: ${page}, limite: ${limit}`);
        return this.postagensService.getFeed(page, limit);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Buscar postagem por ID',
        description: 'Retorna os detalhes completos de uma postagem, incluindo mídias, autor e comentários.',
    })
    @ApiParam({ name: 'id', description: 'ID (UUID) da postagem', required: true, example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiResponse({ status: 200, description: 'Postagem encontrada com sucesso.' })
    @ApiResponse({ status: 404, description: 'Postagem não encontrada.' })
    getPost(@Param('id') id: string) {
        this.logger.log(`Solicitada exibição do post: ${id}`);
        return this.postagensService.getPost(id);
    }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Criar nova postagem',
        description: 'Cria uma nova postagem associada ao autor autenticado via JWT.',
    })
    @ApiBody({ type: CreatePostDto })
    @ApiResponse({ status: 201, description: 'Postagem criada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado: Token JWT ausente ou inválido.' })
    createPost(@Body() createPostDto: CreatePostDto) {
        this.logger.log(`Solicitação de criação de post recebida por ${createPostDto.discordId}`);
        this.logger.log(`Dados do post: ${createPostDto}`)
        return this.postagensService.createPost(createPostDto);
    }

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Upload de imagens para postagens',
        description: 'Permite o envio de até 5 imagens locais e retorna seus links públicos gerados.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Arquivos de imagem para upload (limite de 5 arquivos)',
        schema: {
            type: 'object',
            properties: {
                arquivos: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Imagens enviadas com sucesso e URLs retornadas.' })
    @ApiResponse({ status: 401, description: 'Não autorizado: Token JWT ausente ou inválido.' })
    @UseInterceptors(FilesInterceptor('arquivos', 5, {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = './uploads/images';
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });

                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + extname(file.originalname));
            }
        })
    }))
    uploadImagens(@UploadedFiles() files: Express.Multer.File[], @Req() req: any) {
        let baseUrl: string;

        // Em produção, usa a variável APP_URL. Em dev, usa o host da requisição.
        if (process.env.NODE_ENV === 'production') {
            baseUrl = process.env.APP_URL || 'http://localhost:3000';
        } else {
            const protocol = req.protocol || 'http';
            const host = req.get('host') || 'localhost:3000';
            baseUrl = `${protocol}://${host}`;
        }

        const urls = files.map(file => `${baseUrl}/uploads/images/${file.filename}`);
        return { urls };
    }
}