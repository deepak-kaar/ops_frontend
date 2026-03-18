import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvBarComponent } from './sv-bar.component';

describe('SvBarComponent', () => {
  let component: SvBarComponent;
  let fixture: ComponentFixture<SvBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SvBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SvBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
