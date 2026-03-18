import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRolesManagerComponent } from './app-roles-manager.component';

describe('AppRolesManagerComponent', () => {
  let component: AppRolesManagerComponent;
  let fixture: ComponentFixture<AppRolesManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppRolesManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRolesManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
