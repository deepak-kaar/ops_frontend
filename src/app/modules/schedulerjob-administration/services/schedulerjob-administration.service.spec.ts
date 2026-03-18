import { TestBed } from '@angular/core/testing';

import { SchedulerjobAdministrationService } from './schedulerjob-administration.service';

describe('SchedulerjobAdministrationService', () => {
  let service: SchedulerjobAdministrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SchedulerjobAdministrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
