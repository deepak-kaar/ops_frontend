import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEventMappingComponent } from './manage-event-mapping.component';

describe('ManageEventMappingComponent', () => {
  let component: ManageEventMappingComponent;
  let fixture: ComponentFixture<ManageEventMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageEventMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageEventMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
