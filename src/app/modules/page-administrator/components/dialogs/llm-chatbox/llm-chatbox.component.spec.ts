import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LlmChatboxComponent } from './llm-chatbox.component';

describe('LlmChatboxComponent', () => {
  let component: LlmChatboxComponent;
  let fixture: ComponentFixture<LlmChatboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LlmChatboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LlmChatboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
