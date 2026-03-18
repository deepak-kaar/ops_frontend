import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseAdministrationComponent } from './database-administration.component';

describe('DatabaseAdministrationComponent', () => {
  let component: DatabaseAdministrationComponent;
  let fixture: ComponentFixture<DatabaseAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatabaseAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatabaseAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
