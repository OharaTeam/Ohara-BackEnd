import { Test, TestingModule } from '@nestjs/testing';
import { CargosService } from './cargos.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CargosService', () => {
  let service: CargosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CargosService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CargosService>(CargosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
