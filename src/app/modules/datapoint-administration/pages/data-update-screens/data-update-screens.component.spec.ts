import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataUpdateScreensComponent } from './data-update-screens.component';

describe('DataUpdateScreensComponent', () => {
  let component: DataUpdateScreensComponent;
  let fixture: ComponentFixture<DataUpdateScreensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataUpdateScreensComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataUpdateScreensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
