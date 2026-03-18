import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerjobTableComponent } from './schedulerjob-table.component';

describe('SchedulerjobTableComponent', () => {
  let component: SchedulerjobTableComponent;
  let fixture: ComponentFixture<SchedulerjobTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchedulerjobTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulerjobTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
