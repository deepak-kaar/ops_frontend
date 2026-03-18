import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageWfstepComponent } from './manage-wfstep.component';

describe('ManageWfstepComponent', () => {
  let component: ManageWfstepComponent;
  let fixture: ComponentFixture<ManageWfstepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageWfstepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageWfstepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
