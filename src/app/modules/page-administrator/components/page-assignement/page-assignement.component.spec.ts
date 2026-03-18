import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAssignementComponent } from './page-assignement.component';

describe('PageAssignementComponent', () => {
  let component: PageAssignementComponent;
  let fixture: ComponentFixture<PageAssignementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageAssignementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageAssignementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
