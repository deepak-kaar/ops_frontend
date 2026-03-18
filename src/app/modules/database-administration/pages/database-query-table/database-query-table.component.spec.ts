import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseQueryTableComponent } from './database-query-table.component';

describe('DatabaseQueryTableComponent', () => {
  let component: DatabaseQueryTableComponent;
  let fixture: ComponentFixture<DatabaseQueryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatabaseQueryTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatabaseQueryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
