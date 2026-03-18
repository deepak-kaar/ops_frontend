import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationMappingNewComponent } from './notification-mapping-new.component';

describe('NotificationMappingNewComponent', () => {
  let component: NotificationMappingNewComponent;
  let fixture: ComponentFixture<NotificationMappingNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationMappingNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationMappingNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
