import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationEngineMappingComponent } from './calculation-engine-mapping.component';

describe('CalculationEngineMappingComponent', () => {
  let component: CalculationEngineMappingComponent;
  let fixture: ComponentFixture<CalculationEngineMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalculationEngineMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculationEngineMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
