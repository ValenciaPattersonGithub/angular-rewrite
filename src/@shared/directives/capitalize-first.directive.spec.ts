import { Component, DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from 'src/configure-test-suite';
import { CapitalizeFirstDirective } from './capitalize-first.directive';

@Component({
  template: `
      <input id="testInput" [(ngModel)]="dataModel"
              name="inpFax" type="text" CapitalizeFirst /> `
})

class TestComponent {
  dataModel: string;

  constructor(private el: ElementRef) {
  }

}

describe('CapitalizeFirstDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let inputEl: DebugElement;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [TestComponent, CapitalizeFirstDirective]
    });
  });

  beforeEach(async () => {
    fixture = TestBed.configureTestingModule({
      declarations: [CapitalizeFirstDirective, TestComponent]
    })
      .createComponent(TestComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = new CapitalizeFirstDirective(inputEl);
    expect(directive).toBeTruthy();
  });

  it('should change first letter of the string to uppercase on input change', async () => {
    const el = fixture.nativeElement.querySelector('input');
    const directive = new CapitalizeFirstDirective(inputEl);
    el.value = 'ab';

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(directive.onInput(el.value)).toHaveBeenCalled();
      expect(el.value).toBe('Ab');
    })
  });
});
