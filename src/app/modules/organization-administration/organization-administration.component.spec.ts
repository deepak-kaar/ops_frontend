import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationAdministrationComponent } from './organization-administration.component';

describe('OrganizationAdministrationComponent', () => {
  let component: OrganizationAdministrationComponent;
  let fixture: ComponentFixture<OrganizationAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrganizationAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
