import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageActivityFmComponent } from './manage-activity-fm.component';

describe('ManageActivityStepComponent', () => {
  let component: ManageActivityFmComponent;
  let fixture: ComponentFixture<ManageActivityFmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageActivityFmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageActivityFmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
