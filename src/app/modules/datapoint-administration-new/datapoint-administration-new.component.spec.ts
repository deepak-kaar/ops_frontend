import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatapointAdministrationNewComponent } from './datapoint-administration-new.component';

describe('DatapointAdministrationNewComponent', () => {
  let component: DatapointAdministrationNewComponent;
  let fixture: ComponentFixture<DatapointAdministrationNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatapointAdministrationNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatapointAdministrationNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
