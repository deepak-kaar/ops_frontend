import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagMappingNewComponent } from './flag-mapping-new.component';

describe('FlagMappingNewComponent', () => {
  let component: FlagMappingNewComponent;
  let fixture: ComponentFixture<FlagMappingNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlagMappingNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlagMappingNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
