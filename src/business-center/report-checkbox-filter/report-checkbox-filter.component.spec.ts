import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportCheckboxFilterComponent } from './report-checkbox-filter.component';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
describe('ReportCheckboxFilterComponent', () => {
    let component: ReportCheckboxFilterComponent;
    let fixture: ComponentFixture<ReportCheckboxFilterComponent>;

    let reportCheckboxFilterModel = {
        ActualFilterString: 'All',
        DefaultAll: false,
        DefaultFilterCount: 1,
        FilterDto: [{ 0: 1 }],
        FilterFilterModel: null,
        FilterId: 'locations',
        FilterString: 'Default Practice - MB (CST)',
        Name: 'Locations',
        Reset: false,
        data: [
            {
                Checked: false,
                Field: 'Locations',
                Id: 0,
                Key: true,
                LocationStatus: 'All Status',
                Value: 'All',
                isVisible: true
            },
            {
                Checked: false,
                Field: 'Locations',
                Id: 5,
                Key: true,
                LocationStatus: 'Active',
                Value: '@123 (EST)',
                isVisible: true
            },
            {
                Checked: false,
                Field: 'Locations',
                Id: 3,
                Key: true,
                LocationStatus: 'Active',
                Value: '123 (HST)',
                isVisible: true
            },
            {
                Checked: false,
                Field: 'Locations',
                Id: 4,
                Key: true,
                LocationStatus: 'Active',
                Value: '123abc (HAST)',
                isVisible: true
            },
            {
                Checked: false,
                Field: 'Locations',
                Id: 1,
                Key: true,
                LocationStatus: 'Active',
                Value: 'Default Practice - MB (CST)',
                isVisible: true
            },
            {
                Checked: false,
                Field: 'Locations',
                Id: 6,
                Key: true,
                LocationStatus: 'Active',
                Value: 'Jangaon (HAST)',
                isVisible: true
            },
            {
                Checked: false,
                Field: 'Locations',
                Id: 2,
                Key: true,
                LocationStatus: 'Active',
                Value: '#abc (HAST)',
                isVisible: true
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
            declarations: [ReportCheckboxFilterComponent],
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
        fixture = TestBed.createComponent(ReportCheckboxFilterComponent);
        component = fixture.componentInstance;
        component.reportCheckboxFilterModel = reportCheckboxFilterModel;
        component.showMoreButtonText = 'Show More';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
        });
        it('should call ngOnInit', () => {
            component.ngOnInit();
        });
    });

    describe('showMoreButton ->', () => {
        beforeEach(() => {
            component.reportCheckboxFilterModel = reportCheckboxFilterModel;
        });

        it('showMoreButton should be called', () => {
            component.showMoreButtonText = 'Show Less';
            const model = reportCheckboxFilterModel;
            component.showMoreButton(model);
            expect(component.reportCheckboxFilterModel.data[0].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[1].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[2].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[3].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[4].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[5].isVisible).toBe(false);
            expect(component.reportCheckboxFilterModel.data[6].isVisible).toBe(false);
            expect(component.showMoreButtonText).toEqual('Show More');
        });

        it('showMoreButton should be called', () => {
            component.showMoreButtonText = 'Show More';
            const model = component.reportCheckboxFilterModel;
            component.showMoreButton(model);
            expect(component.reportCheckboxFilterModel.data[0].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[1].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[2].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[3].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[4].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[5].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[6].isVisible).toBe(true);
            expect(component.showMoreButtonText).toEqual('Show Less');
        });
    });

    describe('showMoreCheck ->', () => {
        beforeEach(() => {
            component.reportCheckboxFilterModel = reportCheckboxFilterModel;
        });

        it('showMoreCheck should be called', () => {
            component.showMoreButtonText = 'Show More';
            const model = component.reportCheckboxFilterModel;
            component.showMoreCheck(model);
            expect(component.reportCheckboxFilterModel.data[0].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[1].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[2].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[3].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[4].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[5].isVisible).toBe(false);
            expect(component.reportCheckboxFilterModel.data[6].isVisible).toBe(false);
        });

        it('ctrl.showMoreCheck should be called', () => {
            component.showMoreButtonText = 'Show Less';
            const model = component.reportCheckboxFilterModel;
            component.showMoreCheck(model);
            expect(component.reportCheckboxFilterModel.data[0].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[1].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[2].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[3].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[4].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[5].isVisible).toBe(true);
            expect(component.reportCheckboxFilterModel.data[6].isVisible).toBe(true);
        });
    });

    describe('getSelectedItemStrings ->', () => {
        beforeEach(() => {
            component.reportCheckboxFilterModel = reportCheckboxFilterModel;
        });
        it('getSelectedItemStrings should be called', () => {
            component.reportCheckboxFilterModel.data[4].Checked = true;
            const model = component.reportCheckboxFilterModel;
            const result = component.getSelectedItemStrings(model);
            expect(result).toEqual(['Default Practice - MB (CST)']);
        });
    });

    describe('getSelectedItemIds ->', () => {
        beforeEach(() => {
            component.reportCheckboxFilterModel = reportCheckboxFilterModel;
        });
        it('getSelectedItemIds should be called', () => {
            component.useAllOptionInDto = false;
            component.reportCheckboxFilterModel.data[5].Checked = true;
            const model = component.reportCheckboxFilterModel;
            const result = component.getSelectedItemIds(model);
            expect(result[0]).toEqual(1);
        });
    });

    describe('setFilterString ->', () => {
        beforeEach(() => {
            component.reportCheckboxFilterModel = reportCheckboxFilterModel;
        });
        it('setFilterString should be called', () => {
            component.reportCheckboxFilterModel.data[0].Checked = true;
            const model = component.reportCheckboxFilterModel;
            component.setFilterString(model);
            expect(model.FilterString).toEqual('All');
        });

        it('setFilterString should be called', () => {
            component.reportCheckboxFilterModel.data[0].Checked = false;
            component.reportCheckboxFilterModel.data[2].Checked = true;
            const model = component.reportCheckboxFilterModel;
            component.setFilterString(model);
            expect(model.FilterString).toEqual('123 (HST), Default Practice - MB (CST), Jangaon (HAST)');
        });

        it('setFilterString should be called', () => {
            component.reportCheckboxFilterModel.data[0].Checked = false;
            component.reportCheckboxFilterModel.data[1].Checked = false;
            component.reportCheckboxFilterModel.data[2].Checked = false;
            component.reportCheckboxFilterModel.data[3].Checked = false;
            component.reportCheckboxFilterModel.data[4].Checked = false;
            component.reportCheckboxFilterModel.data[5].Checked = false;
            component.reportCheckboxFilterModel.data[6].Checked = false;
            const model = component.reportCheckboxFilterModel;
            component.setFilterString(model);
            expect(model.FilterString).toEqual('No filters applied');
        });
    });

    describe('hasLocations ->', () => {
        beforeEach(() => {
            component.reportCheckboxFilterModel = reportCheckboxFilterModel;
        });

        it('hasLocations should be called with Active true', () => {
            const model = reportCheckboxFilterModel.data;
            const result = component.hasLocations(model, 'Active');
            expect(result).toEqual(true);
        });

        it('hasLocations should be called with Pending Inactive false', () => {
            const model = reportCheckboxFilterModel.data;
            const result = component.hasLocations(model, 'Pending Inactive');
            expect(result).toEqual(false);
        });

        it('hasLocations should be called with Inactive false', () => {
            const model = reportCheckboxFilterModel.data;
            const result = component.hasLocations(model, 'Inactive');
            expect(result).toEqual(false);
        });
    });

    describe('hasUsersWithGivenActiveState ->', () => {
        beforeEach(() => {
            component.reportCheckboxFilterModel = reportCheckboxFilterModel;
        });

        it('hasUsersWithGivenActiveState should be called with true', () => {
            const model = reportCheckboxFilterModel.data;
            const result = component.hasUsersWithGivenActiveState(model, true);
            expect(result).toEqual(false);
        });

        it('hasLocations should be called with false', () => {
            const model = reportCheckboxFilterModel.data;
            const result = component.hasUsersWithGivenActiveState(model, false);
            expect(result).toEqual(false);
        });
    });

    describe('buildFilterString ->', () => {
        beforeEach(() => {
        });
        it('buildFilterString should be called with All', () => {
            const model = {
                data: [
                    {
                        Checked: true,
                        Field: 'All',
                        Id: 2,
                        Key: true,
                        LocationStatus: 'Active',
                        Value: 'All',
                        isVisible: true
                    }
                ]
            };
            const result = component.buildFilterString(model);
            expect(result).toEqual(mockLocalizeService.getLocalizedString('All'));
        });

        it('buildFilterString should be called', () => {
            const model = {
                data: [
                    {
                        Checked: false,
                        Field: 'All',
                        Id: 2,
                        Key: true,
                        LocationStatus: 'Active',
                        Value: 'All',
                        isVisible: true
                    }
                ]
            };
            const result = component.buildFilterString(model);
            expect(result).toEqual(mockLocalizeService.getLocalizedString('No filters applied'));
        });
    });

    describe('resetMethod ->', () => {
        beforeEach(() => {
            component.reportCheckboxFilterModel = reportCheckboxFilterModel;
        });
        it('resetMethod should be called', () => {
            component.showMoreButtonText = mockLocalizeService.getLocalizedString('Show Less')
            component.showMoreCheck(component.reportCheckboxFilterModel);
        });

    });

    describe('setArrayVisibility ->', () => {
        beforeEach(() => {
            component.reportCheckboxFilterModel = reportCheckboxFilterModel;
        });
        it('setArrayVisibility should be return with false', () => {
            component.setArrayVisibility(component.reportCheckboxFilterModel.data, false);
            expect(component.reportCheckboxFilterModel.data[5].isVisible).toEqual(false);
        });
        it('setArrayVisibility should be return with true', () => {
            component.setArrayVisibility(component.reportCheckboxFilterModel.data, true);
            expect(component.reportCheckboxFilterModel.data[5].isVisible).toEqual(true);
        });
    });
});
