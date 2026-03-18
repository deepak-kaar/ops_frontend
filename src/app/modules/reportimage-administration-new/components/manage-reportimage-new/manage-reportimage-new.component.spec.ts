import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageReportimageNewComponent } from './manage-reportimage-new.component';

describe('ManageReportimageNewComponent', () => {
  let component: ManageReportimageNewComponent;
  let fixture: ComponentFixture<ManageReportimageNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageReportimageNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageReportimageNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
