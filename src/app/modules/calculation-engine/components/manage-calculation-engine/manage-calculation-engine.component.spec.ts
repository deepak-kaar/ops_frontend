import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCalculationEngineComponent } from './manage-calculation-engine.component';

describe('ManageCalculationEngineComponent', () => {
  let component: ManageCalculationEngineComponent;
  let fixture: ComponentFixture<ManageCalculationEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageCalculationEngineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCalculationEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
