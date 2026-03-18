import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateConfirmationComponent } from './template-confirmation.component';

describe('TemplateConfirmationComponent', () => {
  let component: TemplateConfirmationComponent;
  let fixture: ComponentFixture<TemplateConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TemplateConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
