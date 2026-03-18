import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppManagerComponent } from './apps-manager.component';

describe('AppManagerComponent', () => {
  let component: AppManagerComponent;
  let fixture: ComponentFixture<AppManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
