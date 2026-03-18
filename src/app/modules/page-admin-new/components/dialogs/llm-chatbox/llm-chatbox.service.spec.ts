import { TestBed } from '@angular/core/testing';

import { LlmChatboxService } from './llm-chatbox.service';

describe('LlmChatboxService', () => {
  let service: LlmChatboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LlmChatboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
