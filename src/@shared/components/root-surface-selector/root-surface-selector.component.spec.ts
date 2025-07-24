import { TestBed, tick, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { ToothAreaService } from '../../providers/tooth-area.service';
import { ToothAreaData } from '../../providers/tooth-area-data.model';
import { RootSurfaceSelectorComponent } from './root-surface-selector.component';
import { AreaSelectorDisplayPipe } from '../../pipes';
import { FormsModule } from '@angular/forms';
import { configureTestSuite } from 'src/configure-test-suite';

describe('RootSurfaceSelectorComponent', () => {
    let component: RootSurfaceSelectorComponent;
    let fixture: ComponentFixture<RootSurfaceSelectorComponent>;
    let toothAreaData: ToothAreaData;
    let mockToothAreaService: any;

    configureTestSuite(() => {
        toothAreaData = new ToothAreaData();
        toothAreaData.areaSelection = ['M', 'D']
        toothAreaData.toothSelection = '1';
        toothAreaData.availableAreas = ['M', 'D', 'O'];
        toothAreaData.availableTeeth = [{ USNumber: '1' }, { USNumber: '2' }, { USNumber: '3' }, { USNumber: '4' }, { USNumber: '5' }];
        toothAreaData.serviceCode = { AffectedAreaId: 4 };
        toothAreaData.originalServiceCode = { AffectedAreaId: 4 };

        mockToothAreaService = {
            areaChange: jasmine.createSpy().and.callFake(function (x) { return Promise.resolve(x); }),
            setValuesOnServiceTransaction: jasmine.createSpy().and.callFake(function (x) { return x; }),
            toothAreaData: toothAreaData
        };

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [RootSurfaceSelectorComponent, AreaSelectorDisplayPipe],
            providers: [
                { provide: ToothAreaService, useValue: mockToothAreaService },
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RootSurfaceSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });


    describe('onChange', () => {
        beforeEach(() => {
            component.callToothAreaServiceAndEmit = jasmine.createSpy();
        });

        it('should add non selected item', async () => {
            const service = TestBed.get(ToothAreaService) as ToothAreaService;
            let toothAreaData = new ToothAreaData;
            toothAreaData.areaSelection = ['M', 'D']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['M', 'D', 'O'];
            toothAreaData.availableTeeth = [{ USNumber: '1' }, { USNumber: '2' }, { USNumber: '3' }, { USNumber: '4' }, { USNumber: '5' }];
            toothAreaData.serviceCode = { AffectedAreaId: 4 };
            toothAreaData.originalServiceCode = { AffectedAreaId: 4 };
            service.toothAreaData = toothAreaData;
            await component.onChange({ target: { value: 'O' } });
            expect(service.toothAreaData.areaSelection).toEqual(['M', 'D', 'O']);
        });

        it('should remove an already selected item', async () => {
            const service = TestBed.get(ToothAreaService) as ToothAreaService;
            let toothAreaData = new ToothAreaData;
            toothAreaData.areaSelection = ['M', 'D']
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['M', 'D', 'O'];
            toothAreaData.availableTeeth = [{ USNumber: '1' }, { USNumber: '2' }, { USNumber: '3' }, { USNumber: '4' }, { USNumber: '5' }];
            toothAreaData.serviceCode = { AffectedAreaId: 4 };
            toothAreaData.originalServiceCode = { AffectedAreaId: 4 };
            service.toothAreaData = toothAreaData;
            await component.onChange({ target: { value: 'M' } });
            expect(service.toothAreaData.areaSelection).toEqual(['D']);
        });

        it('should call callToothAreaServiceAndEmit', async () => {
            await component.onChange({ target: { value: 'M' } });
            expect(component.callToothAreaServiceAndEmit).toHaveBeenCalled();
        });
    });

    describe('callToothAreaServiceAndEmit', () => {
        beforeEach(() => {
        });

        it('should call toothAreaService areaChange', async () => {
            await component.callToothAreaServiceAndEmit();
            expect(mockToothAreaService.areaChange).toHaveBeenCalled();
        });

        it('should call toothAreaService setValuesOnServiceTransaction', async () => {
            await component.callToothAreaServiceAndEmit();
            expect(mockToothAreaService.setValuesOnServiceTransaction).toHaveBeenCalled();
        });

        it('should call callToothAreaServiceAndEmit', async () => {
            component.inputModelChange.emit = jasmine.createSpy();
            await component.callToothAreaServiceAndEmit();
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
            component.toggleDropdown('M');
            expect(component.showDropdown).toBe(false);
            expect(component.focusInput).not.toHaveBeenCalled();
        });

        it('should change showDropdown to true when it is false and call focusInput', () => {
            component.showDropdown = false;
            component.toggleDropdown('M');
            expect(component.showDropdown).toBe(true);
            expect(component.focusInput).toHaveBeenCalledWith('M');
        });
    });

    describe('focusInput function', () => {
        beforeEach(() => {
            component.showDropdown = true;
            fixture.detectChanges();
            component.areaInputElement.nativeElement.focus = jasmine.createSpy();
        });

        it('should set inputValue to value passed in', <any>fakeAsync((): void => {
            component.inputValue = 'test';
            component.focusInput('1');
            tick(100);
            expect(component.inputValue).toBe('1');
        }));

        it('should call areaInputElement.nativeElement.focus', <any>fakeAsync((): void => {
            component.focusInput('1');
            tick(100);
            expect(component.areaInputElement.nativeElement.focus).toHaveBeenCalled();
        }));
    });

    //Enter TODO
    describe('enter function', () => {
        beforeEach(() => {

        });

        it('should call translateRootSummaryToSelections when service code is Root code', () => {
            const service = TestBed.get(ToothAreaService) as ToothAreaService;

            let toothAreaData = new ToothAreaData;
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['DB', 'P', 'MB'];
            toothAreaData.availableTeeth = [{ USNumber: '1' }, { USNumber: '2' }, { USNumber: '3' }, { USNumber: '4' }, { USNumber: '5' }];
            toothAreaData.serviceCode = { AffectedAreaId: 3 };
            toothAreaData.originalServiceCode = { AffectedAreaId: 3 };
            service.toothAreaData = toothAreaData;

            component.showDropdown = true;
            fixture.detectChanges();
            component.areaInputElement.nativeElement.focus = jasmine.createSpy();

            component.translateRootSummaryToSelections = jasmine.createSpy();
            component.inputValue = 'test'
            component.enter(null);
            expect(component.translateRootSummaryToSelections).toHaveBeenCalled();
        });



        it('should call translateSurfaceSummaryToSelections when service code is Surface code', () => {
            const service = TestBed.get(ToothAreaService) as ToothAreaService;

            let toothAreaData = new ToothAreaData;
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['M', 'O', 'D'];
            toothAreaData.availableTeeth = [{ USNumber: '1' }, { USNumber: '2' }, { USNumber: '3' }, { USNumber: '4' }, { USNumber: '5' }];
            toothAreaData.serviceCode = { AffectedAreaId: 4 };
            toothAreaData.originalServiceCode = { AffectedAreaId: 4 };
            service.toothAreaData = toothAreaData;

            component.showDropdown = true;
            fixture.detectChanges();
            component.areaInputElement.nativeElement.focus = jasmine.createSpy();

            component.translateSurfaceSummaryToSelections = jasmine.createSpy().and.returnValue([]);
            component.inputValue = 'MO'
            component.enter(null);
            expect(component.translateSurfaceSummaryToSelections).toHaveBeenCalled();
        });

        it('should call callToothAreaServiceAndEmit and set inputValue to null', () => {
            const service = TestBed.get(ToothAreaService) as ToothAreaService;

            let toothAreaData = new ToothAreaData;
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['M', 'O', 'D'];
            toothAreaData.availableTeeth = [{ USNumber: '1' }, { USNumber: '2' }, { USNumber: '3' }, { USNumber: '4' }, { USNumber: '5' }];
            toothAreaData.serviceCode = { AffectedAreaId: 4 };
            toothAreaData.originalServiceCode = { AffectedAreaId: 4 };
            service.toothAreaData = toothAreaData;

            component.showDropdown = true;
            fixture.detectChanges();
            component.areaInputElement.nativeElement.focus = jasmine.createSpy();

            component.callToothAreaServiceAndEmit = jasmine.createSpy().and.returnValue([]);
            component.inputValue = 'MO'
            component.enter(null);
            expect(component.callToothAreaServiceAndEmit).toHaveBeenCalled();
            expect(component.inputValue).toBe(null);
        });
    });


    describe('inputChanged function', () => {
        beforeEach(() => {
        });

        it('should change input to uppercase', () => {
            component.inputValue = 'B';
            component.inputChanged(null, 'a');
            expect(component.inputValue).toBe('A');
        });
    });


    describe('inputKeyDown function', () => {
        beforeEach(() => {
            component.showDropdown = true;
            fixture.detectChanges();
            component.areaInputElement.nativeElement.focus = jasmine.createSpy();
        });

        it('should call toggleDropdown when item is last element in option list', () => {
            component.showDropdown = true;
            component.inputKeydown({ key: 'Tab' });
            expect(component.showDropdown).toBe(false);
        });
    });

    describe('tabbedOnOption function', () => {
        beforeEach(() => {
            component.showDropdown = true;
            fixture.detectChanges();
            component.areaInputElement.nativeElement.focus = jasmine.createSpy();
        });

        it('should call toggleDropdown when item is last element in option list', () => {
            component.toggleDropdown = jasmine.createSpy();
            component.tabbedOnOption({ shiftKey: false }, 2);
            expect(component.toggleDropdown).toHaveBeenCalled();
        });

        it('should not call toggleDropdown when item is not the last element in option list', () => {
            component.toggleDropdown = jasmine.createSpy();
            component.tabbedOnOption({ shiftKey: false }, 1);
            expect(component.toggleDropdown).not.toHaveBeenCalled();
        });
    });

    describe('navigateToNextOption function', () => {
        beforeEach(() => {
            component.showDropdown = true;
            fixture.detectChanges();
            component.areaInputElement.nativeElement.focus = jasmine.createSpy();
        });

        it('should call areaInputElement.nativeElement.focus and set isUsingArrowKeys to false when nextIndex is less than 0', () => {
            component.navigateToNextOption({ preventDefault: jasmine.createSpy() }, -1);
            expect(component.areaInputElement.nativeElement.focus).toHaveBeenCalled();
        });
    });

    describe('formatSurfaces', () => {
        beforeEach(() => {
            component.normalizeSurfaces = jasmine.createSpy().and.callFake(function (x) { return x; });
        });

        //No data passed in
        it('should return empty string when no data is passed', () => {
            let result = component.formatSurfaces(undefined);
            expect(result).toEqual('');
        });

        //Data passed in, calls normalizeSurfaces
        it('should add commas to list before calling normalizeSurfaces', () => {
            let result = component.formatSurfaces(['1', '2']);
            expect(component.normalizeSurfaces).toHaveBeenCalledWith('1,2')
        });
    });

    describe('normalizeSurfaces', () => {
        beforeEach(() => {
            component.getSurfacesInSummaryFormat = jasmine.createSpy().and.callFake(function (x) { return x; });
        });

        //Data passed in, calls normalizeSurfaces
        it('should call getSurfacesInSummaryFormat', () => {
            let result = component.normalizeSurfaces('test');
            expect(result).toEqual('test');
            expect(component.getSurfacesInSummaryFormat).toHaveBeenCalledWith('test')
        });
    });

    describe('getSurfacesInSummaryFormat', () => {
        beforeEach(() => {
            component.translateSurfaceDetailToSummary = jasmine.createSpy().and.callFake(function (x) { return x; });
        });

        it('should return empty when length is less than 1', () => {
            let result = component.getSurfacesInSummaryFormat('');
            expect(result).toEqual('');
            expect(component.translateSurfaceDetailToSummary).not.toHaveBeenCalled()
        });


        it('should return surface when length is 1', () => {
            let result = component.getSurfacesInSummaryFormat('O');
            expect(result).toEqual('O');
            expect(component.translateSurfaceDetailToSummary).not.toHaveBeenCalled()
        });

        it('should call translateSurfaceDetailToSummary when surface length more than 1', () => {
            let result = component.getSurfacesInSummaryFormat('O,M');
            expect(result).toEqual('MO');
            expect(component.translateSurfaceDetailToSummary).toHaveBeenCalledWith('MO')
        });
    });


    describe('translateSurfaceDetailToSummary', () => {
        beforeEach(() => {
        });

        it('should return DOL when O, D, and L are selected', () => {
            let result = component.translateSurfaceDetailToSummary('ODL');
            expect(result).toEqual('DOL');
        });

        it('should return DOB when O, D, and B are selected', () => {
            let result = component.translateSurfaceDetailToSummary('ODB');
            expect(result).toEqual('DOB');
        });

        it('should return DIF when I, D, and F are selected', () => {
            let result = component.translateSurfaceDetailToSummary('IDF');
            expect(result).toEqual('DIF');
        });

    });


    describe('translateSurfaceSummaryToSelections', () => {
        beforeEach(() => {
        });

        it('should return L and L5 when input is L5', () => {
            component.inputValue = 'L5';
            let result = component.translateSurfaceSummaryToSelections(component.inputValue);
            expect(result).toEqual(['L', 'L5']);
        });

        it('should return F, L, and L5 when input is FL5', () => {
            component.inputValue = 'FL5';
            let result = component.translateSurfaceSummaryToSelections(component.inputValue);
            expect(result).toEqual(['F', 'L', 'L5']);
        });

        it('should return F when multiple Fs are included', () => {
            component.inputValue = 'FFFFFF';
            let result = component.translateSurfaceSummaryToSelections(component.inputValue);
            expect(result).toEqual(['F']);
        });
    });

    describe('formatRoots', () => {
        beforeEach(() => {
            component.normalizeRoots = jasmine.createSpy().and.callFake(function (x) { return x; });
        });

        it('should return comma separated string from passed array', () => {
            let result = component.formatRoots(['A', 'B', 'C']);
            expect(result).toEqual('A,B,C');
        });

        it('should call normalizeRoots', () => {
            component.normalizeRoots = jasmine.createSpy().and.returnValue('1');
            let result = component.formatRoots(['1']);
            expect(component.normalizeRoots).toHaveBeenCalled();
        });
    });

    describe('normalizeRoots', () => {
        beforeEach(() => {
            component.getRootsInSummaryFormat = jasmine.createSpy().and.callFake(function (x) { return x; });
        });

        //Data passed in, calls normalizeSurfaces
        it('should call getSurfacesInSummaryFormat', () => {
            let result = component.normalizeRoots('test');
            expect(result).toEqual('test');
            expect(component.getRootsInSummaryFormat).toHaveBeenCalledWith('test')
        });
    });

    describe('getRootsInSummaryFormat', () => {
        beforeEach(() => {
        });

        it('should return empty when length is less than 1', () => {
            let result = component.getRootsInSummaryFormat('');
            expect(result).toEqual('');
        });


        it('should return roots when length is 1', () => {
            let result = component.getRootsInSummaryFormat('O');
            expect(result).toEqual('O');
        });

        it('should call translateSurfaceDetailToSummary when surface length more than 1', () => {
            let result = component.getRootsInSummaryFormat('S,DB');
            expect(result).toEqual('DBS');
        });
    });

    describe('translateRootSummaryToSelections', () => {
        beforeEach(() => {
            const service = TestBed.get(ToothAreaService) as ToothAreaService;

            let toothAreaData = new ToothAreaData;
            toothAreaData.areaSelection = []
            toothAreaData.toothSelection = '1';
            toothAreaData.availableAreas = ['DB', 'P', 'MB'];
            toothAreaData.availableTeeth = [{ USNumber: '1' }, { USNumber: '2' }, { USNumber: '3' }, { USNumber: '4' }, { USNumber: '5' }];
            toothAreaData.serviceCode = { AffectedAreaId: 3 };
            toothAreaData.originalServiceCode = { AffectedAreaId: 3 };
            service.toothAreaData = toothAreaData;
        });

        it('should return P and MB when input is MBP', () => {
            let result = component.translateRootSummaryToSelections('MBP');
            expect(result).toEqual(['MB', 'P']);
        });

    });



});
