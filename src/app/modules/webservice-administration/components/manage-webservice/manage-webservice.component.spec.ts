import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageWebservicesComponent } from './manage-webservice.component';

describe('ManageWebservicesComponent', () => {
  let component: ManageWebservicesComponent;
  let fixture: ComponentFixture<ManageWebservicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageWebservicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageWebservicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
