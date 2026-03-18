import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebserviceFilterComponent } from './webservice-filter.component';

describe('WebserviceFilterComponent', () => {
  let component: WebserviceFilterComponent;
  let fixture: ComponentFixture<WebserviceFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebserviceFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebserviceFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
