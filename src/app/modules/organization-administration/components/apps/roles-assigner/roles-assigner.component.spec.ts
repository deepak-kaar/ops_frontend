import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesAssignerComponent } from './roles-assigner.component';

describe('RolesAssignerComponent', () => {
  let component: RolesAssignerComponent;
  let fixture: ComponentFixture<RolesAssignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RolesAssignerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesAssignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
