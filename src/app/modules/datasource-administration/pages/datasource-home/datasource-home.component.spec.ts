import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasourceHomeComponent } from './datasource-home.component';

describe('DatasourceHomeComponent', () => {
  let component: DatasourceHomeComponent;
  let fixture: ComponentFixture<DatasourceHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatasourceHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasourceHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
