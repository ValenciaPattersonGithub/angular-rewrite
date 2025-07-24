import { Component, DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from 'src/configure-test-suite';
import { AlphaNumericWithSpecialCharactersDirective } from './alpha-numeric-with-special-characters.directive';

@Component({
    template: `
      <input id="testInput" [(ngModel)]="dataModel"
              name="inpText" type="text" alphaNumericWithSpecialCharacters /> 
      <input id="testInput1" [(ngModel)]="dataModel"
              name="inpText1" type="text" alphaNumericWithSpecialCharacters [allowEnter]="true" />
      <input id="testInput2" [(ngModel)]="dataModel"
              name="inpText2" type="text" alphaNumericWithSpecialCharacters [allowEnter]="false" /> `
})
class TestComponent {
    dataModel: string;
    constructor(private el: ElementRef) {

    }
}

describe('AlphaNumericWithSpecialCharactersDirective', () => {

    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let inputEl: DebugElement;
    
    let nativeEl: HTMLInputElement;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [TestComponent, AlphaNumericWithSpecialCharactersDirective]
        });
    });

    beforeEach(async () => {
        fixture = TestBed.configureTestingModule({
            declarations: [AlphaNumericWithSpecialCharactersDirective, TestComponent]
        })
        .createComponent(TestComponent);
        component = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('input[id="testInput"]'));
        nativeEl = inputEl.nativeElement;
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        const directive = new AlphaNumericWithSpecialCharactersDirective(inputEl);
        expect(directive).toBeTruthy();
    });

    it('should render injected content safe', () => {
        fixture.detectChanges();
        const dt1 = new DataTransfer();        
        spyOn(document, 'execCommand')
        const event = new ClipboardEvent('paste', {clipboardData: dt1});
        event.clipboardData.setData('text/plain', '<img src=X><a href=http://evil.com>Click Here</a>');
        
        nativeEl.dispatchEvent(event);
        fixture.detectChanges();        
        expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, 'img src=Xa href=http://evil.comClick Here/a')
    });

    it('should remove any characters that are not in regex when pasting content', () => {
        fixture.detectChanges();
        const dt1 = new DataTransfer();        
        spyOn(document, 'execCommand')
        const event = new ClipboardEvent('paste', {clipboardData: dt1});
        event.clipboardData.setData('text/plain', 'bob<script> ~@#%&$^*()_+={}|,/\\.?\':-[] ');
        
        nativeEl.dispatchEvent(event);
        fixture.detectChanges();        
        expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, 'bobscript ~@#%&$^*()_+={}|,/\\.?\':- ')
    });

    it('should call preventDefault if any character that are not in regex when entering content during keypress', () => {
        let specialCharacterString = '~@#%&$^*()_+={}|,/\\.?:\'-  '
        for (let i = 0; i < specialCharacterString.length; i++) {
            let event = new KeyboardEvent('keypress', {
                key: specialCharacterString[i]
            });
            spyOn(event, 'preventDefault')
            inputEl.triggerEventHandler('keypress', event);
            nativeEl.dispatchEvent(event);
            fixture.detectChanges();            
            expect(event.preventDefault).not.toHaveBeenCalled();
        }
    });

    it('should not call preventDefault if Enter is pressed and allowEnter is set to true', () => {
        const inputEl1 = fixture.debugElement.query(By.css('input[id="testInput1"]'));
        const enterEvent = new KeyboardEvent('keypress', {
            key: 'Enter'
        });
        spyOn(enterEvent, 'preventDefault');

        inputEl1.triggerEventHandler('keypress', enterEvent);
        inputEl1.nativeElement.dispatchEvent(enterEvent);
        fixture.detectChanges();

        expect(enterEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should call preventDefault if Enter is pressed and allowEnter is set to false', () => {
        const inputEl2 = fixture.debugElement.query(By.css('input[id="testInput2"]'));
        const enterEvent = new KeyboardEvent('keypress', {
            key: 'Enter'
        });
        spyOn(enterEvent, 'preventDefault');

        inputEl2.triggerEventHandler('keypress', enterEvent);
        inputEl2.nativeElement.dispatchEvent(enterEvent);
        fixture.detectChanges();

        expect(enterEvent.preventDefault).toHaveBeenCalled();
    });
});
