import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUserEnablerComponent } from './manage-user-enabler.component';

describe('ManageUserEnablerComponent', () => {
  let component: ManageUserEnablerComponent;
  let fixture: ComponentFixture<ManageUserEnablerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageUserEnablerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageUserEnablerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
