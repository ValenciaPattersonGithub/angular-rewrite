import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ButtonMenuComponent } from './button-menu.component';
import { EventEmitter } from '@angular/core';

describe('ButtonMenuComponent', () => {
    let component: ButtonMenuComponent;
    let fixture: ComponentFixture<ButtonMenuComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ButtonMenuComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ButtonMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('optionClicked', () => {


        it('should call selectedOption.emit with passed string', () => {
            component.selectedOption.emit = jasmine.createSpy();

            component.optionClicked('test');

            expect(component.selectedOption.emit).toHaveBeenCalledWith('test');

        });

    });
});
