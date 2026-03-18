import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportimageHomeComponent } from './reportimage-home.component';

describe('ReportimageHomeComponent', () => {
  let component: ReportimageHomeComponent;
  let fixture: ComponentFixture<ReportimageHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportimageHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportimageHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
