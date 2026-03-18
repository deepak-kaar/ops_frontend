import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDatasourceComponent } from './manage-datasource.component';

describe('ManageDatasourceComponent', () => {
  let component: ManageDatasourceComponent;
  let fixture: ComponentFixture<ManageDatasourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageDatasourceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageDatasourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
