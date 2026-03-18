import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseMappingTableComponent } from './database-mapping-table.component';

describe('DatabaseMappingTableComponent', () => {
  let component: DatabaseMappingTableComponent;
  let fixture: ComponentFixture<DatabaseMappingTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatabaseMappingTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatabaseMappingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
