import { TestBed } from '@angular/core/testing';

import { JsonTreeBuilderService } from './json-tree-builder.service';

describe('JsonTreeBuilderService', () => {
  let service: JsonTreeBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonTreeBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
