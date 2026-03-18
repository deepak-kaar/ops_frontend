/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UserEnablerService } from './user-enabler.service';

describe('Service: UserEnabler', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserEnablerService]
    });
  });

  it('should ...', inject([UserEnablerService], (service: UserEnablerService) => {
    expect(service).toBeTruthy();
  }));
});
