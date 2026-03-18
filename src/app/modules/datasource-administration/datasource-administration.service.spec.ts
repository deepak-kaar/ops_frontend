import { TestBed } from '@angular/core/testing';

import { DatasourceAdministrationService } from './datasource-administration.service';

describe('DatasourceAdministrationService', () => {
  let service: DatasourceAdministrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatasourceAdministrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
