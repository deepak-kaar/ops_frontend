import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateTagComponent } from './date-tag.component';

describe('DateTagComponent', () => {
  let component: DateTagComponent;
  let fixture: ComponentFixture<DateTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateTagComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
