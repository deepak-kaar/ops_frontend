import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageActivityTemplateComponent } from './manage-activity-template.component';

describe('ManageActivityTemplateComponent', () => {
  let component: ManageActivityTemplateComponent;
  let fixture: ComponentFixture<ManageActivityTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageActivityTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageActivityTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
