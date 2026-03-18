import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityTemplatesComponent } from './activity-templates.component';

describe('ActivityTemplatesComponent', () => {
  let component: ActivityTemplatesComponent;
  let fixture: ComponentFixture<ActivityTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivityTemplatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
