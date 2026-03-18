import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrelationEngineComponent } from './correlation-engine.component';

describe('CorrelationEngineComponent', () => {
  let component: CorrelationEngineComponent;
  let fixture: ComponentFixture<CorrelationEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorrelationEngineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrelationEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
