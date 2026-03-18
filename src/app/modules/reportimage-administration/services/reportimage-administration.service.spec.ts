import { TestBed } from '@angular/core/testing';

import { ReportimageAdministrationService } from './reportimage-administration.service';

describe('ReportimageAdministrationService', () => {
  let service: ReportimageAdministrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportimageAdministrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
