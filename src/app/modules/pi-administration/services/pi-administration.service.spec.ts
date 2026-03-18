import { TestBed } from '@angular/core/testing';

import { PiAdministrationService } from './services/pi-administration.service';

describe('PiAdministrationService', () => {
  let service: PiAdministrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PiAdministrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
