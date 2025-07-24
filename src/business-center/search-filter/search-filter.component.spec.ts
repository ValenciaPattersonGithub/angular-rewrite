import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchFilterComponent } from './search-filter.component';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';

const dataPoint = [
    {
        Checked: true,
        Field: 'ServiceCode',
        Key: true,
        Value: 'All',
        isVisible: true
    },
    {
        Checked: false,
        Field: 'ServiceCode',
        Key: true,
        Value: 'Search',
        isVisible: true
    }
];

const searchModel = {
    DisplayColumns: ['Code', 'CdtCodeName', 'Description'],
    FilterDto: '00000000-0000-0000-0000-000000000000',
    FilterDtoColumns: ['ServiceCodeId'],
    FilterString: 'All',
    Name: 'Service Code',
    Reset: true,
    Placeholder: "Search service code, CDT code, description",
    SearchMaterial: [
        {
            CdtCodeName: 'D0120',
            Code: 'D0120',
            Description: 'periodic oral evaluation - established patient'
        },
        {
            CdtCodeName: 'D0140',
            Code: 'D0140',
            Description: 'limited oral evaluation - problem focused'
        },
        {
            CdtCodeName: 'D0145',
            Code: 'D0145',
            Description:
                'oral evaluation for a patient under three years of ago and counseling with primary caregiver'
        },
        {
            CdtCodeName: 'D0150',
            Code: 'D0150',
            Description:
                'comprehensive oral evaluation - new or established patient'
        },
        {
            CdtCodeName: 'D0170',
            Code: 'D0170',
            Description:
                're-evaluation - limited, problem focused (established patient;not post-operative visit)'
        }
    ],
};
describe('SearchFilterComponent', () => {
    let component: SearchFilterComponent;
    let fixture: ComponentFixture<SearchFilterComponent>;
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
            declarations: [SearchFilterComponent],
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
        fixture = TestBed.createComponent(SearchFilterComponent);
        component = fixture.componentInstance;
        component.searchFilterModel = searchModel;

        component.data = [
            {
                Checked: true,
                Field: 'ServiceCode',
                Key: true,
                Value: 'All',
                isVisible: true
            },
            {
                Checked: false,
                Field: 'ServiceCode',
                Key: true,
                Value: 'Search',
                isVisible: true
            }
        ];
        component.matchingItems = [];
        component.selectedItem = '00000000-0000-0000-0000-000000000000';
        component.searchKeywords = '';
        component.itemSelected = false;
        component.selectedItemName = '';
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
        it('initializeMethod should be called', () => {
            expect(component.data[0].Value).toEqual('All');
            expect(component.data[1].Value).toEqual('Search');
            expect(component.searchKeywords).toBe('');
            expect(component.selectedItemName).toBe('');
            expect(component.selectedItem).toBe('00000000-0000-0000-0000-000000000000');
            expect(component.itemSelected).toBe(false);
            expect(component.matchingItems).toEqual([]);
        });
    });

    describe('initializeMethod', () => {
        beforeEach(() => {
            component.searchFilterModel = searchModel;
            component.searchClass = 'col-sm-11';
        });
        it('initializeMethod should be called', () => {
            component.initializeMethod();
            expect(component.filterId).toEqual('serviceCode');
            expect(component.data[0].Value).toEqual('All');
            expect(component.data[1].Value).toEqual('Search');
            expect(component.searchKeywords).toBe('');
            expect(component.selectedItemName).toBe('');
            expect(component.selectedItem).toBe('00000000-0000-0000-0000-000000000000');
            expect(component.itemSelected).toBe(false);
            expect(component.matchingItems).toEqual([]);
        });
        it('initializeMethod searchClass should return col-sm-11', () => {
            expect(component.searchClass).toEqual('col-sm-11');
        });
    });

    describe('toggleRadio ->', () => {
        beforeEach(() => {
            component.searchFilterModel = searchModel;
        });

        it('toggleRadio should be called with filterValue Search', () => {
            const filterValue = 'Search';
            component.emptyGuid = '00000000-0000-0000-0000-000000000000';
            component.selectedItem = 'cbf66064-d4d0-4fd3-b8b2-fcceb2a95b7d';
            component.selectedItemName = 'Jagadeesh';
            component.toggleRadio(filterValue);
            expect(component.searchFilterModel.FilterDto).toEqual(component.selectedItem);
            expect(component.searchFilterModel.FilterString).toEqual('Jagadeesh');
            expect(component.data[0].Checked).toBe(false);
            expect(component.data[1].Checked).toBe(true);
        });

        it('toggleRadio should be called with filterValue All', () => {
            var filterValue = 'All';
            component.emptyGuid = '00000000-0000-0000-0000-000000000000';
            component.toggleRadio(filterValue);
            expect(component.searchFilterModel.FilterDto).toEqual(component.emptyGuid);
            expect(component.searchFilterModel.FilterString).toEqual('All');
            expect(component.data[0].Checked).toBe(true);
            expect(component.data[1].Checked).toBe(false);
            expect(component.matchingItems).toEqual([]);
        });
    });

    describe('selectItem ->', () => {
        beforeEach(() => {
            component.searchFilterModel = searchModel;
        });
        it('selectItem should be called', () => {
            var item = {
                ServiceCodeId: '9310d8ce-7e94-4b98-92c4-6108917d25a8',
                Code: 'D0120'
            };
            component.selectItem(item);
            expect(component.selectedItem).toEqual(
                '9310d8ce-7e94-4b98-92c4-6108917d25a8'
            );
            expect(component.searchFilterModel.FilterDto).toEqual(
                '9310d8ce-7e94-4b98-92c4-6108917d25a8'
            );
            expect(component.searchFilterModel.FilterString).toEqual('D0120');
            expect(component.searchKeywords).toEqual('D0120');
            expect(component.selectedItemName).toEqual('D0120');
            expect(component.matchingItems).toEqual([]);
            expect(component.itemSelected).toBe(true);
        });
    });

    describe('getListFromSearchKeywords ->', () => {
        beforeEach(() => {
            component.matchingItems = [
                { CdtCodeName: 'D0140', Description: 'limited oral evaluation - problem focused' },
                { CdtCodeName: 'D0145', Description: 'oral evaluation for a patient under three years of ago and counseling with primary caregiver' }
            ];
            component.searchFilterModel = searchModel;
        });

        it('getListFromSearchKeywords should return matched objects', () => {
            component.searchKeywords = 'D014';
            component.getListFromSearchKeywords();
            expect(component.matchingItems[0].CdtCodeName).toEqual('D0140');
            expect(component.matchingItems[0].Description).toEqual('limited oral evaluation - problem focused');
            expect(component.matchingItems[1].CdtCodeName).toEqual('D0145');
            expect(component.matchingItems[1].Description).toEqual('oral evaluation for a patient under three years of ago and counseling with primary caregiver');
        });

        it('getListFromSearchKeywords should return empty array', () => {
            component.searchKeywords = 'XYZ';
            component.getListFromSearchKeywords();
            expect(component.matchingItems).toEqual([]);
        });
    });

    describe('searchKeyCode ->', () => {
        beforeEach(() => {
            component.searchFilterModel = searchModel;
        });

        it('searchKeyCode method should not call', () => {
            component.itemSelected = true;
            component.searchKeyCode();
            expect(component.itemSelected).toEqual(false);
        });

        it('searchKeyCode method should not call', () => {
            component.itemSelected = false;
            component.searchKeyCode();
            component.getListFromSearchKeywords();
            expect(component.itemSelected).toEqual(false);
        });
    });

    describe('resetMethod ->', () => {
        beforeEach(() => {
            component.searchFilterModel = searchModel;
            component.matchingItems = [1, 2, 3];
        });

        it('resetMethod method should reset', () => {
            component.initializeMethod();
            component.searchFilterModel.Reset = false;
            expect(component.searchFilterModel.Reset).toBe(false);
            expect(component.matchingItems).toEqual([]);
        });

    });

});
