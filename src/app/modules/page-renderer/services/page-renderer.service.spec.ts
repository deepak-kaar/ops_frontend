import { TestBed } from '@angular/core/testing';

import { PageRendererService } from './page-renderer.service';

describe('PageRendererService', () => {
  let service: PageRendererService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageRendererService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
