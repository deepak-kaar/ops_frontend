import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagHomeComponent } from './tag-home.component';

describe('ConfigHomeComponent', () => {
  let component: TagHomeComponent;
  let fixture: ComponentFixture<TagHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
