import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfStatusComponent } from './wf-status.component';

describe('WfStatusComponent', () => {
  let component: WfStatusComponent;
  let fixture: ComponentFixture<WfStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WfStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WfStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
