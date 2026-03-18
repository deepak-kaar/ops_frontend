import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityEngineComponent } from './activity-engine.component';

describe('ActivityEngineComponent', () => {
  let component: ActivityEngineComponent;
  let fixture: ComponentFixture<ActivityEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivityEngineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
