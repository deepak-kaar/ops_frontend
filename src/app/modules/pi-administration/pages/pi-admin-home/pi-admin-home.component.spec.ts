import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiAdminHomeComponent } from './pi-admin-home.component';

describe('PiAdminHomeComponent', () => {
  let component: PiAdminHomeComponent;
  let fixture: ComponentFixture<PiAdminHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PiAdminHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PiAdminHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
