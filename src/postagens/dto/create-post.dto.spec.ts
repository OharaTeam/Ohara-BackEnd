import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePostDto } from './create-post.dto';

describe('CreatePostDto', () => {
  it('deve validar com sucesso um payload válido', async () => {
    const dto = plainToInstance(CreatePostDto, {
      tittle: 'Título Válido do Post',
      content: 'Conteúdo detalhado e informativo do post.',
      media: ['https://cdn.exemplo.com/foto1.png'],
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve aceitar payload válido sem o campo media', async () => {
    const dto = plainToInstance(CreatePostDto, {
      tittle: 'Título sem Mídia',
      content: 'Apenas texto no post.',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve aceitar payload onde discordId opcional é enviado sem falhar na validação', async () => {
    const dto = plainToInstance(CreatePostDto, {
      tittle: 'Título do Post',
      content: 'Conteúdo do post.',
      discordId: '123456789012345678',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve falhar se o título tiver menos de 5 caracteres', async () => {
    const dto = plainToInstance(CreatePostDto, {
      tittle: 'Oi',
      content: 'Conteúdo válido.',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('tittle');
  });

  it('deve falhar se o título tiver mais de 50 caracteres', async () => {
    const dto = plainToInstance(CreatePostDto, {
      tittle: 'a'.repeat(51),
      content: 'Conteúdo válido.',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('tittle');
  });

  it('deve falhar se o conteúdo estiver vazio', async () => {
    const dto = plainToInstance(CreatePostDto, {
      tittle: 'Título Válido',
      content: '',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('content');
  });

  it('deve falhar se media não for array de strings', async () => {
    const dto = plainToInstance(CreatePostDto, {
      tittle: 'Título Válido',
      content: 'Conteúdo válido.',
      media: 'not-an-array' as any,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('media');
  });
});
