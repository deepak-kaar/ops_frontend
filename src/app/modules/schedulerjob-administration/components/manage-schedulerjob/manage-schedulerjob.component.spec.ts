import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSchedulerjobComponent } from './manage-schedulerjob.component';

describe('ManageSchedulerjobComponent', () => {
  let component: ManageSchedulerjobComponent;
  let fixture: ComponentFixture<ManageSchedulerjobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageSchedulerjobComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSchedulerjobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
