import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftsManagerComponent } from './shifts-manager.component';

describe('ShiftsManagerComponent', () => {
  let component: ShiftsManagerComponent;
  let fixture: ComponentFixture<ShiftsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShiftsManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
