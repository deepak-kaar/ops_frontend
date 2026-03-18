import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsNewComponent } from './notifications-new.component';

describe('NotificationsNewComponent', () => {
  let component: NotificationsNewComponent;
  let fixture: ComponentFixture<NotificationsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationsNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
