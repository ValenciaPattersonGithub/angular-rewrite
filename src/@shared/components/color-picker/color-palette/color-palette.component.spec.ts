import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from 'src/configure-test-suite';
import { By } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';
import { ExpectedConditions } from 'protractor';
import { ColorPaletteComponent } from './color-palette.component';

describe('ColorPaletteComponent ->', () => {
    let component: ColorPaletteComponent;
    let fixture: ComponentFixture<ColorPaletteComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [ColorPaletteComponent]
        });
    });

    beforeEach(() => {
        component = new ColorPaletteComponent(
        );
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });


    describe('ngAfterViewInit ->', () => {


        it('should call drawColorWheel and draw', () => {
            component.draw = jasmine.createSpy();
            component.drawColorWheel = jasmine.createSpy();

            component.ngAfterViewInit();

            expect(component.draw).toHaveBeenCalled();
            expect(component.drawColorWheel).toHaveBeenCalled();
        });

    });

    describe('hexToRgb ->', () => {
        it('should convert purple to correct rgb color', () => {
            var result = component.hexToRgb("#723DCC");

            expect(result).toEqual({ r: 114, g: 61, b: 204 });
        });

    });

    describe('rad2Deg ->', () => {
        it('should convert x and y ', () => {
            var result = component.rad2deg(5);

            expect(result).toEqual(((5 + Math.PI) / (2 * Math.PI)) * 360);
        });

    });


    describe('onMouseDown ->', () => {
        it('should call isInsideCircle', () => {
            component.isInsideCircle = jasmine.createSpy().and.returnValue(false);
            component.onMouseDown(new MouseEvent('test'))

            expect(component.isInsideCircle).toHaveBeenCalled();
        });

        it('should call draw, emitColor when isInsideCircle returns true', () => {
            component.isInsideCircle = jasmine.createSpy().and.returnValue(true);
            component.draw = jasmine.createSpy();
            component.emitColor = jasmine.createSpy();
            component.onMouseDown(new MouseEvent('test'))

            expect(component.draw).toHaveBeenCalled();
            expect(component.emitColor).toHaveBeenCalled();
        });
    });

    describe('onMouseMove ->', () => {
        it('should call isInsideCircle when mouseDown is true', () => {
            component.draw = jasmine.createSpy();
            component.emitColor = jasmine.createSpy();
            component.isInsideCircle = jasmine.createSpy().and.returnValue(false);
            component.onMouseDown(new MouseEvent('test'));



            component.isInsideCircle = jasmine.createSpy().and.returnValue(true);
            component.onMouseMove(new MouseEvent('test'));
            expect(component.isInsideCircle).toHaveBeenCalled();
        });

        it('should call draw, emitColor when mouseDown is true', () => {
            component.draw = jasmine.createSpy();
            component.emitColor = jasmine.createSpy();
            component.isInsideCircle = jasmine.createSpy().and.returnValue(false);
            component.onMouseDown(new MouseEvent('test'));

            component.isInsideCircle = jasmine.createSpy().and.returnValue(true);

            component.onMouseMove(new MouseEvent('test'))

            expect(component.draw).toHaveBeenCalled();
            expect(component.emitColor).toHaveBeenCalled();
        });
    });

    describe('emitColor ->', () => {
        it('should call getColorAtPosition and emit result', () => {
            component.getColorAtPosition = jasmine.createSpy().and.returnValue('test');
            component.color.emit = jasmine.createSpy();
            component.emitColor(2, 3);

            expect(component.getColorAtPosition).toHaveBeenCalled();
            expect(component.color.emit).toHaveBeenCalled();
        });
    });

});
