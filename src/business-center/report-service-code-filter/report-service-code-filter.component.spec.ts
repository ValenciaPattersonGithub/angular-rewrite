import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReportServiceCodeFilterComponent } from './report-service-code-filter.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { EventEmitter } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';

describe('ReportServiceCodeFilterComponent', () => {
    let component: ReportServiceCodeFilterComponent;
    let fixture: ComponentFixture<ReportServiceCodeFilterComponent>;

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
            declarations: [ReportServiceCodeFilterComponent],
            imports: [FormsModule, ReactiveFormsModule,
                TranslateModule.forRoot()],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockTostarfactory }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReportServiceCodeFilterComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: 'localize', useValue: mockLocalizeService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReportServiceCodeFilterComponent);
        component = fixture.componentInstance;
        component.filterModels = { Name: 'Test Filter', SearchMaterial: [], DisplayColumns: ['Name'], FilterDtoColumns: ['Code'] };
        component.includeAll = true;
        component.userDefinedFilter = { ServiceCodeIds: [] };
        component.changeData = new EventEmitter<any>();
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize correctly', () => {
        component.ngOnInit();
        expect(component.emptyGuid).toBe('00000000-0000-0000-0000-000000000000');
        expect(component.searchFilterModel).toEqual(component.filterModels);
        expect(component.data.length).toBe(2);
    });

    it('should toggle radio buttons correctly', () => {
        component.initializeMethod();
        component.toggleRadio('All');
        expect(component.data[0].Checked).toBe(true);
        expect(component.data[1].Checked).toBe(false);
        expect(component.searchFilterModel.FilterString).toBe('All');

        component.toggleRadio('Search');
        expect(component.data[0].Checked).toBe(false);
        expect(component.data[1].Checked).toBe(true);
    });

    it('should reset correctly', () => {
        spyOn(component, 'initializeMethod');
        spyOn(component, 'callSelectedFilters');

        component.resetMethod();

        expect(component.selectedItems.length).toBe(0);
        expect(component.initializeMethod).toHaveBeenCalled();
        expect(component.callSelectedFilters).toHaveBeenCalled();
    });

    it('should build filter string correctly', () => {
        component.selectedItems = [{ Code: 'A' }, { Code: 'B' }];
        const filterString = component.buildFilterString();
        expect(filterString).toBe('A, B');
    });

    it('should remove selected code correctly', () => {
        component.selectedItems = [{ ServiceCodeId: '1' }, { ServiceCodeId: '2' }];
        component.searchFilterModel = { FilterDto: [] };

        component.removeSelectedCode(0, component.selectedItems[0]);

        expect(component.selectedItems.length).toBe(1);
        expect(component.searchFilterModel.FilterDto.length).toBe(1);
    });

    it('should call selected filters and retry if data is not loaded', (done) => {
        component.userDefinedFilter = { ServiceCodeIds: ['1'] };
        component.searchFilterModel = { SearchMaterial: [], FilterDto: [], FilterString: '', DisplayColumns: ['Name'] };

        spyOn(console, 'log');

        component.callSelectedFilters();

        setTimeout(() => {
            expect(console.log).toHaveBeenCalledWith('Data not loaded yet, retrying... (1/10)');
            done();
        }, 1100);
    });
});