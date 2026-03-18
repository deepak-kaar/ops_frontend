import { TestBed } from '@angular/core/testing';

import { CorrelationEngineService } from './services/correlation-engine.service';

describe('CorrelationEngineService', () => {
  let service: CorrelationEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CorrelationEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
