import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageInstanceComponent } from './manage-instance.component';

describe('ManageInstanceComponent', () => {
  let component: ManageInstanceComponent;
  let fixture: ComponentFixture<ManageInstanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageInstanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
