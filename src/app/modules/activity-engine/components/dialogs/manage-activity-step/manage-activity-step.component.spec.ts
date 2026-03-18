import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageActivityStepComponent } from './manage-activity-step.component';

describe('ManageActivityStepComponent', () => {
  let component: ManageActivityStepComponent;
  let fixture: ComponentFixture<ManageActivityStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageActivityStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageActivityStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
