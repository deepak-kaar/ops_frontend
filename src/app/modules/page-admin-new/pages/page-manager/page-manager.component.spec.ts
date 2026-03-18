import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageManagerComponent } from './page-manager.component';

describe('PageManagerComponent', () => {
  let component: PageManagerComponent;
  let fixture: ComponentFixture<PageManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
