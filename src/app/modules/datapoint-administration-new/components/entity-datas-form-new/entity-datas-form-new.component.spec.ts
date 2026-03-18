import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDatasFormNewComponent } from './entity-datas-form-new.component';

describe('EntityDatasFormNewComponent', () => {
  let component: EntityDatasFormNewComponent;
  let fixture: ComponentFixture<EntityDatasFormNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityDatasFormNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityDatasFormNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
