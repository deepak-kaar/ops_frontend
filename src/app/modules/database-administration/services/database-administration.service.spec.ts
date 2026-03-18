import { TestBed } from '@angular/core/testing';

import { DatabaseAdministrationService } from './database-administration.service';

describe('DatabaseAdministrationService', () => {
  let service: DatabaseAdministrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabaseAdministrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
