import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNotificationsMappingsNewComponent } from './manage-notifications-mappings-new.component';

describe('ManageNotificationsMappingsNewComponent', () => {
  let component: ManageNotificationsMappingsNewComponent;
  let fixture: ComponentFixture<ManageNotificationsMappingsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageNotificationsMappingsNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageNotificationsMappingsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
