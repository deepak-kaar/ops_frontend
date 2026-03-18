import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifMappingComponent } from './notif-mapping.component';

describe('NotifMappingComponent', () => {
  let component: NotifMappingComponent;
  let fixture: ComponentFixture<NotifMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotifMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotifMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
