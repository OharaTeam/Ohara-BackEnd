import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { tipoEvento } from '@prisma/client';
import { QueryFeedDto, FeedTipoFilter } from './query-feed.dto';

describe('QueryFeedDto', () => {
  it('deve validar com sucesso um payload vazio (valores padrão aplicados)', async () => {
    const dto = plainToInstance(QueryFeedDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(5);
    expect(dto.tipo).toBe(FeedTipoFilter.TODOS);
  });

  it('deve validar com sucesso com parâmetros válidos', async () => {
    const dto = plainToInstance(QueryFeedDto, {
      page: '2',
      limit: '10',
      tipo: 'eventos',
      tipoEvento: 'COBBLEMON',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(10);
    expect(dto.tipo).toBe(FeedTipoFilter.EVENTOS);
    expect(dto.tipoEvento).toBe(tipoEvento.COBBLEMON);
  });

  it('deve falhar se o tipo for inválido', async () => {
    const dto = plainToInstance(QueryFeedDto, {
      tipo: 'invalido',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((err) => err.property === 'tipo')).toBe(true);
  });

  it('deve falhar se tipoEvento for inválido', async () => {
    const dto = plainToInstance(QueryFeedDto, {
      tipoEvento: 'NAO_EXISTE',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((err) => err.property === 'tipoEvento')).toBe(true);
  });

  it('deve falhar se a página for menor que 1', async () => {
    const dto = plainToInstance(QueryFeedDto, {
      page: 0,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((err) => err.property === 'page')).toBe(true);
  });

  it('deve falhar se o limite for maior que 50', async () => {
    const dto = plainToInstance(QueryFeedDto, {
      limit: 51,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((err) => err.property === 'limit')).toBe(true);
  });
});
