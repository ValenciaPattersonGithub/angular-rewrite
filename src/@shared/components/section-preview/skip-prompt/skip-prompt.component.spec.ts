import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SkipPromptComponent } from './skip-prompt.component';

describe('SkipPromptComponent', () => {
  let component: SkipPromptComponent;
  let fixture: ComponentFixture<SkipPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkipPromptComponent],
      imports: [TranslateModule.forRoot()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkipPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call skip funcation', () => {
    let skip = false;
    component.sectionItem = { Skip: false }
    spyOn(component.onSkip, 'emit');
    component.changeSkipMode(skip)
    expect(component.onSkip.emit).toHaveBeenCalledWith(!skip);
  });

});
