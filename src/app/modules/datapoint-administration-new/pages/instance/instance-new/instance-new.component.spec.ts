import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstanceNewComponent } from './instance-new.component';

describe('InstanceNewComponent', () => {
  let component: InstanceNewComponent;
  let fixture: ComponentFixture<InstanceNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstanceNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstanceNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
