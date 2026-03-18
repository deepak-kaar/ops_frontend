import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportGenAdministrationComponent } from './report-gen-administration.component';

describe('ReportGenAdministrationComponent', () => {
  let component: ReportGenAdministrationComponent;
  let fixture: ComponentFixture<ReportGenAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportGenAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportGenAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
