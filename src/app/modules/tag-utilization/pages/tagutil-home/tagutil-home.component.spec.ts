import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagUtilHomeComponent } from './tagutil-home.component';

describe('ConfigHomeComponent', () => {
  let component: TagUtilHomeComponent;
  let fixture: ComponentFixture<TagUtilHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagUtilHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagUtilHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
