import { TestBed } from '@angular/core/testing';

import { TagUtilizationService } from './tag-utilization.service';

describe('TagUtilizationService', () => {
  let service: TagUtilizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagUtilizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
