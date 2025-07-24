import { Component, DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from 'src/configure-test-suite';
import { AlphaNumericTextDirective } from './alpha-numeric-text.directive';

@Component({
    template: `
      <input id="testInput" [(ngModel)]="dataModel"
              name="inpFax" type="text" alphaNumericText /> `
})

class TestComponent {
    dataModel: string;
   
    constructor(private el: ElementRef) {
    }

}

describe('AlphaNumericTextDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let inputEl: DebugElement;
    let regexStr: any = '^[A-Z|a-z|0-9]+$';

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [TestComponent, AlphaNumericTextDirective]
        });
    });

    beforeEach(async () => {
        fixture = TestBed.configureTestingModule({
            declarations: [AlphaNumericTextDirective, TestComponent]
        })
            .createComponent(TestComponent);
        component = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('input'));;
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        const directive = new AlphaNumericTextDirective(inputEl);
        expect(directive).toBeTruthy();
    });

    // it('should change text with only aplha and numeric value', async () => {
    //     var el = fixture.nativeElement.querySelector('input');
    //     spyOn(component, 'dataModel');
    //     el.value = 'as!@345';
    //      const newval = el.value.replace(/[^A-Z|a-z|0-9]/g, '');
    //     expect(el.value).not.toBe(newval);
    // });

    // it('should not change text with only aplha and numeric value', async () => {
    //     var el = fixture.nativeElement.querySelector('input');
    //     spyOn(component, 'dataModel');
    //     el.value = 'as345';
    //     const newval = el.value.replace(/[^A-Z|a-z|0-9]/g, '');
    //     expect(el.value).toBe(newval);
    // });
});

