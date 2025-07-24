import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextareaWithVoiceComponent } from './textarea-with-voice.component';

describe('TextareaWithVoiceComponent', () => {
  let component: TextareaWithVoiceComponent;
  let fixture: ComponentFixture<TextareaWithVoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextareaWithVoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextareaWithVoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
