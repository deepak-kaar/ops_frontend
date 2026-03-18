import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenGuardDisplayComponent } from './screen-guard-display.component';

describe('ScreenGuardDisplayComponent', () => {
  let component: ScreenGuardDisplayComponent;
  let fixture: ComponentFixture<ScreenGuardDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenGuardDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenGuardDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
