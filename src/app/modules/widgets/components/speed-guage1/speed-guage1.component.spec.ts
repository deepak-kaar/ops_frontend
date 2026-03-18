import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeedGuage1Component } from './speed-guage1.component';

describe('SpeedGuage1Component', () => {
  let component: SpeedGuage1Component;
  let fixture: ComponentFixture<SpeedGuage1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpeedGuage1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeedGuage1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
