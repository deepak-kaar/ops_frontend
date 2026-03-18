import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMappingComponent } from './manage-mapping.component';

describe('ManageMappingComponent', () => {
  let component: ManageMappingComponent;
  let fixture: ComponentFixture<ManageMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
