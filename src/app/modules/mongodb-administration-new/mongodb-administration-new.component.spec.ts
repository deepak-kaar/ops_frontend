import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MongodbAdministrationNewComponent } from './mongodb-administration-new.component';

describe('MongodbAdministrationNewComponent', () => {
  let component: MongodbAdministrationNewComponent;
  let fixture: ComponentFixture<MongodbAdministrationNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MongodbAdministrationNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MongodbAdministrationNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
