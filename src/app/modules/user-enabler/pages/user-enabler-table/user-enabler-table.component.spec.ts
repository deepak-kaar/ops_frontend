import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEnablerTableComponent } from './user-enabler-table.component';

describe('UserEnablerTableComponent', () => {
  let component: UserEnablerTableComponent;
  let fixture: ComponentFixture<UserEnablerTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserEnablerTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEnablerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
