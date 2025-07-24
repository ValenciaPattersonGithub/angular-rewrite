import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from 'src/configure-test-suite';
import { ShowFocusDirective } from './show-focus.directive';

@Component({
  template: `
      <input [(ngModel)]="dataModel" id="testInp"
              name="inpFax" type="text" showFocus/> `
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
      declarations: [ShowFocusDirective, TestComponent]
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

  it('allow show focus for Textarea to be called', async () => {
    var el = fixture.nativeElement.querySelector('textarea');
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(el.focus).toHaveBeenCalled();
    });
  });

  it('allow show focus for Input to be called', async () => {
    var el = fixture.nativeElement.querySelector('input');
    el.value = 'abc';
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(el.focus).toHaveBeenCalled();
    });
  });
});
