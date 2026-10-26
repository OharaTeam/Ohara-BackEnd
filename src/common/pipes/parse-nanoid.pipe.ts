import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { NANOID_REGEX } from '../utils/nanoid.util';

@Injectable()
export class ParseNanoIdPipe implements PipeTransform<string, string> {
  transform(value: string, metadata?: ArgumentMetadata): string {
    if (!value || typeof value !== 'string' || !NANOID_REGEX.test(value)) {
      throw new BadRequestException(
        'Identificador inválido: esperado um NanoID de 10 caracteres alfanuméricos.',
      );
    }
    return value;
  }
}
