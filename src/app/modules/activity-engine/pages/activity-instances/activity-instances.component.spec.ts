import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityInstancesComponent } from './activity-instances.component';

describe('ActivityInstancesComponent', () => {
  let component: ActivityInstancesComponent;
  let fixture: ComponentFixture<ActivityInstancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivityInstancesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityInstancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
