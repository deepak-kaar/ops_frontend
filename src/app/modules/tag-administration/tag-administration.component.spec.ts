import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagAdministrationComponent } from './tag-administration.component';

describe('TagAdministrationComponent', () => {
  let component: TagAdministrationComponent;
  let fixture: ComponentFixture<TagAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
