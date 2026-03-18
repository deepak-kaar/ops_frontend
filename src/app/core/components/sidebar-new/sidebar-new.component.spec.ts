import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarNewComponent } from './sidebar-new.component';

describe('SidebarNewComponent', () => {
  let component: SidebarNewComponent;
  let fixture: ComponentFixture<SidebarNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidebarNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
