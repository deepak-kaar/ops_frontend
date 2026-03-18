import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFlagComponent } from './manage-flag.component';

describe('ManageFlagComponent', () => {
  let component: ManageFlagComponent;
  let fixture: ComponentFixture<ManageFlagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageFlagComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFlagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
