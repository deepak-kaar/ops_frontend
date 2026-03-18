import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigAdministrationComponent } from './config-administration.component';

describe('ConfigAdministrationComponent', () => {
  let component: ConfigAdministrationComponent;
  let fixture: ComponentFixture<ConfigAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
