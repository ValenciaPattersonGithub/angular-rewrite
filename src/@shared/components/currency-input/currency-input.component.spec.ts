import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CurrencyInputComponent } from './currency-input.component';
import { configureTestSuite } from 'src/configure-test-suite';
import { AppLabelComponent} from '../form-controls/form-label/form-label.component';

describe('CurrencyInputComponent', () => {
    let component: CurrencyInputComponent;
    let fixture: ComponentFixture<CurrencyInputComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [CurrencyInputComponent, AppLabelComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CurrencyInputComponent);
        component = fixture.componentInstance;
        component.amount = 70;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit function', () => {

        it('should set oldValue to amount', <any>fakeAsync((): void => {
            component.oldValue = 7;
            component.amount = 10;
            component.displayValue = '';
            component.ngOnInit();
            expect(component.oldValue).toBe(10);
            expect(component.displayValue).toBe("10.00");
            expect(component.hasChanged).toBe(false);
        }));

    });

    describe('input function', async () => {

        it('should set 2 decimal places on newValue', async () => {
            component.newValue = 1;
            component.subject.next = jasmine.createSpy();
            await component.input('95.1');

            expect(component.subject.next).toHaveBeenCalledWith(95.10);
            expect(component.newValue).toBe(95.10);
            expect(component.amount).toBe(70);
        });

        it('should set newValue to 0 when input is not a number', async () => {
            component.newValue = 1;
            component.subject.next = jasmine.createSpy();
            await component.input('abc');

            expect(component.subject.next).toHaveBeenCalledWith(0);
            expect(component.newValue).toBe(0);
            expect(component.amount).toBe(70);
        });

        it('should set newValue to max when input value is over max', async () => {
            component.newValue = 90;
            component.subject.next = jasmine.createSpy();
            await component.input('999999999');

            expect(component.subject.next).toHaveBeenCalledWith(999999.99);
            expect(component.newValue).toBe(999999.99);
            expect(component.amount).toBe(70);
        });

        it('should not emit newValue before 2 seconds', <any>fakeAsync((): void => {
            component.emitAfterTimeout = jasmine.createSpy();
            component.input('1');
            tick(1999);
            expect(component.emitAfterTimeout).not.toHaveBeenCalled();
            expect(component.amount).toBe(70);
            tick(1);
        }));

        it('should emit newValue after 2 seconds', <any>fakeAsync((): void => {
            component.ngOnInit();
            component.emitAfterTimeout = jasmine.createSpy();
            component.input('1');
            tick(2000);
            expect(component.emitAfterTimeout).toHaveBeenCalled();
            expect(component.amount).toBe(70);
        }));

        it('should reset emit newValue if called twice within 2 seconds', <any>fakeAsync((): void => {
            component.ngOnInit();
            component.emitAfterTimeout = jasmine.createSpy();
            component.input('1');
            tick(1500);
            expect(component.emitAfterTimeout).not.toHaveBeenCalled();
            component.input('2');
            tick(1999);
            expect(component.emitAfterTimeout).not.toHaveBeenCalled();
            tick(1);
            expect(component.emitAfterTimeout).toHaveBeenCalled();
        }));

        it('should default to isDisabled equals false', <any>fakeAsync((): void => {
            component.ngOnInit();
            expect(component.isDisabled).toBe(false)
        }));

        it('should set hasChanged to true if hasChanged equals false', <any>fakeAsync((): void => {
            component.hasChanged = false;
            component.amountChanging.emit = jasmine.createSpy();
            component.input('1');
            expect(component.hasChanged).toBe(true);
        }));

        it('should emit amountChanging if hasChanged equals false', <any>fakeAsync((): void => {
            component.hasChanged = false;
            component.amountChanging.emit = jasmine.createSpy();
            component.input('1');
            expect(component.amountChanging.emit).toHaveBeenCalled();
        }));

        it('should not emit amountChanging if hasChanged equals true', <any>fakeAsync((): void => {
            component.hasChanged = true;
            component.amountChanging.emit = jasmine.createSpy();
            component.input('1');
            expect(component.amountChanging.emit).not.toHaveBeenCalled();
        }));
    });

    describe('emitAfterTimeout', () => {

        it('should emit amountChange and change flag', () => {
            component.oldValue = 10;
            component.amountChange.emit = jasmine.createSpy();
            component.newValue = 76;
            component.emitAfterTimeout();
            expect(component.newValue).toBe(76);
            expect(component.displayValue).toBe('76.00');
            expect(component.hasChanged).toBe(false);
            expect(component.amountChange.emit).toHaveBeenCalledWith({ NewValue: component.newValue, OldValue: component.oldValue });
        });

    });

    describe('sanitizeInput', () => {

        it('should set newValue to 999999.99 when value is over max', <any>fakeAsync((): void => {
            component.sanitizeInput(1000000);
            expect(component.newValue).toBe(999999.99);
        }));

        it('should set newValue to 0 when value is under 0', <any>fakeAsync((): void => {
            component.sanitizeInput(-1);
            expect(component.newValue).toBe(0);
        }));

        it('should set newValue to changedValue when value is between 0 and 999999.99', <any>fakeAsync((): void => {
            component.sanitizeInput(50.50);
            expect(component.newValue).toBe(50.50);
        }));
    });

    describe('ngOnChanges', () => {

        it('should format amount to include commas and periods', <any>fakeAsync((): void => {
            component.oldValue = 77;
            component.amount = 999999.99
            component.ngOnChanges();

            expect(component.displayValue).toBe("999,999.99");
            expect(component.oldValue).toBe(999999.99);
        }));
    });

    describe('onBlur', () => {
        it('should emit newValue on blur', async () => {
            component.ngOnInit();
            component.emitOnBlur = true;
            component.emitAfterTimeout = jasmine.createSpy();
            await component.input('1');
            component.onBlur();
            expect(component.amount).toBe(70);
        });

        it('should set 2 decimal places on newValue on blur', async () => {
            component.newValue = 1;
            component.emitOnBlur = true;
            component.subject.next = jasmine.createSpy();
            await component.input('95.1');
            component.onBlur();

            expect(component.newValue).toBe(95.10);
            expect(component.amount).toBe(70);
        });

        it('should set newValue to 0 when input is not a number on blur', async () => {
            component.newValue = 1;
            component.emitOnBlur = true;
            component.subject.next = jasmine.createSpy();
            await component.input('abc');
            component.onBlur();
            expect(component.newValue).toBe(0);
            expect(component.amount).toBe(70);
        });

        it('should set newValue to max when input value is over max on blur', async () => {
            component.newValue = 90;
            component.emitOnBlur = true;
            component.subject.next = jasmine.createSpy();
            await component.input('999999999');
            expect(component.newValue).toBe(999999.99);
            expect(component.amount).toBe(70);
        });

        it('should set newValue to null when newValue is empty and allowNoValue is true on blur', async () => {
            component.newValue = '';
            component.hasChanged = true;
            component.emitOnBlur = true;
            component.allowNoValue = true;
            component.subject.next = jasmine.createSpy();
            await component.input(null);
            expect(component.newValue).toBe(null);
        });

        it('should not set newValue to null when newValue is empty and allowNoValue is false on blur', async () => {
            component.newValue = '';
            component.hasChanged = true;
            component.emitOnBlur = true;
            component.allowNoValue = false;
            component.subject.next = jasmine.createSpy();
            await component.input(null);
            expect(component.newValue).toBe(0);
        });

    });
    
});
