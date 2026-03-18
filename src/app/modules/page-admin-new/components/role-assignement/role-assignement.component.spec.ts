import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleAssignementComponent } from './role-assignement.component';

describe('RoleAssignementComponent', () => {
  let component: RoleAssignementComponent;
  let fixture: ComponentFixture<RoleAssignementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoleAssignementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleAssignementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
