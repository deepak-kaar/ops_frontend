import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportimageHomeNewComponent } from './reportimage-home-new.component';

describe('ReportimageHomeNewComponent', () => {
  let component: ReportimageHomeNewComponent;
  let fixture: ComponentFixture<ReportimageHomeNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportimageHomeNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportimageHomeNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
