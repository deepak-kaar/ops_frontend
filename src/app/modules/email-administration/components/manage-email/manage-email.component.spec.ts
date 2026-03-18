import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEmailComponent } from './manage-email.component';

describe('ManageEmailComponent', () => {
  let component: ManageEmailComponent;
  let fixture: ComponentFixture<ManageEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageEmailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
