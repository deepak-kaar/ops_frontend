import { TestBed } from '@angular/core/testing';

import { TagUtilizationSearchService } from './tag-utilization-search.service';

describe('TagUtilizationSearchService', () => {
  let service: TagUtilizationSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagUtilizationSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
