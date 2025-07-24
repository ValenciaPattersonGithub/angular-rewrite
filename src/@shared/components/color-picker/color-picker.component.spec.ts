import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from 'src/configure-test-suite';
import { By } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';
import { ExpectedConditions } from 'protractor';
import { ColorPickerComponent } from './color-picker.component';

describe('ColorPickerComponent ->', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [ColorPickerComponent]
        });
    });

    beforeEach(() => {
        component = new ColorPickerComponent(
        );
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });


    describe('clickInside ->', () => {
        it('should set clickedInside to true', () => {
            component.clickedInside = false;

            component.clickInside();

            expect(component.clickedInside).toBe(true);
        });
    });

    describe('clickout ->', () => {
        it('should set clickedInside to false', () => {
            component.clickedInside = true;

            component.clickout();

            expect(component.clickedInside).toBe(false);
        });

        it('should call emitNewColor when isPickerOpen and not clickedInside', () => {
            component.clickedInside = false;
            component.isPickerOpen = true;
            component.emitNewColor = jasmine.createSpy();

            component.clickout();

            expect(component.emitNewColor).toHaveBeenCalled();
        });
    });

    describe('ngOnInit ->', () => {
        it('should set initial variables', () => {
            component.customTabActive = true;
            component.recommendedTabActive = false;
            component.isPickerOpen = true;
            component.currentColorSelection = null;
            component.setColor = 'test';
            component.getHue = jasmine.createSpy().and.returnValue('getHueTest');

            component.ngOnInit();

            expect(component.customTabActive).toBe(false);
            expect(component.recommendedTabActive).toBe(true);
            expect(component.isPickerOpen).toBe(false);
            expect(component.currentColorSelection).toBe('test');
            expect(component.currentHue).toBe('getHueTest');
        });

    });

    describe('ngOnChanges ->', () => {
        it('should set initial variables', () => {
            component.customTabActive = true;
            component.recommendedTabActive = false;
            component.isPickerOpen = true;
            component.currentColorSelection = null;
            component.setColor = 'test';
            component.getHue = jasmine.createSpy().and.returnValue('getHueTest');

            component.ngOnChanges();

            expect(component.customTabActive).toBe(false);
            expect(component.recommendedTabActive).toBe(true);
            expect(component.isPickerOpen).toBe(false);
            expect(component.currentColorSelection).toBe('test');
            expect(component.currentHue).toBe('getHueTest');
        });

    });


    describe('changeActiveTab ->', () => {
        it('should set recommendedTabActive to true when tabIndex is 1', () => {
            component.customTabActive = true;
            component.recommendedTabActive = false;

            component.changeActiveTab(1);

            expect(component.customTabActive).toBe(false);
            expect(component.recommendedTabActive).toBe(true);
        });

        it('should set recommendedTabActive to true when tabIndex is 1', () => {
            component.customTabActive = false;
            component.recommendedTabActive = true;

            component.changeActiveTab(2);

            expect(component.customTabActive).toBe(true);
            expect(component.recommendedTabActive).toBe(false);
        });

    });


    describe('togglePicker ->', () => {
        it('should set recommendedTabActive and customTabActive', () => {
            component.customTabActive = true;
            component.recommendedTabActive = false;

            component.togglePicker();

            expect(component.customTabActive).toBe(false);
            expect(component.recommendedTabActive).toBe(true);
        });


        it('should toggle isPickerOpen value', () => {
            component.isPickerOpen = false;

            component.togglePicker();

            expect(component.isPickerOpen).toBe(true);
        });


        it('should call emitNewColor when isPickerOpen is changed to false', () => {
            component.isPickerOpen = true;
            component.emitNewColor = jasmine.createSpy();

            component.togglePicker();

            expect(component.emitNewColor).toHaveBeenCalled();
        });
    });


    describe('setRecommendedColor ->', () => {
        it('should set currentColorSelection and call getHue', () => {
            component.currentColorSelection = 'currentColorSelection';
            component.currentHue = 'currentHue';
            component.getHue = jasmine.createSpy().and.returnValue('newHue')

            component.selectRecommendedColor('test');

            expect(component.currentColorSelection).toBe('test');
            expect(component.currentHue).toBe('newHue');
            expect(component.getHue).toHaveBeenCalled();
        });
    });

    describe('paletteChanged ->', () => {
        it('should set currentHue to passed value', () => {
            component.currentHue = 'currentHue';

            component.paletteChanged('newHue');

            expect(component.currentHue).toBe('newHue');
        });
    });

    describe('sliderChanged ->', () => {
        it('should set currentColorSelection to passed value', () => {
            component.currentColorSelection = 'currentColorSelection';

            component.sliderChanged('newColorSelection');

            expect(component.currentColorSelection).toBe('newColorSelection');
        });
    });


    describe('emitNewColor ->', () => {
        beforeEach(() => {
            component.rgbToHex = jasmine.createSpy().and.returnValue('convertedColor');
            component.colorChanged.emit = jasmine.createSpy();
        });

        it('should call rgbToHex when currentColorSelection starts with rgb', () => {
            component.currentColorSelection = 'rgbTest';

            component.emitNewColor();

            expect(component.rgbToHex).toHaveBeenCalled();
        });

        it('should call colorChanged.emit', () => {
            component.currentColorSelection = 'currentColorSelection';

            component.emitNewColor();

            expect(component.colorChanged.emit).toHaveBeenCalled();
        });
    });
});
