import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatapointAdministrationComponent } from './datapoint-administration.component';

describe('DatapointAdministrationComponent', () => {
  let component: DatapointAdministrationComponent;
  let fixture: ComponentFixture<DatapointAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatapointAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatapointAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
