import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportNumericFilterComponent } from './report-numeric-filter.component';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
describe('ReportNumericFilterComponent', () => {
    let component: ReportNumericFilterComponent;
    let fixture: ComponentFixture<ReportNumericFilterComponent>;
    const filterModels = {
        Name: 'Numaric Filter',
        FilterId: 21,
        data: [
            {
                Checked: true,
                Field: 'AgingOption',
                FilterValue: null,
                Id: 1,
                Key: true,
                Value: 'All',
                isVisible: true,
                Units: 'Days Outstanding',
                OptionType: 1
            },
            {
                Checked: false,
                Field: 'AgingOption',
                FilterValue: null,
                Id: 2,
                Key: true,
                Value: 'Less Than',
                isVisible: true,
                Units: 'Days Outstanding',
                OptionType: 2
            },
            {
                Checked: false,
                Field: 'AgingOption',
                FilterValue: null,
                Id: 3,
                Key: true,
                Value: 'Greater Than',
                isVisible: true,
                Units: 'Days Outstanding',
                OptionType: 3
            },
            {
                Checked: false,
                Field: 'AgingOption',
                FilterValue: null,
                Id: 4,
                Key: true,
                Value: 'Between',
                isVisible: true,
                Units: 'Days Outstanding',
                OptionType: 4
            }
        ]
    };
    const mockTostarfactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
    };
    const mockLocalizeService = {
        getLocalizedString: jasmine
            .createSpy('localize.getLocalizedString')
            .and.callFake((val) => {
                return val;
            })
    };
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [ReportNumericFilterComponent],
            imports: [FormsModule, ReactiveFormsModule,
                TranslateModule.forRoot()],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockTostarfactory }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReportNumericFilterComponent);
        component = fixture.componentInstance;
        component.filterModels = filterModels;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call ngOnInit', () => {
            component.ngOnInit();
        });
    });

    describe('setFilterDto method ->', () => {
        let OptionTypes = {
            All: 1,
            LessThan: 2,
            GreaterThan: 3,
            Between: 4
        };
        it('FilterDto should be set correctly when given values', () => {
            component.setFilterDto(OptionTypes.LessThan, 3, null);
            expect(component.reportNumericFilterModel.FilterDto.OptionType).toBe(OptionTypes.LessThan);
            expect(component.reportNumericFilterModel.FilterDto.FirstValue).toBe(3);
            expect(component.reportNumericFilterModel.FilterDto.SecondValue).toBe(null);
            expect(component.reportNumericFilterModel.isValid).toBe(true);
        });

        it('Filter should be set to invalid if option is null', () => {
            component.setFilterDto(null, null, null);
            expect(component.reportNumericFilterModel.FilterDto.OptionType).toBe(null);
            expect(component.reportNumericFilterModel.FilterDto.FirstValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterDto.SecondValue).toBe(null);
            expect(component.reportNumericFilterModel.isValid).toBe(false);
        });
    });

    describe('defaultFilterDto method ->', () => {
        beforeEach(() => {

        });
        const OptionTypes = {
            All: 1,
            LessThan: 2,
            GreaterThan: 3,
            Between: 4
        };
        it('FilterDto should be set correctly when given values', () => {
            component.setFilterDto(component.filterModels.data[0].OptionType, null, null);
            expect(component.filterModels.FilterDto.OptionType).toBe(OptionTypes.All);
            expect(component.filterModels.FilterString).toEqual('All');
            expect(component.filterModels.isValid).toBe(true);
        });

    });

    describe('toggleRadio ->', () => {
        let OptionTypes = {
            All: 1,
            LessThan: 2,
            GreaterThan: 3,
            Between: 4
        };
        it('Switching to user input required sets form as invalid', () => {
            let filterValue = 'Less Than';
            component.onChanged.emit = jasmine.createSpy();
            component.toggleRadio(filterValue);
            expect(component.reportNumericFilterModel.data[1].Checked).toBe(true);
            expect(component.reportNumericFilterModel.data[0].Checked).toBe(false);
            expect(component.reportNumericFilterModel.FilterDto.OptionType).toBe(OptionTypes.LessThan);
            expect(component.reportNumericFilterModel.FilterDto.FirstValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterDto.SecondValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterString).toEqual('Less Than\xa0\xa0Days Outstanding');
            expect(component.invalidValues).toEqual(false);
            expect(component.errorMessage).toEqual('');
            expect(component.onChanged.emit).toHaveBeenCalledWith(false);
        });
        it('Switching to all sets form as valid', () => {
            let filterValue = 'All';
            component.onChanged.emit = jasmine.createSpy();
            component.toggleRadio(filterValue);
            expect(component.reportNumericFilterModel.data[0].Checked).toBe(true);
            expect(component.reportNumericFilterModel.data[1].Checked).toBe(false);
            expect(component.reportNumericFilterModel.data[2].Checked).toBe(false);
            expect(component.reportNumericFilterModel.data[3].Checked).toBe(false);
            expect(component.reportNumericFilterModel.FilterDto.OptionType).toBe(OptionTypes.All);
            expect(component.reportNumericFilterModel.FilterDto.FirstValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterDto.SecondValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterString).toEqual('All');
            expect(component.invalidValues).toEqual(false);
            expect(component.errorMessage).toEqual('');
            expect(component.onChanged.emit).toHaveBeenCalledWith(true);
        });
    });

    describe('change ->', () => {
        let OptionTypes = {
            All: 1,
            LessThan: 2,
            GreaterThan: 3,
            Between: 4
        };
        let filterDto = { OptionType: OptionTypes.All, FirstValue: null, SecondValue: null };
        it('Call change method for adding valid value to less than option', () => {
            component.onChanged.emit = jasmine.createSpy();
            component.checkValidity = jasmine.createSpy().and.returnValue('3');
            component.reportNumericFilterModel.FilterDto = filterDto;
            component.change(component.reportNumericFilterModel.data[1], 1, 3);
            expect(component.reportNumericFilterModel.FilterDto.OptionType).toBe(OptionTypes.LessThan);
            expect(component.reportNumericFilterModel.FilterDto.FirstValue).toBe(3);
            expect(component.reportNumericFilterModel.FilterDto.SecondValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterString).toEqual('Less Than\xa03\xa0Days Outstanding');
            expect(component.invalidValues).toEqual(false);
            expect(component.errorMessage).toEqual('');
            expect(component.onChanged.emit).toHaveBeenCalledWith(true);
        });
        it('Call change method for adding valid value to between option', () => {

            component.betweenLessValue = '3';
            component.betweengreaterValue = '3';
            component.onChanged.emit = jasmine.createSpy();
            component.checkValidity = jasmine.createSpy().and.returnValue('3');
            component.reportNumericFilterModel.FilterDto = filterDto;
            component.change(component.reportNumericFilterModel.data[3], 3, 4);
            expect(component.reportNumericFilterModel.FilterDto.OptionType).toBe(OptionTypes.Between);
            expect(component.reportNumericFilterModel.FilterDto.FirstValue).toBe(3);
            expect(component.reportNumericFilterModel.FilterDto.SecondValue).toBe(3);
            expect(component.reportNumericFilterModel.FilterString).toEqual('Between\xa03\xa0and\xa03\xa0Days Outstanding');
            expect(component.invalidValues).toEqual(false);
            expect(component.errorMessage).toEqual('');
            expect(component.onChanged.emit).toHaveBeenCalledWith(true);
        });
        it('Call change method for adding unascending value to between option', () => {
            component.betweenLessValue = '3';
            component.betweengreaterValue = '2';
            component.onChanged.emit = jasmine.createSpy();
            component.checkValidity = jasmine.createSpy().and.returnValues('3', '2');
            component.reportNumericFilterModel.FilterDto = filterDto;
            component.change(component.reportNumericFilterModel.data[3], 3, 1);
            expect(component.reportNumericFilterModel.FilterDto.OptionType).toBe(OptionTypes.All);
            expect(component.reportNumericFilterModel.FilterDto.FirstValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterDto.SecondValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterString).toEqual('Between\xa03\xa0and\xa02\xa0Days Outstanding');
            expect(component.invalidValues).toEqual(true);
            expect(component.errorMessage).toEqual('Please enter valid values');
            expect(component.onChanged.emit).toHaveBeenCalledWith(false);
        });
        it('Call change method for adding invalid value to between option', () => {
            component.betweenLessValue = '';
            component.betweengreaterValue = '';
            component.onChanged.emit = jasmine.createSpy();
            component.checkValidity = jasmine.createSpy().and.returnValue('');
            component.reportNumericFilterModel.FilterDto = filterDto;
            component.change(component.reportNumericFilterModel.data[3], 3, 1);
            expect(component.reportNumericFilterModel.FilterDto.OptionType).toBe(OptionTypes.All);
            expect(component.reportNumericFilterModel.FilterDto.FirstValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterDto.SecondValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterString).toEqual('Between\xa0\xa0and\xa0\xa0Days Outstanding');
            expect(component.invalidValues).toEqual(false);
            expect(component.errorMessage).toEqual('');
            expect(component.onChanged.emit).toHaveBeenCalledWith(false);
        });
        it('Call change method for adding invalid value to less than option', () => {
            component.onChanged.emit = jasmine.createSpy();
            component.checkValidity = jasmine.createSpy().and.returnValue('');
            component.reportNumericFilterModel.FilterDto = filterDto;
            component.change(component.reportNumericFilterModel.data[1], 1, '');
            expect(component.reportNumericFilterModel.FilterDto.OptionType).toBe(OptionTypes.All);
            expect(component.reportNumericFilterModel.FilterDto.FirstValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterDto.SecondValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterString).toEqual('Less Than\xa0\xa0Days Outstanding');
            expect(component.invalidValues).toEqual(false);
            expect(component.errorMessage).toEqual('');
            expect(component.onChanged.emit).toHaveBeenCalledWith(false);
        });
        it('Call change method for null item', () => {
            component.onChanged.emit = jasmine.createSpy();
            component.checkValidity = jasmine.createSpy().and.returnValue('3');
            component.reportNumericFilterModel.FilterDto = filterDto;
            component.reportNumericFilterModel.FilterString = '';
            component.change(null, 1, '');
            expect(component.reportNumericFilterModel.FilterDto.OptionType).toBe(OptionTypes.All);
            expect(component.reportNumericFilterModel.FilterDto.FirstValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterDto.SecondValue).toBe(null);
            expect(component.reportNumericFilterModel.FilterString).toEqual('');
            expect(component.invalidValues).toEqual(false);
            expect(component.errorMessage).toEqual('');
            expect(component.onChanged.emit).toHaveBeenCalledWith(false);
        });
    });

    describe('updateStoredValue ->', () => {
        it('First stored value should be updated', () => {
            component.storedValue = '3';
            component.updateStoredValue(1, '32');
            expect(component.storedValue).toEqual('32');
        });
        it('Second stored value should be updated', () => {
            component.storedValue2 = '6';
            component.updateStoredValue(2, '64');
            expect(component.storedValue2).toEqual('64');
        });
    });

    describe('getStoredValue ->', () => {
        it('First stored value should return', () => {
            component.updateStoredValue(1, '3');
            let value = component.getStoredValue(1);
            expect(value).toEqual('3');
            expect(component.storedValue).toEqual('3');
        });
        it('Second stored value should return', () => {
            component.updateStoredValue(2, '6');
            let value = component.getStoredValue(2);
            expect(value).toEqual('6');
            expect(component.storedValue2).toEqual('6');
        });
    });

    describe('resetFilterValues ->', () => {
        it('Should set input values to empty strings', () => {
            component.lessThanValue = '';
            component.greaterThanValue = '';
            component.betweenLessValue = '';
            component.betweengreaterValue = '';
            component.updateStoredValue(1, '3');
            component.updateStoredValue(2, '6');
            component.resetFilterValues('');
            expect(component.lessThanValue).toEqual('');
            expect(component.betweenLessValue).toEqual('');
            expect(component.betweengreaterValue).toEqual('');
            expect(component.storedValue).toEqual('');
            expect(component.storedValue2).toEqual('');
        });
    });

    describe('buildFilterString ->', () => {
        it('Should return filter string for less than option type', () => {
            component.lessThanValue = '2';
            const value = component.buildFilterString(component.reportNumericFilterModel.data[1], component.lessThanValue);
            expect(value).toBe('Less Than\xa02\xa0Days Outstanding');
        });
        it('Should return filter string for between option type', () => {
            component.betweenLessValue = '3';
            component.betweengreaterValue = '6';
            const value = component.buildFilterString(component.reportNumericFilterModel.data[3], '');
            expect(value).toBe('Between' + '\xa0' + '3' + '\xa0' + 'and' + '\xa0' + '6' + '\xa0' + 'Days Outstanding');
        });
        it('Should return filter string for all option type', () => {
            const value = component.buildFilterString(component.reportNumericFilterModel.data[0], '');
            expect(value).toBe('All');
        });
    });

    describe('numericReset ->', () => {
        it('numericReset method should be called', () => {
            component.numericReset();
            expect(component.invalidValues).toBe(false);
            expect(component.errorMessage).toEqual('');
            component.onChanged.emit = jasmine.createSpy();
        });

    });

});
