import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageOrgComponent } from './manage-org.component';

describe('ManageOrgComponent', () => {
  let component: ManageOrgComponent;
  let fixture: ComponentFixture<ManageOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageOrgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
