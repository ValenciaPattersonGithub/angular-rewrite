import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientTransactionPrintComponent } from './patient-transaction-print.component';
import { RequestTransactionHistoryArgs, SoarTransactionHistoryHttpService } from 'src/@core/http-services/soar-transaction-history-http.service';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';


describe('PatientTransactionPrintComponent', () => {
    let component: PatientTransactionPrintComponent;
    let fixture: ComponentFixture<PatientTransactionPrintComponent>;

    let mockTransactionHistoryService;
    let filterObject;
    let mockPrintOptions;
    let routeParams;

    beforeEach(async () => {
        mockTransactionHistoryService = {
            requestTransactionHistory: jasmine.createSpy().and.returnValue({
                subscribe: jasmine.createSpy(),
            }),
        };
        filterObject = {
            FromDate: null,
            ToDate: null,
            PersonIds: null,
            TransactionTypes: null,
            LocationIds: null,
            ProviderIds: null,
            Statuses: null,
            Teeth: null
        };

        mockPrintOptions = {
            FilterObject: filterObject,
            SortObject: { Date: 2 },
            ReportType: 'Print',
            FilterAccountMembers: 'All',
            FilterLocations: 'All',
            FilterDateRange: null,
            FilterTooth: 'All',
            FilterTransactionTypes: 'All',
            FilterProviders: 'All',
            FilterStatus: 'All',
            ResponsiblePartyInfo: '123456',
            PatientId: '123456789',
            UserCode: 'UCTV',
            ReportHeader: 'ReportName'
        };

        routeParams = {
            accountId: '1234',
            PrevLocation: 'AccountSummary'
        };

        await TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot()
            ],
            providers: [
                { provide: '$routeParams', useValue: routeParams },
                { provide: SoarTransactionHistoryHttpService, useValue: mockTransactionHistoryService },
            ],
            declarations: [PatientTransactionPrintComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientTransactionPrintComponent);
        component = fixture.componentInstance;
        localStorage.setItem('printTransactionHistory_' + routeParams.accountId, JSON.stringify(mockPrintOptions));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
            spyOn(component, 'loadTransactionHistory');
            var userPractice = '{"name": "Practice1"}';
            sessionStorage.setItem('userPractice', userPractice);
            localStorage.setItem('printTransactionHistory_' + routeParams.accountId, JSON.stringify(mockPrintOptions));
        });
        it('should load accountId from route', () => {
            component.ngOnInit()
            expect(component.accountId).toEqual(routeParams.accountId)
        });
        it('should load practiceName from sessionStorage', () => {
            component.ngOnInit()
            expect(component.practiceName).toEqual('Practice1')
        });
        it('should load printOptions from localStorage', () => {
            component.ngOnInit();
            expect(component.printOptions).toEqual(mockPrintOptions)
        });
        it('should call loadTransactionHistory', () => {
            component.ngOnInit();
            expect(component.loadTransactionHistory).toHaveBeenCalled();
        });
        it('should remove item from localStorage', () => {
            localStorage.removeItem = jasmine.createSpy();
            component.ngOnInit();
            expect(localStorage.removeItem).toHaveBeenCalledWith('printTransactionHistory_' + routeParams.accountId);
        });
    })

    describe('loadTransactionHistory', () => {
        let requestArgs: RequestTransactionHistoryArgs;
        beforeEach(() => {
            requestArgs = {
                AccountId: component.$routeParams.accountId,
                FilterCriteria: component.printOptions.FilterObject,
                SortCriteria: component.printOptions.SortObject,
                PageCount: 0,
                CurrentPage: 0
            };
        });
        it('should call transactionHistoryService.requestTransactionHistor with args', function () {
            component.loadTransactionHistory();
            expect(mockTransactionHistoryService.requestTransactionHistory).toHaveBeenCalledWith(requestArgs);
        });

    })
});
