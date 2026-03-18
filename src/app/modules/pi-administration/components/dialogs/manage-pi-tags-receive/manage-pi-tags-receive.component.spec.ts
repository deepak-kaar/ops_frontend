import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePiTagsReceiveComponent } from './manage-pi-tags-receive.component';

describe('ManagePiTagsReceiveComponent', () => {
  let component: ManagePiTagsReceiveComponent;
  let fixture: ComponentFixture<ManagePiTagsReceiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagePiTagsReceiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePiTagsReceiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
