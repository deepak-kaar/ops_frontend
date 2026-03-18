import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDatasEditFormNewComponent } from './entity-datas-edit-form-new.component';

describe('EntityDatasEditFormNewComponent', () => {
  let component: EntityDatasEditFormNewComponent;
  let fixture: ComponentFixture<EntityDatasEditFormNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityDatasEditFormNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityDatasEditFormNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
