import { TestBed } from '@angular/core/testing';

import { WebserviceAdministrationService } from './webservice-administration.service';

describe('WebserviceAdministrationService', () => {
  let service: WebserviceAdministrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebserviceAdministrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
