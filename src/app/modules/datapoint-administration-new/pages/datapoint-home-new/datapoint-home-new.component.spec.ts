import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatapointHomeNewComponent } from './datapoint-home-new.component';

describe('DatapointHomeNewComponent', () => {
  let component: DatapointHomeNewComponent;
  let fixture: ComponentFixture<DatapointHomeNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatapointHomeNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatapointHomeNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
