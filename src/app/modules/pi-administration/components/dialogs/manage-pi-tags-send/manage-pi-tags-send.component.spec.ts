import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePiTagsSendComponent } from './manage-pi-tags-send.component';

describe('ManagePiTagsSendComponent', () => {
  let component: ManagePiTagsSendComponent;
  let fixture: ComponentFixture<ManagePiTagsSendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagePiTagsSendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePiTagsSendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
