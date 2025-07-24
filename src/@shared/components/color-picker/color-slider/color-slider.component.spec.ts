import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from 'src/configure-test-suite';
import { By } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';
import { ExpectedConditions } from 'protractor';
import { ColorSliderComponent } from './color-slider.component';

describe('ColorPaletteComponent ->', () => {
    let component: ColorSliderComponent;
    let fixture: ComponentFixture<ColorSliderComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [ColorSliderComponent]
        });
    });

    beforeEach(() => {
        component = new ColorSliderComponent(
        );
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });


    describe('ngAfterViewInit ->', () => {
        it('should draw', () => {
            component.draw = jasmine.createSpy();

            component.ngAfterViewInit();

            expect(component.draw).toHaveBeenCalled();
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
