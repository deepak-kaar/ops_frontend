import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityNewComponent } from './entity-new.component';

describe('EntityNewComponent', () => {
  let component: EntityNewComponent;
  let fixture: ComponentFixture<EntityNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
