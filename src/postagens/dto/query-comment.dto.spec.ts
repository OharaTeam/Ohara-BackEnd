import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { QueryCommentDto } from './query-comment.dto';

describe('QueryCommentDto', () => {
  it('deve validar com sucesso um payload vazio (valores padrão aplicados)', async () => {
    const dto = plainToInstance(QueryCommentDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(5);
    expect(dto.order).toBe('asc');
  });

  it('deve validar com sucesso com parâmetros válidos convertidos de string para número', async () => {
    const dto = plainToInstance(QueryCommentDto, {
      page: '2',
      limit: '5',
      order: 'desc',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(5);
    expect(dto.order).toBe('desc');
  });

  it('deve falhar se a página for menor que 1', async () => {
    const dto = plainToInstance(QueryCommentDto, {
      page: 0,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((err) => err.property === 'page')).toBe(true);
  });

  it('deve falhar se o limite for maior que 5', async () => {
    const dto = plainToInstance(QueryCommentDto, {
      limit: 6,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((err) => err.property === 'limit')).toBe(true);
  });

  it('deve falhar se o limite for menor que 1', async () => {
    const dto = plainToInstance(QueryCommentDto, {
      limit: 0,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((err) => err.property === 'limit')).toBe(true);
  });

  it('deve falhar se a ordem for diferente de "asc" e "desc"', async () => {
    const dto = plainToInstance(QueryCommentDto, {
      order: 'invalid',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((err) => err.property === 'order')).toBe(true);
  });
});
