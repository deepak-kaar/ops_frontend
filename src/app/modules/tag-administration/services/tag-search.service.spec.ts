import { TestBed } from '@angular/core/testing';

import { TagSearchService } from './tag-search.service';

describe('TagSearchService', () => {
  let service: TagSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
