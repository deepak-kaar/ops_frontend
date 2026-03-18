import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageMappingComponent } from './page-mapping.component';

describe('PageMappingComponent', () => {
  let component: PageMappingComponent;
  let fixture: ComponentFixture<PageMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
