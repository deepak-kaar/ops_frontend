import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageShiftComponent } from './manage-shift.component';

describe('ManageShiftComponent', () => {
  let component: ManageShiftComponent;
  let fixture: ComponentFixture<ManageShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageShiftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
