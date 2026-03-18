import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNotificationsNewComponent } from './manage-notifications-new.component';

describe('ManageNotificationsNewComponent', () => {
  let component: ManageNotificationsNewComponent;
  let fixture: ComponentFixture<ManageNotificationsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageNotificationsNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageNotificationsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
