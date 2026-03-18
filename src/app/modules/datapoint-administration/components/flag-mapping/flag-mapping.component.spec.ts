import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagMappingComponent } from './flag-mapping.component';

describe('FlagMappingComponent', () => {
  let component: FlagMappingComponent;
  let fixture: ComponentFixture<FlagMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlagMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlagMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
