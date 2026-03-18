import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagsNewComponent } from './flags-new.component';

describe('FlagsNewComponent', () => {
  let component: FlagsNewComponent;
  let fixture: ComponentFixture<FlagsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlagsNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlagsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
