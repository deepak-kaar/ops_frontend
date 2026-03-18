import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityStepsComponent } from './activity-steps.component';

describe('ActivityStepsComponent', () => {
  let component: ActivityStepsComponent;
  let fixture: ComponentFixture<ActivityStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivityStepsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
