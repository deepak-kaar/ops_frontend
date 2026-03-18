import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShBarComponent } from './sh-bar.component';

describe('ShBarComponent', () => {
  let component: ShBarComponent;
  let fixture: ComponentFixture<ShBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
