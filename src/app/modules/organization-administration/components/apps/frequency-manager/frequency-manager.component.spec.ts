import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequencyManagerComponent } from './frequency-manager.component';

describe('FrequencyManagerComponent', () => {
  let component: FrequencyManagerComponent;
  let fixture: ComponentFixture<FrequencyManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FrequencyManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrequencyManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
