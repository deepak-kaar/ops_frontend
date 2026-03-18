import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasNewComponent } from './datas-new.component';

describe('DatasNewComponent', () => {
  let component: DatasNewComponent;
  let fixture: ComponentFixture<DatasNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatasNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
