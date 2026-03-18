import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApexsplineComponent } from './apexspline.component';

describe('ApexsplineComponent', () => {
  let component: ApexsplineComponent;
  let fixture: ComponentFixture<ApexsplineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApexsplineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApexsplineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
