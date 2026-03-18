import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportimageTableComponent } from './reportimage-table.component';

describe('ReportimageTableComponent', () => {
  let component: ReportimageTableComponent;
  let fixture: ComponentFixture<ReportimageTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportimageTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportimageTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
