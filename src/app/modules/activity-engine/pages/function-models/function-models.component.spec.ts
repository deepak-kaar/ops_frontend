import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionModelsComponent } from './function-models.component';

describe('FunctionModelsComponent', () => {
  let component: FunctionModelsComponent;
  let fixture: ComponentFixture<FunctionModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FunctionModelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FunctionModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
