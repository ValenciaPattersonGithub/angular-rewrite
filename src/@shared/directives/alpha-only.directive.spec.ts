
import { Component, DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from 'src/configure-test-suite';
import { AlphaOnlyDirective } from './alpha-only.directive';

@Component({
    template: `
      <input id="testInput" [(ngModel)]="dataModel"
              name="inpFax" type="text" alphaOnly /> `
})

class TestComponent {
    dataModel: string;

    constructor(private el: ElementRef) {
    }

}

describe('AlphaOnlyDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let inputEl: DebugElement;
    let regexStr: any = '^[a-zA-Z ]*$';

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [TestComponent, AlphaOnlyDirective]
        });
    });

    beforeEach(async () => {
        fixture = TestBed.configureTestingModule({
            declarations: [AlphaOnlyDirective, TestComponent]
        })
            .createComponent(TestComponent);
        component = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('input'));;
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        const directive = new AlphaOnlyDirective(inputEl);
        expect(directive).toBeTruthy();
    });

    // it('should change text with only aplha  value', async () => {
    //     var el = fixture.nativeElement.querySelector('input');
    //     spyOn(component, 'dataModel');
    //     el.value = 'as345';
    //     const newval = el.value.replace(/[^a-zA-Z ]/g, '');
    //     expect(el.value).not.toBe(newval);
    // });

    // it('should not change text with only aplha  value', async () => {
    //     var el = fixture.nativeElement.querySelector('input');
    //     spyOn(component, 'dataModel');
    //     el.value = 'as';
    //     const newval = el.value.replace(/[^a-zA-Z ]/g, '');
    //     expect(el.value).toBe(newval);
    // });
});


