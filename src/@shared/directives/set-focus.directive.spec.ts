import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from 'src/configure-test-suite';
import { SetFocusDirective } from './set-focus.directive';

@Component({
  template: `
      <input [(ngModel)]="dataModel" id="testInp"
              name="inpFax" type="text" setFocus/> `
})

class TestComponent {
  dataModel: string
}

describe('SetFocusDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [SetFocusDirective, TestComponent]      
    });
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('allow set focus to be called', async () => {
    var el = fixture.nativeElement.querySelector('input');
    el.value = 'abc';
    spyOn(el, 'focus');
    fixture.detectChanges();
    el.dispatchEvent(new Event('focus'))
    fixture.whenStable().then(() => {
      expect(el.focus).toBeTruthy();
    });
  });
});
