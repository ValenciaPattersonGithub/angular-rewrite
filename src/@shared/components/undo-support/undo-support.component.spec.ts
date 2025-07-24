import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoSupportComponent } from './undo-support.component';

describe('UndoSupportComponent', () => {
  let component: UndoSupportComponent;
  let fixture: ComponentFixture<UndoSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UndoSupportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
