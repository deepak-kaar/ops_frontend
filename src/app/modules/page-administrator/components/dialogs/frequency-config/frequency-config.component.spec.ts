import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequencyConfigComponent } from './frequency-config.component';

describe('FrequencyConfigComponent', () => {
  let component: FrequencyConfigComponent;
  let fixture: ComponentFixture<FrequencyConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FrequencyConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrequencyConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
