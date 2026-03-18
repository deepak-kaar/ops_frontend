import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportimageTableNewComponent } from './reportimage-table-new.component';

describe('ReportimageTableNewComponent', () => {
  let component: ReportimageTableNewComponent;
  let fixture: ComponentFixture<ReportimageTableNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportimageTableNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportimageTableNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
