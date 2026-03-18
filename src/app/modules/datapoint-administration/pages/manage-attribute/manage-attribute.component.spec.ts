import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAttributeComponent } from './manage-attribute.component';

describe('ManageAttributeComponent', () => {
  let component: ManageAttributeComponent;
  let fixture: ComponentFixture<ManageAttributeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageAttributeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
