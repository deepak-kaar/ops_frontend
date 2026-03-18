import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationEngineTableComponent } from './calculation-engine-table.component';

describe('CalculationEngineTableComponent', () => {
  let component: CalculationEngineTableComponent;
  let fixture: ComponentFixture<CalculationEngineTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalculationEngineTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculationEngineTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
