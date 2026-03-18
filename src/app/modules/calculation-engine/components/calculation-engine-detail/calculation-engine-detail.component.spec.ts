import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationEngineDetailComponent } from './calculation-engine-detail.component';

describe('CalculationEngineDetailComponent', () => {
  let component: CalculationEngineDetailComponent;
  let fixture: ComponentFixture<CalculationEngineDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalculationEngineDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculationEngineDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
