import { Component, HostListener } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from 'src/configure-test-suite';
import { NumericOnlyDirective } from "./numeric-only.directive";

@Component({
    template: `
        <input type="text" name="inpNumeric" numericOnly maxlength="10" minlength="5" /> `
})
class TestComponent {
    constructor() {}
}

describe('NumericOnlyDirective -> ', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let directive: NumericOnlyDirective;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [NumericOnlyDirective, TestComponent]
        });
    });

    beforeEach(async () => {
        fixture = TestBed.configureTestingModule({
            declarations: [NumericOnlyDirective, TestComponent]
        })
            .createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        directive = new NumericOnlyDirective();
        expect(directive).toBeTruthy();
    });

    describe('when unacceptable keys are pressed', async () => {
        it('should call preventDefault', () => {
            const unAcceptableKeys = [
                { key: 'a' },
                { key: 'b', },
                { key: '-' },
                { key: '}' },
                { key: '+' }
            ];
            const el = fixture.nativeElement.querySelector('input');

            unAcceptableKeys.forEach(({ key }) => {
                const event = new KeyboardEvent("keydown", { "key": key });
                const spy = spyOn(event, 'preventDefault');

                el.dispatchEvent(event);
                fixture.whenStable().then(() => {
                    fixture.detectChanges();
                    expect(spy).toHaveBeenCalled();
                });
            });
        });
    });

    describe('when acceptable keys are pressed', async () => {
        it('should return true and populate input field with acceptable keys', () => {
            const acceptableKeys = [
                { key: '0' },
                { key: '1' },
                { key: '2' },
                { key: '3' },
                { key: '4' },
                { key: '5' },
                { key: '6' },
                { key: '7' },
                { key: '8' },
                { key: '9' },
                { key: 'Backspace' },
                { key: 'ArrowLeft' },
                { key: 'ArrowRight' },
                { key: 'ArrowDown' },
                { key: 'ArrowUp' },
                { key: 'Delete' },
            ];
            const spy = spyOn(directive, 'onKeyDown');
            const el = fixture.nativeElement.querySelector('input');

            acceptableKeys.forEach(({ key }) => {
                const event = new KeyboardEvent("keydown", { "key": key });

                el.dispatchEvent(event);
                fixture.whenStable().then(() => {
                    fixture.detectChanges();
                    expect(spy).toBeTruthy();
                    el.value = '0123456789';
                });
            });
        });
    });
});