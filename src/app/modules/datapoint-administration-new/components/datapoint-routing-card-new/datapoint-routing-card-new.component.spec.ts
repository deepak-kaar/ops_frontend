import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatapointRoutingCardNewComponent } from './datapoint-routing-card-new.component';

describe('DatapointRoutingCardNewComponent', () => {
  let component: DatapointRoutingCardNewComponent;
  let fixture: ComponentFixture<DatapointRoutingCardNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatapointRoutingCardNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatapointRoutingCardNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
