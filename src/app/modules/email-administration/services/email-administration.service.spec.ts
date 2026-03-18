import { TestBed } from '@angular/core/testing';

import { EmailAdministrationService } from './email-administration.service';

describe('EmailAdministrationService', () => {
  let service: EmailAdministrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailAdministrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
