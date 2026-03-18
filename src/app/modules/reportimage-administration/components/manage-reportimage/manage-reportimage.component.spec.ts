import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageReportimageComponent } from './manage-reportimage.component';

describe('ManageReportimageComponent', () => {
  let component: ManageReportimageComponent;
  let fixture: ComponentFixture<ManageReportimageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageReportimageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageReportimageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
