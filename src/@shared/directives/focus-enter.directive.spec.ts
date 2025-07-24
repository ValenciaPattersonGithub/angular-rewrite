import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from 'src/configure-test-suite';
import { FocusEnterDirective } from './focus-enter.directive';

@Component({
  template: `
      <input id="testInp"
              name="inpFax" type="text" focusEnter/> `
})

class TestComponent {
  dataModel: string
}

describe('FocusEnterDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [FocusEnterDirective, TestComponent]
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

  it('should call activate with key', function () {
    var e = $.Event('keydown');
    fixture.detectChanges();
    fixture.whenStable().then(() => {
        expect(e.preventDefault).toHaveBeenCalled();
    });
});

it('allow focus Enter to be called', async () => {
  var el = fixture.nativeElement.querySelector('input');
  el.value = 'text';
  spyOn(el, 'focus');
  fixture.detectChanges();
  fixture.whenStable().then(() => {
    expect(el.focus).not.toHaveBeenCalled();
  });
});

});