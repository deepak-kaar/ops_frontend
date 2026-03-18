import { TestBed } from '@angular/core/testing';

import { SystemFilterService } from './system-filter.service';

describe('SystemFilterService', () => {
  let service: SystemFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
