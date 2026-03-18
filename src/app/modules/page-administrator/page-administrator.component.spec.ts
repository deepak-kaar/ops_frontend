import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAdministratorComponent } from './page-administrator.component';

describe('PageAdministratorComponent', () => {
  let component: PageAdministratorComponent;
  let fixture: ComponentFixture<PageAdministratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageAdministratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageAdministratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
