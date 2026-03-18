import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebserviceMapTableComponent } from './webservice-map-table.component';

describe('WebserviceMapTableComponent', () => {
  let component: WebserviceMapTableComponent;
  let fixture: ComponentFixture<WebserviceMapTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebserviceMapTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebserviceMapTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
