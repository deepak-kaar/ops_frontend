import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiAdministrationComponent } from './pi-administration.component';

describe('PiAdministrationComponent', () => {
  let component: PiAdministrationComponent;
  let fixture: ComponentFixture<PiAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PiAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PiAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
