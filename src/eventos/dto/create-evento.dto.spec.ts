import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateEventoDto } from './create-evento.dto';
import { tipoEvento } from '@prisma/client';

describe('CreateEventoDto', () => {
  const validPayload = {
    nomeEvento: 'Torneio Cobblemon 2026',
    tipoEvento: tipoEvento.COBBLEMON,
    descricao: 'Descrição completa do evento com mais de 5 caracteres.',
    dataInicio: '2026-11-01T18:00:00.000Z',
    dataEncerramento: '2026-11-01T22:00:00.000Z',
    media: ['https://exemplo.com/banner.png'],
  };

  it('deve validar com sucesso um payload válido', async () => {
    const dto = plainToInstance(CreateEventoDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve falhar se nomeEvento for menor que 3 caracteres', async () => {
    const dto = plainToInstance(CreateEventoDto, {
      ...validPayload,
      nomeEvento: 'ab',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'nomeEvento')).toBe(true);
  });

  it('deve falhar se tipoEvento for inválido', async () => {
    const dto = plainToInstance(CreateEventoDto, {
      ...validPayload,
      tipoEvento: 'INVALIDO_TIPO' as unknown as tipoEvento,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'tipoEvento')).toBe(true);
  });

  it('deve falhar se datas não estiverem no formato ISO 8601', async () => {
    const dto = plainToInstance(CreateEventoDto, {
      ...validPayload,
      dataInicio: '01/11/2026',
      dataEncerramento: 'amanhã',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'dataInicio')).toBe(true);
    expect(errors.some((e) => e.property === 'dataEncerramento')).toBe(true);
  });

  it('deve falhar se media tiver mais de 10 itens', async () => {
    const dto = plainToInstance(CreateEventoDto, {
      ...validPayload,
      media: Array(11).fill('https://exemplo.com/imagem.png'),
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'media')).toBe(true);
  });

  it('deve passar se media for omitido (opcional)', async () => {
    const semMedia: Partial<typeof validPayload> = { ...validPayload };
    delete semMedia.media;
    const dto = plainToInstance(CreateEventoDto, semMedia);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
