import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDefaultComponent } from './manage-default.component';

describe('ManageDefaultComponent', () => {
  let component: ManageDefaultComponent;
  let fixture: ComponentFixture<ManageDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageDefaultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
