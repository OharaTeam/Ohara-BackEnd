import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCommentDto } from './create-comment.dto';

describe('CreateCommentDto', () => {
  it('deve validar com sucesso um payload válido', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      content: 'Comentário perfeitamente válido',
      media: ['https://exemplo.com/imagem.png'],
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve falhar se o content estiver vazio', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      content: '',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('content');
  });

  it('deve falhar se o content tiver mais de 1000 caracteres', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      content: 'a'.repeat(1001),
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('content');
  });

  it('deve falhar se media não for array de strings', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      content: 'Comentário válido',
      media: [123, true],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('media');
  });

  it('deve passar se media for omitido (opcional)', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      content: 'Comentário sem mídia',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
