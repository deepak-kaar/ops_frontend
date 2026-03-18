import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFrequencyComponent } from './manage-frequency.component';

describe('ManageFrequencyComponent', () => {
  let component: ManageFrequencyComponent;
  let fixture: ComponentFixture<ManageFrequencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageFrequencyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFrequencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
