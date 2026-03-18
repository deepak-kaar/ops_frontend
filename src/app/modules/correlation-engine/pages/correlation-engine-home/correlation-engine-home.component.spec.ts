import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrelationEngineHomeComponent } from './correlation-engine-home.component';

describe('CorrelationEngineHomeComponent', () => {
  let component: CorrelationEngineHomeComponent;
  let fixture: ComponentFixture<CorrelationEngineHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorrelationEngineHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrelationEngineHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
