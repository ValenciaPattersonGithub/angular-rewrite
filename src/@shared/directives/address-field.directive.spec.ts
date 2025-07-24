import { AddressFieldDirective } from './address-field.directive';
import { Component, DebugElement} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from 'src/configure-test-suite';

@Component({
  template: `
    <input id="testInput" [(ngModel)]="dataModel"
            name="inpFax" type="text" addressField /> `
})

class TestComponent {
  dataModel: string;
  constructor() {
  }
}

describe('AddressFieldDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let inputEl: DebugElement;
  let regexStr: any = "^[a-zA-Z0-9-'.\\()# ]*$";

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [TestComponent, AddressFieldDirective]
    });
  });

  beforeEach(async () => {
    fixture = TestBed.configureTestingModule({
      declarations: [AddressFieldDirective, TestComponent]
    })
      .createComponent(TestComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    let directive = new AddressFieldDirective();
    expect(directive).toBeTruthy();
  });

  it('should validate and block paste event', () => {
    let inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');
    let clipboardData = {
      getData: () => 'Test1!@#$!~$%^&*{'
    };
    spyOn(clipboardData, 'getData').and.callThrough();
    spyOn(document, 'execCommand').and.stub();
    let dataTransfer = new DataTransfer();
    dataTransfer.getData = clipboardData.getData;
    let event = new ClipboardEvent('paste', { clipboardData: dataTransfer });
    inputElement.dispatchEvent(event);
    document.execCommand('insertHTML', false, 'Test#');
    expect(clipboardData.getData).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, 'Test#');
    expect(inputElement.value).toBe('');
  });

});
