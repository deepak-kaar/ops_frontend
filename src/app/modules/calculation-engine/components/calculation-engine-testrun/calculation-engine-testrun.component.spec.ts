import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationEngineTestrunComponent } from './calculation-engine-testrun.component';

describe('CalculationEngineTestrunComponent', () => {
  let component: CalculationEngineTestrunComponent;
  let fixture: ComponentFixture<CalculationEngineTestrunComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalculationEngineTestrunComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculationEngineTestrunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
