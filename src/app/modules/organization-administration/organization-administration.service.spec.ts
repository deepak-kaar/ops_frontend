import { TestBed } from '@angular/core/testing';

import { OrganizationAdministrationService } from './organization-administration.service';

describe('OrganizationAdministrationService', () => {
  let service: OrganizationAdministrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationAdministrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
