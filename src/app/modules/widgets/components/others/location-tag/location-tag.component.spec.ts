import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationTagComponent } from './location-tag.component';

describe('LocationTagComponent', () => {
  let component: LocationTagComponent;
  let fixture: ComponentFixture<LocationTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LocationTagComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
