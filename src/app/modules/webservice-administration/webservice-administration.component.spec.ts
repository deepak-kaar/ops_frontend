import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebserviceAdministrationComponent } from './webservice-administration.component';

describe('WebserviceAdministrationComponent', () => {
  let component: WebserviceAdministrationComponent;
  let fixture: ComponentFixture<WebserviceAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebserviceAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebserviceAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
