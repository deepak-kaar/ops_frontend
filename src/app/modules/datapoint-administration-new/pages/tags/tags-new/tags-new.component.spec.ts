import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsNewComponent } from './tags-new.component';

describe('TagsNewComponent', () => {
  let component: TagsNewComponent;
  let fixture: ComponentFixture<TagsNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagsNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
