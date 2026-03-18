import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MongodbAdministrationComponent } from './mongodb-administration.component';

describe('MongodbAdministrationComponent', () => {
  let component: MongodbAdministrationComponent;
  let fixture: ComponentFixture<MongodbAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MongodbAdministrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MongodbAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
