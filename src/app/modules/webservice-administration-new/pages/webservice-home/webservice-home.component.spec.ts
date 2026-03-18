import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebserviceHomeComponent } from './webservice-home.component';

describe('WebserviceHomeComponent', () => {
  let component: WebserviceHomeComponent;
  let fixture: ComponentFixture<WebserviceHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebserviceHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebserviceHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
