import { TestBed } from '@angular/core/testing';

import { PageAdministratorService } from './page-administrator.service';

describe('PageAdministratorService', () => {
  let service: PageAdministratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageAdministratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
