import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateEventoDto } from './update-evento.dto';
import { tipoEvento } from '@prisma/client';

describe('UpdateEventoDto', () => {
  it('deve validar com sucesso um payload vazio (atualização parcial)', async () => {
    const dto = plainToInstance(UpdateEventoDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar com sucesso campos parciais válidos', async () => {
    const dto = plainToInstance(UpdateEventoDto, {
      descricao: 'Nova descrição do evento com detalhes atualizados.',
      media: ['https://exemplo.com/banner-novo.png'],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve falhar se nomeEvento for menor que 3 caracteres', async () => {
    const dto = plainToInstance(UpdateEventoDto, {
      nomeEvento: 'ab',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'nomeEvento')).toBe(true);
  });

  it('deve falhar se tipoEvento for inválido', async () => {
    const dto = plainToInstance(UpdateEventoDto, {
      tipoEvento: 'INVALIDO_TIPO' as unknown as tipoEvento,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'tipoEvento')).toBe(true);
  });

  it('deve falhar se datas não estiverem no formato ISO 8601', async () => {
    const dto = plainToInstance(UpdateEventoDto, {
      dataInicio: '01/11/2026',
      dataEncerramento: 'amanhã',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'dataInicio')).toBe(true);
    expect(errors.some((e) => e.property === 'dataEncerramento')).toBe(true);
  });

  it('deve falhar se media tiver mais de 10 itens', async () => {
    const dto = plainToInstance(UpdateEventoDto, {
      media: Array(11).fill('https://exemplo.com/imagem.png'),
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'media')).toBe(true);
  });
});
