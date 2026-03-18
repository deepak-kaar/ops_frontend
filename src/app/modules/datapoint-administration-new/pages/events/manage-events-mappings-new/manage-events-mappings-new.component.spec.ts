import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEventsMappingsNewComponent } from './manage-events-mappings-new.component';

describe('ManageEventsMappingsNewComponent', () => {
  let component: ManageEventsMappingsNewComponent;
  let fixture: ComponentFixture<ManageEventsMappingsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageEventsMappingsNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageEventsMappingsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
