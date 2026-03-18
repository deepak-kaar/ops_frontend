import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { screenGuardGuard } from './screen-guard.guard';

describe('screenGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => screenGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
