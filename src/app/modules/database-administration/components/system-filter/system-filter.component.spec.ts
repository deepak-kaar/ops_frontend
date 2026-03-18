import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemFilterComponent } from './system-filter.component';

describe('SystemFilterComponent', () => {
  let component: SystemFilterComponent;
  let fixture: ComponentFixture<SystemFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SystemFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
