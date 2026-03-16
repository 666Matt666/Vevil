import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getHello should return welcome message', () => {
    expect(service.getHello()).toBe('Welcome to Vevil System API!');
  });

  it('getHealth should return status ok', () => {
    expect(service.getHealth()).toEqual({ status: 'ok' });
  });
});
