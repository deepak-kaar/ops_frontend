import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageActivityInstanceComponent } from './manage-activity-instance.component';

describe('ManageActivityInstanceComponent', () => {
  let component: ManageActivityInstanceComponent;
  let fixture: ComponentFixture<ManageActivityInstanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageActivityInstanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageActivityInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
