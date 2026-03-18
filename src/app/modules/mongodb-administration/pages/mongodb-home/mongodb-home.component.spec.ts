import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MongoDBHomeComponent } from './mongodb-home.component';

describe('ConfigHomeComponent', () => {
  let component: MongoDBHomeComponent;
  let fixture: ComponentFixture<MongoDBHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MongoDBHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MongoDBHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
