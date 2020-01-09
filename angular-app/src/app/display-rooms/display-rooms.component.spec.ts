import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayRoomsComponent } from './display-rooms.component';

describe('DisplayRoomsComponent', () => {
  let component: DisplayRoomsComponent;
  let fixture: ComponentFixture<DisplayRoomsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayRoomsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayRoomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
