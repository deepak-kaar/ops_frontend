import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUploadComponent } from './manage-upload.component';

describe('ManageUploadComponent', () => {
  let component: ManageUploadComponent;
  let fixture: ComponentFixture<ManageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
