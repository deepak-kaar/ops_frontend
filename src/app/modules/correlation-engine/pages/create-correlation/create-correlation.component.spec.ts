import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCorrelationComponent } from './create-correlation.component';

describe('CreateCorrelationComponent', () => {
  let component: CreateCorrelationComponent;
  let fixture: ComponentFixture<CreateCorrelationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateCorrelationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCorrelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
