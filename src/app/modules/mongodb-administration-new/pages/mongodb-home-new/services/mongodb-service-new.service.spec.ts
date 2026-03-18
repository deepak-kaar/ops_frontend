import { TestBed } from '@angular/core/testing';
import { MongodbServiceNewService } from './mongodb-service-new.service';

describe('MongodbServiceNewService', () => {
  let service: MongodbServiceNewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MongodbServiceNewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
