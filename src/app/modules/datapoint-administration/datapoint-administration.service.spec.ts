import { TestBed } from '@angular/core/testing';

import { DatapointAdministrationService } from './datapoint-administration.service';

describe('DatapointAdministrationService', () => {
  let service: DatapointAdministrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatapointAdministrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
