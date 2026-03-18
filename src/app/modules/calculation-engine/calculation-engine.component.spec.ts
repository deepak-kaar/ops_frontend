import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationEngineComponent } from './calculation-engine.component';

describe('CalculationEngineComponent', () => {
  let component: CalculationEngineComponent;
  let fixture: ComponentFixture<CalculationEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalculationEngineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculationEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
