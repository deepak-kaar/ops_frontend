import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerjobHomeComponent } from './schedulerjob-home.component';

describe('SchedulerjobHomeComponent', () => {
  let component: SchedulerjobHomeComponent;
  let fixture: ComponentFixture<SchedulerjobHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchedulerjobHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulerjobHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
