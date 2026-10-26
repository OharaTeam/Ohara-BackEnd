import { Test, TestingModule } from '@nestjs/testing';
import { MembrosService } from './membros.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MembrosService', () => {
  let service: MembrosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembrosService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MembrosService>(MembrosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
