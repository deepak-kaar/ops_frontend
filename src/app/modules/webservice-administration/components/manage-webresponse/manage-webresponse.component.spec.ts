import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageWebresponseComponent } from './manage-webresponse.component';

describe('ManageWebresponseComponent', () => {
  let component: ManageWebresponseComponent;
  let fixture: ComponentFixture<ManageWebresponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageWebresponseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageWebresponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
