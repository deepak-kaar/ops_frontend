import { TestBed } from '@angular/core/testing';

import { ConfigAdministrationService } from './config-administration.service';

describe('ConfigAdministrationService', () => {
  let service: ConfigAdministrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigAdministrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
