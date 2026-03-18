import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopbarNewComponent } from './topbar-new.component';

describe('TopbarNewComponent', () => {
  let component: TopbarNewComponent;
  let fixture: ComponentFixture<TopbarNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopbarNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopbarNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
