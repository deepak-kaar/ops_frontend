import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebserviceTableComponent } from './webservice-table.component';

describe('WebserviceTableComponent', () => {
  let component: WebserviceTableComponent;
  let fixture: ComponentFixture<WebserviceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebserviceTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebserviceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
