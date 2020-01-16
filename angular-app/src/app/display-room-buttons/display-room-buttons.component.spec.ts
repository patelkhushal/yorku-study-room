import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayRoomButtonsComponent } from './display-room-buttons.component';

describe('DisplayRoomButtonsComponent', () => {
  let component: DisplayRoomButtonsComponent;
  let fixture: ComponentFixture<DisplayRoomButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayRoomButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayRoomButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
