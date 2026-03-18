import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAttributeComponent } from './create-attribute.component';

describe('CreateAttributeComponent', () => {
  let component: CreateAttributeComponent;
  let fixture: ComponentFixture<CreateAttributeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateAttributeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
