import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeedGuageComponent } from './speed-guage.component';

describe('SpeedGuageComponent', () => {
  let component: SpeedGuageComponent;
  let fixture: ComponentFixture<SpeedGuageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpeedGuageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeedGuageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
