import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatapointHomeComponent } from './datapoint-home.component';

describe('DatapointHomeComponent', () => {
  let component: DatapointHomeComponent;
  let fixture: ComponentFixture<DatapointHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatapointHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatapointHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
