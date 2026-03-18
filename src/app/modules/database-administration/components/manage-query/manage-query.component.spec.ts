import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageQueryComponent } from './manage-query.component';

describe('ManageQueryComponent', () => {
  let component: ManageQueryComponent;
  let fixture: ComponentFixture<ManageQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageQueryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
