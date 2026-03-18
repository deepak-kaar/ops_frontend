import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgsManagerComponent } from './orgs-manager.component';

describe('OrgsManagerComponent', () => {
  let component: OrgsManagerComponent;
  let fixture: ComponentFixture<OrgsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrgsManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
