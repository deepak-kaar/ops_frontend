import { TestBed } from '@angular/core/testing';

import { ReportGenAdministrationService } from './report-gen-administration.service';

describe('ReportGenAdministrationService', () => {
  let service: ReportGenAdministrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportGenAdministrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
