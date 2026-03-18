import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFlagComponent } from './create-flag.component';

describe('CreateFlagComponent', () => {
  let component: CreateFlagComponent;
  let fixture: ComponentFixture<CreateFlagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateFlagComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFlagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
