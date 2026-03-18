import { TestBed } from '@angular/core/testing';

import { TagAdministrationService } from './tag-administration.service';

describe('TagAdministrationService', () => {
  let service: TagAdministrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagAdministrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
