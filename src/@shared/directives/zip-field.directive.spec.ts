import { Component, DebugElement, ElementRef, HostListener } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from 'src/configure-test-suite';
import { ZipFieldDirective } from "./zip-field.directive";

@Component({
    template: `
        <input type="text" name="inpZip" zipField maxlength="10" minlength="5" /> `
})  
class TestComponent {
    constructor(private el: ElementRef) {
    }
}

describe('ZipFieldDirective -> ', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let inputEl: DebugElement;
    let directive: ZipFieldDirective;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [ZipFieldDirective, TestComponent]
        });
    });

    beforeEach(async () => {
        fixture = TestBed.configureTestingModule({
            declarations: [ZipFieldDirective, TestComponent]
        })
            .createComponent(TestComponent);
        component = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('input'));;
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        directive = new ZipFieldDirective(inputEl);
        expect(directive).toBeTruthy();
    });

    describe('when acceptable keys are pressed', async () => {
        it('should return true', () => {
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
                });
            });
        });
    });

    describe('when unacceptable keys are pressed', async () => {
        it('should call preventDefault', () => {
            const unAcceptableKeys = [
                { key: 'a' },
                { key: 'b', },
                { key: '-' },
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

    describe('validate ->', () => {
        describe('when view value is undefined or null', () => {
            it('should initialize the view value to an empty string', () => {
                const el = fixture.nativeElement.querySelector('input');
                el.value = null;
                expect(el.value).toBe('');
            });

            it('should mark the element as valid', () => {
                const el = fixture.nativeElement.querySelector('input');
                el.value = '';
                expect(el.value.invalid).toBeFalsy();
            });
        });

        describe('when value is not equal to 5 or 9', () => {
            it('should mark the element as invalid', () => {
                const el = fixture.nativeElement.querySelector('input');
                el.value = "1234";
                expect(el.value.valid).toBeFalsy();
            });
        });

        describe('when value is equal to 5 or 9', () => {
            it('should mark the element as valid', () => {
                const el = fixture.nativeElement.querySelector('input');
                el.value = "12345-6789";
                expect(el.value.invalid).toBeFalsy();
            });
        });
    });
});