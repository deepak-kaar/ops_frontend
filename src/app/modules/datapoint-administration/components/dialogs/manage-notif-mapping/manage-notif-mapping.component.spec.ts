import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNotifMappingComponent } from './manage-notif-mapping.component';

describe('ManageNotifMappingComponent', () => {
  let component: ManageNotifMappingComponent;
  let fixture: ComponentFixture<ManageNotifMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageNotifMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageNotifMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
