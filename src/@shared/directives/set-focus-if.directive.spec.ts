import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from 'src/configure-test-suite';
import { SetFocusIfDirective } from './set-focus-if.directive';

@Component({
  template: `
      <input id="testInp"
              name="inpFax" type="text" setFocusIf/> `
})

class TestComponent {
  dataModel: string
}

describe('SetFocusIfDirective', () => {
let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [SetFocusIfDirective, TestComponent]
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
  
  it('allow set focus If to be called KendoDropDownList', async () => {
    var el = fixture.nativeElement.querySelector('kendo-dropdownlist');
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(el.focus).toHaveBeenCalled();
    });
  });

  it('allow set focus If to be called Input', async () => {
    var el = fixture.nativeElement.querySelector('input');
    el.value = 'abc';
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(el.focus).toHaveBeenCalled();
    });
  });
});
