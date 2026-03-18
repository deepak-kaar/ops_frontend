import { TestBed } from '@angular/core/testing';

import { CalculationEngineService } from './calculation-engine.service';

describe('CalculationEngineService', () => {
  let service: CalculationEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculationEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
