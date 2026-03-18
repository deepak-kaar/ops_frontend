import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasConfigComponent } from './canvas-config.component';

describe('CanvasConfigComponent', () => {
  let component: CanvasConfigComponent;
  let fixture: ComponentFixture<CanvasConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CanvasConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
