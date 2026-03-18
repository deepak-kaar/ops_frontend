import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MdeComponent } from './mde.component';

describe('MdeComponent', () => {
  let component: MdeComponent;
  let fixture: ComponentFixture<MdeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MdeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MdeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
