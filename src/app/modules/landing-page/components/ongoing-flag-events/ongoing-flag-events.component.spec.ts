import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OngoingFlagEventsComponent } from './ongoing-flag-events.component';

describe('OngoingFlagEventsComponent', () => {
  let component: OngoingFlagEventsComponent;
  let fixture: ComponentFixture<OngoingFlagEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OngoingFlagEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OngoingFlagEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
