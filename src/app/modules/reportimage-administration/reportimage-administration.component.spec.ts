import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportimageAdministrationComponent } from './reportimage-administration.component';

describe('ReportimageAdministrationComponent', () => {
  let component: ReportimageAdministrationComponent;
  let fixture: ComponentFixture<ReportimageAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportimageAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportimageAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
