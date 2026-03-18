import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveDirectoryComponent } from './active-directory.component';

describe('ActiveDirectoryComponent', () => {
  let component: ActiveDirectoryComponent;
  let fixture: ComponentFixture<ActiveDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActiveDirectoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
