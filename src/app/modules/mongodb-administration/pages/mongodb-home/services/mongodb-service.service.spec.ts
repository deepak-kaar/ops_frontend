/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MongodbServiceService } from './mongodb-service.service';

describe('Service: MongodbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MongodbServiceService]
    });
  });

  it('should ...', inject([MongodbServiceService], (service: MongodbServiceService) => {
    expect(service).toBeTruthy();
  }));
});
