import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MongodbHomeNewComponent } from './mongodb-home-new.component';

describe('MongodbHomeNewComponent', () => {
  let component: MongodbHomeNewComponent;
  let fixture: ComponentFixture<MongodbHomeNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MongodbHomeNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MongodbHomeNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
