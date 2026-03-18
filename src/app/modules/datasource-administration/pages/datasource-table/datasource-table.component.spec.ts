import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasourceTableComponent } from './datasource-table.component';

describe('DatasourceTableComponent', () => {
  let component: DatasourceTableComponent;
  let fixture: ComponentFixture<DatasourceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatasourceTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasourceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
