import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerjobAdministrationComponent } from './schedulerjob-administration.component';

describe('SchedulerjobAdministrationComponent', () => {
  let component: SchedulerjobAdministrationComponent;
  let fixture: ComponentFixture<SchedulerjobAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchedulerjobAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulerjobAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
