import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFlagMappingComponent } from './manage-flag-mapping.component';

describe('ManageFlagMappingComponent', () => {
  let component: ManageFlagMappingComponent;
  let fixture: ComponentFixture<ManageFlagMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageFlagMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFlagMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
