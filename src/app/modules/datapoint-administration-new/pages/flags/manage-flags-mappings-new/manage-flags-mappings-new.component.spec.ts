import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFlagsMappingsNewComponent } from './manage-flags-mappings-new.component';

describe('ManageFlagsMappingsNewComponent', () => {
  let component: ManageFlagsMappingsNewComponent;
  let fixture: ComponentFixture<ManageFlagsMappingsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageFlagsMappingsNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFlagsMappingsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
