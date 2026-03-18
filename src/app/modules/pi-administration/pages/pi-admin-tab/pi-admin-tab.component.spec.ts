import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiAdminTabComponent } from './pi-admin-tab.component';

describe('PiAdminTabComponent', () => {
  let component: PiAdminTabComponent;
  let fixture: ComponentFixture<PiAdminTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PiAdminTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PiAdminTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
