import { Component, DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { configureTestSuite } from 'src/configure-test-suite';
import { UiMaskDirective } from './ui-mask.directive';

@Component({
  template: `
  <input id="uiMask"
  name="uiMask" type="text" uiMask maxlength="10" /> `
})  
class TestComponent {
    dataModel : string;
  constructor(private el: ElementRef) {
  }
}

describe('UiMaskDirective', () => {

  let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let inputEl: DebugElement;
    let directive: UiMaskDirective;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [UiMaskDirective, TestComponent]
        });
    });

    beforeEach(async () => {
        fixture = TestBed.configureTestingModule({
            declarations: [UiMaskDirective, TestComponent]
        })
            .createComponent(TestComponent);
        component = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('input'));;
        fixture.detectChanges();
    });
  
  it('should create an instance', () => {
    const directive = new UiMaskDirective(inputEl);
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
        ];
        const el = fixture.nativeElement.querySelector('input');

        acceptableKeys.forEach(({ key }) => {
            const event = new KeyboardEvent("keydown", { "key": key });

            el.dispatchEvent(event);
            fixture.whenStable().then(() => {
                fixture.detectChanges();
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
            });
        });
    });
});


describe('onInputChange ->', () => {
    describe('when value is >14 characters long and does NOT contain a hyphen or space', () => {
        it('should insert a space in the 6th and insert hyphen in the 10th characters', () => {
            const el = fixture.nativeElement.querySelector('input');
            el.value = "(123) 456-7890";
            expect(el.value).toBe("(123) 456-7890");
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

    describe('when value is greater than 11 characters long', () => {
        it('should mark the element as invalid', () => {
            const el = fixture.nativeElement.querySelector('input');
            el.value = "123456789012";
            expect(el.value.valid).toBeFalsy();
        });
    });

    describe('when value is less than or equal to 11 characters long', () => {
        describe('and when it does NOT match the pattern', () => {
            it('should mark the element as invalid', () => {
                const el = fixture.nativeElement.querySelector('input');
                el.value = "1-2-3-4-5-6";
                expect(el.value.valid).toBeFalsy();
            });
        });

    });
});
});
