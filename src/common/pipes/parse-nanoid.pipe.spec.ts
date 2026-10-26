import { ParseNanoIdPipe } from './parse-nanoid.pipe';
import { BadRequestException } from '@nestjs/common';
import { generateNanoId } from '../utils/nanoid.util';

describe('ParseNanoIdPipe', () => {
  let pipe: ParseNanoIdPipe;

  beforeEach(() => {
    pipe = new ParseNanoIdPipe();
  });

  it('deve aceitar um NanoID válido de 10 caracteres', () => {
    const validNanoId = generateNanoId();
    expect(validNanoId.length).toBe(10);
    expect(pipe.transform(validNanoId)).toBe(validNanoId);
  });

  it('deve lançar BadRequestException para UUIDs legados', () => {
    const uuid = '62ba49d4-003a-45b5-98e3-b548e853e8b2';
    expect(() => pipe.transform(uuid)).toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException para strings menores que 10 caracteres', () => {
    expect(() => pipe.transform('abc123')).toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException para strings maiores que 10 caracteres', () => {
    expect(() => pipe.transform('12345678901')).toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException para caracteres especiais inválidos', () => {
    expect(() => pipe.transform('abc!@#1234')).toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException para valores vazios ou nulos', () => {
    expect(() => pipe.transform('')).toThrow(BadRequestException);
    expect(() => pipe.transform(null as any)).toThrow(BadRequestException);
  });
});
