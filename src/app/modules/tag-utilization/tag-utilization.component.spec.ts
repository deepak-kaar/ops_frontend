import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagUtilizationComponent } from './tag-utilization.component';

describe('TagUtilizationComponent', () => {
  let component: TagUtilizationComponent;
  let fixture: ComponentFixture<TagUtilizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagUtilizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagUtilizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
