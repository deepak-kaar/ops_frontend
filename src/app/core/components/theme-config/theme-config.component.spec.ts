import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeConfigComponent } from './theme-config.component';

describe('ThemeConfigComponent', () => {
  let component: ThemeConfigComponent;
  let fixture: ComponentFixture<ThemeConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThemeConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
