import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasourceAdministrationComponent } from './datasource-administration.component';

describe('DatasourceAdministrationComponent', () => {
  let component: DatasourceAdministrationComponent;
  let fixture: ComponentFixture<DatasourceAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatasourceAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasourceAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
