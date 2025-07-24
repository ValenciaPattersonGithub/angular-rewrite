import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../@shared/shared.module';
import { TeethSelectorComponent } from './teeth-selector.component';
import { ToothAreaDataService } from '../../../@shared/providers/tooth-area-data.service';
import { ToothAreaService } from '../../../@shared/providers/tooth-area.service';
import { TeethSelectorDisplayPipe } from '../../pipes';
import { ToothAreaData } from '../../providers/tooth-area-data.model';
import { configureTestSuite } from 'src/configure-test-suite';

describe('TeethSelectorComponent', () => {
    let component: TeethSelectorComponent;
    let fixture: ComponentFixture<TeethSelectorComponent>;
    let toothAreaData = new ToothAreaData;
    toothAreaData.areaSelection = ['A', 'B']
    toothAreaData.toothSelection = '1';
    toothAreaData.availableAreas = ['A', 'B', 'C'];
    toothAreaData.availableTeeth = [{ USNumber: '1' }, { USNumber: '2' }, { USNumber: '3' }, { USNumber: '4' }, { USNumber: '5' }];


    const mockToothAreaService: any = {
        toothAreaData: toothAreaData
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [TeethSelectorComponent, TeethSelectorDisplayPipe],
            providers: [
                { provide: ToothAreaService, useValue: mockToothAreaService },
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TeethSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('OnChange function', () => {
        beforeEach(() => {
            component.toothAreaService.toothChange = jasmine.createSpy();
            component.toothAreaService.setValuesOnServiceTransaction = jasmine.createSpy();
            component.inputModelChange.emit = jasmine.createSpy();
        });

        it('should call toothAreaService.ToothChange', async () => {
            await component.onChange('1');
            expect(component.toothAreaService.toothChange).toHaveBeenCalled();
        });

        it('should call toothAreaService.setValuesOnServiceTransaction', async () => {
            await component.onChange('1');
            expect(component.toothAreaService.setValuesOnServiceTransaction).toHaveBeenCalled();
        });

        it('should call inputModelChange.emit', async () => {
            await component.onChange('1');
            expect(component.inputModelChange.emit).toHaveBeenCalled();
        });

    });

    describe('toggleDropdownKeypress function', () => {
        beforeEach(() => {
            component.toggleDropdown = jasmine.createSpy();
        });

        //Tab
        it('should not call toggleDropdown when event is Tab', () => {
            component.toggleDropdownKeypress({ key: "Tab", keyCode: 999 });
            expect(component.toggleDropdown).not.toHaveBeenCalled();
        });

        //Number
        it('should call toggleDropdown when event is a number', () => {
            component.toggleDropdownKeypress({ key: "1", keyCode: 50 });
            expect(component.toggleDropdown).toHaveBeenCalled();
        });

        //Letter
        it('should call toggleDropdown when event is a letter', () => {
            component.toggleDropdownKeypress({ key: "A", keyCode: 50 });
            expect(component.toggleDropdown).toHaveBeenCalled();
        });


        //ArrowDown
        it('should call toggleDropdown when event is ArrowDown', () => {
            component.toggleDropdownKeypress({ key: "ArrowDown", keyCode: 999, preventDefault: jasmine.createSpy() });
            expect(component.toggleDropdown).toHaveBeenCalled();
        });


        //Enter
        it('should call toggleDropdown when event is Enter', () => {
            component.toggleDropdownKeypress({ key: "Enter", keyCode: 999, preventDefault: jasmine.createSpy() });
            expect(component.toggleDropdown).toHaveBeenCalled();
        });
    });

    describe('toggleDropdown function', () => {
        beforeEach(() => {
            component.focusInput = jasmine.createSpy();
        });

        it('should change showDropdown to false when it is true and not call focusInput', () => {
            component.showDropdown = true;
            component.toggleDropdown('1');
            expect(component.showDropdown).toBe(false);
            expect(component.focusInput).not.toHaveBeenCalled();
        });

        it('should change showDropdown to true when it is false and call focusInput', () => {
            component.showDropdown = false;
            component.toggleDropdown('1');
            expect(component.showDropdown).toBe(true);
            expect(component.focusInput).toHaveBeenCalledWith('1');
        });
    });

    describe('focusInput function', () => {
        beforeEach(() => {
            component.showDropdown = true;
            fixture.detectChanges();
            component.toothInputElement.nativeElement.focus = jasmine.createSpy();
            component.forceToothSearchUpdate = jasmine.createSpy();
        });

        it('should set inputValue to value passed in', <any>fakeAsync((): void => {
            component.inputValue = 'test';
            component.focusInput('1');
            tick(100);
            expect(component.inputValue).toBe('1');
        }));

        it('should set isUsingArrowKeys to false', <any>fakeAsync((): void => {
            component.isUsingArrowKeys = true;
            component.focusInput('1');
            tick(100);
            expect(component.isUsingArrowKeys).toBe(false);
        }));

        it('should call toothInputElement.nativeElement.focus', <any>fakeAsync((): void => {
            component.focusInput('1');
            tick(100);
            expect(component.toothInputElement.nativeElement.focus).toHaveBeenCalled();
        }));
        it('should call forceToothSearchUpdate', <any>fakeAsync((): void => {
            component.focusInput('1');
            tick(100);
            expect(component.forceToothSearchUpdate).toHaveBeenCalled();
        }));
    });

    describe('enter function', () => {
        beforeEach(() => {
            component.showDropdown = true;
            fixture.detectChanges();
            component.forceToothSearchUpdate = jasmine.createSpy();
            component.select = jasmine.createSpy();
        });

        it('should call select when inputValue matches a valid tooth', async () => {
            component.inputValue = '1'
            await component.enter(null);
            expect(component.select).toHaveBeenCalled();
        });

        it('should not call select when inputValue does not match a valid tooth', async () => {
            component.inputValue = '99'
            await component.enter(null);
            expect(component.select).not.toHaveBeenCalled();
        });

        it('should call forceToothSearchUpdate', async () => {
            component.inputValue = '1'
            await component.enter(null);
            expect(component.forceToothSearchUpdate).toHaveBeenCalled();
        });
    });

    describe('inputKeydown function', () => {
        beforeEach(() => {
            component.showDropdown = true;
            fixture.detectChanges();
            component.forceToothSearchUpdate = jasmine.createSpy();
            component.select = jasmine.createSpy();
        });

        it('should set showDropdown to false and inputValue to null when key is Tab', () => {
            component.inputValue = '1'
            component.inputKeydown({ key: 'Tab' });
            expect(component.inputValue).toBe(null);
            expect(component.showDropdown).toBe(false);
        });

        it('should set isUsingArrowKeys to true when key is ArrowUp and inputValue is not empty', () => {
            component.isUsingArrowKeys = false;
            component.inputValue = '1'
            component.inputKeydown({ key: 'ArrowUp', preventDefault: jasmine.createSpy() });
            expect(component.isUsingArrowKeys).toBe(true);
        });
    });

    describe('navigateToNextOption function', () => {
        beforeEach(() => {
            component.showDropdown = true;
            fixture.detectChanges();
            component.toothInputElement.nativeElement.focus = jasmine.createSpy();
        });

        it('should call toothInputElement.nativeElement.focus and set isUsingArrowKeys to false when nextIndex is less than 0', () => {
            component.isUsingArrowKeys = true;
            component.navigateToNextOption({ preventDefault: jasmine.createSpy() }, -1);
            expect(component.isUsingArrowKeys).toBe(false);
            expect(component.toothInputElement.nativeElement.focus).toHaveBeenCalled();
        });
    });


    describe('tabbedOnOption function', () => {
        beforeEach(() => {
            component.showDropdown = true;
            fixture.detectChanges();
            component.toothInputElement.nativeElement.focus = jasmine.createSpy();
        });

        it('should call toggleDropdown when item is last element in option list', () => {
            component.toggleDropdown = jasmine.createSpy();
            component.tabbedOnOption({ shiftKey: false }, 4);
            expect(component.toggleDropdown).toHaveBeenCalled();
        });

        it('should not call toggleDropdown when item is not the last element in option list', () => {
            component.toggleDropdown = jasmine.createSpy();
            component.tabbedOnOption({ shiftKey: false }, 2);
            expect(component.toggleDropdown).not.toHaveBeenCalled();
        });
    });


    describe('select function', () => {
        beforeEach(() => {
            component.onChange = jasmine.createSpy();
            component.forceToothSearchUpdate = jasmine.createSpy();
            component.toothDropdown.nativeElement.focus = jasmine.createSpy();
        });

        it('should call onChange', async () => {
            await component.select('1');
            expect(component.onChange).toHaveBeenCalledWith('1');
        });

        it('should set inputValue to null', async () => {
            component.inputValue = '1';
            await component.select('1');
            expect(component.inputValue).toBe(null);
        });

        it('should call forceToothSearchUpdate', async () => {
            await component.select('1');
            expect(component.forceToothSearchUpdate).toHaveBeenCalled();
        });

        it('should call toothDropdown.nativeElement.focus', async () => {
            await component.select('1');
            expect(component.toothDropdown.nativeElement.focus).toHaveBeenCalled();
        });

        it('should change showDropdown to false when it is true', async () => {
            component.showDropdown = true;
            await component.select('1');
            expect(component.showDropdown).toBe(false);
        });

        it('should change showDropdown to true when it is false', async () => {
            component.showDropdown = false;
            await component.select('1');
            expect(component.showDropdown).toBe(true);
        });
    });

    describe('inputChanged function', () => {
        beforeEach(() => {
            component.forceToothSearchUpdate = jasmine.createSpy();
        });

        it('should not call forceToothSearchUpdate when fromEnter is true', () => {
            component.fromEnter = true;
            component.inputChanged(null, '1');
            expect(component.forceToothSearchUpdate).not.toHaveBeenCalled();
        });

        it('should call forceToothSearchUpdate when fromEnter is false', () => {
            component.fromEnter = false;
            component.inputChanged(null, '1');
            expect(component.forceToothSearchUpdate).toHaveBeenCalled();
        });
    });

    describe('forceToothSearchUpdate function', () => {
        beforeEach(() => {
        });

        it('should change teethSearchUpdate to false when it is true', () => {
            component.teethSearchUpdate = true;
            component.forceToothSearchUpdate();
            expect(component.teethSearchUpdate).toBe(false);
        });

        it('should change teethSearchUpdate to true when it is false', () => {
            component.teethSearchUpdate = false;
            component.forceToothSearchUpdate();
            expect(component.teethSearchUpdate).toBe(true);
        });
    });


});
