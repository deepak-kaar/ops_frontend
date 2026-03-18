import { TestBed } from '@angular/core/testing';

import { ActivityEngineService } from './activity-engine.service';

describe('ActivityEngineService', () => {
  let service: ActivityEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
