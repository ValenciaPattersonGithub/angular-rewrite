import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommunicationSort } from 'src/patient/common/models/enums/communication-sort.enum';
import { CommunicationCenterTimelineComponent } from './communication-center-timeline.component';
import { CommunicationCardComponent } from '../communication-card/communication-card.component';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { of, BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommunicationCategory } from 'src/patient/common/models/enums';
import { DatePipe } from '@angular/common';
import { AppButtonComponent } from 'src/@shared/components/form-controls/button/button.component';
import { PatientDetailService } from 'src/patient/patient-detail/services/patient-detail.service';
import { configureTestSuite } from 'src/configure-test-suite';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
import { HttpClient } from '@microsoft/signalr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProviderOnScheduleDropdownService } from 'src/scheduling/providers/provider-on-schedule-dropdown.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

describe('CommunicationCenterTimelineComponent', () => {
    let component: CommunicationCenterTimelineComponent;
    let fixture: ComponentFixture<CommunicationCenterTimelineComponent>;
    let patientCommunicationService: any;
    let patientDetailService: any;
    let httpClient: HttpClient;
    const updatePatientCommSubjectMock = new BehaviorSubject<{}>(undefined);
    const mockPatientCommunicationCenterService: any = {
        getPatientCommunicationByPatientId: (a: any) => of([{}]),
        updatePatientCommunications$: updatePatientCommSubjectMock,
        getCommunicationEvent: (a: any) => of({}),
        setCommunicationEvent: (a: any) => of({}),
        GetPatientCommunicationTemplates: () => of({}),
        patientDetail: of({}),
        createAccountNoteCommunication: (a: any, b: any) => of({}),
        updatePatientCommunication: (a: any, b: any) => of({}),
        getPatientInfoByPatientId: (a: any) => of({}),
        getPatientNextAppointment: (a: any) => of({})
    };
    const mockPatientDetailService: any = {
        getPatientDashboardOverviewByPatientId: (a: any) => new Promise((resolve, reject) => { }),
        setPatientPreferredDentist: (a: any) => of({}),
        setPatientPreferredHygienist: (a: any) => of({}),
        getNextAppointmentStartTimeLocalized: (a: any) => { }
    };
    const mockRouteParams = {
        patientId: '4321'
    };
    const mockreferenceDataService = {
        get: jasmine.createSpy().and.returnValue([{}]),
        entityNames: {
            users: 'users'
        }
    };
    const mockTostarfactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
    };
    const mockTabLauncher = jasmine.createSpy();
    const mockDatePipe: any = {
        transform: (a: any) => { }
    };
    let scheduleFactoryPromise: Promise<any> = new Promise<any>((resolve, reject) => { });
    let mockShowOnScheduleFactory: any = {
        getAll: jasmine.createSpy().and.returnValue(scheduleFactoryPromise)
    };
    const mockReferralSourcesService = {
        get: jasmine.createSpy('get').and.returnValue({
          $promise: Promise.resolve({
            Value: [
              { value: "00000000-0000-0000-0000-000000000001", text: "Email" },
              { value: "00000000-0000-0000-0000-000000000002", text: "Instagram" },
              { value: "00000000-0000-0000-0000-000000000003", text: "Facebook" },
              { value: "00000000-0000-0000-0000-000000000004", text: "LinkedIn" },
              { value: "00000000-0000-0000-0000-000000000005", text: "Twitter" },
              { value: "00000000-0000-0000-0000-000000000006", text: "Other" }
            ]
          })
        })
      };

    const mockFeatureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of("white"))
    }

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), HttpClientTestingModule],
            declarations: [CommunicationCenterTimelineComponent, CommunicationCardComponent, EnumAsStringPipe, AppButtonComponent],
            providers: [
                HttpClient,
                ProviderOnScheduleDropdownService,
                ReferralManagementHttpService,
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: 'tabLauncher', useValue: mockTabLauncher },
                { provide: DatePipe, useValue: mockDatePipe },
                { provide: PatientDetailService, useValue: mockPatientDetailService },
                { provide: 'SoarConfig', useValue: {} },
                { provide: 'ProviderShowOnScheduleFactory', useValue: mockShowOnScheduleFactory },
                { provide: 'ReferralSourcesService', useValue: mockReferralSourcesService },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService }
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationCenterTimelineComponent);
        component = fixture.componentInstance;
        patientCommunicationService = TestBed.get(PatientCommunicationCenterService);
        patientDetailService = TestBed.get(PatientDetailService);
        httpClient = TestBed.inject(HttpClient);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('buildCommunicationGroups', () => {
        it('should Add communication in todayComunications', () => {
            spyOn(component, 'buildCurrentCommunications').and.callThrough();
            const mockCommunication: any = {
                CommunicationDate: new Date()
            };
            component.buildCommunicationGroups(mockCommunication);
            expect(component.todayComunications).toBeDefined();
            expect(component.todayComunications.length).toEqual(1);
            expect(component.buildCurrentCommunications).toHaveBeenCalledTimes(1);
        });

        it('should Add communication in yesterdayComunications', () => {
            const todaysDate = new Date();
            const mockCommunication: any = {
                CommunicationDate: new Date(new Date(new Date().setDate(todaysDate.getDay() - 1)))
            };
            component.buildCommunicationGroups(mockCommunication);
            expect(component.yesterdayComunications).toBeDefined();
        });

        it('should Add communication in currentWeekComunications', () => {
            spyOn(component, 'buildCurrentCommunications');
            const todaysDate = new Date();
            const mockCommunication: any = {
                CommunicationDate: new Date(new Date().setDate(todaysDate.getDay() - 1))
            };
            component.communicationsFilterObject = {
                sort: CommunicationSort.NewestToOldest
            };
            component.buildCommunicationGroups(mockCommunication);
            expect(component.currentWeekComunications).toBeDefined();
            expect(component.buildCurrentCommunications).toHaveBeenCalledTimes(1);
        });

        it('should Add communication in previousWeekComunications', () => {
            component.patientCommunications = [];
            component.defaultCommunications = [];
            const todaysDate = new Date();
            const mockCommunication: any = {
                CommunicationDate: new Date(new Date().setDate(todaysDate.getDate() - 7))
            };
            component.communicationsFilterObject = {
                sort: CommunicationSort.NewestToOldest
            };
            component.buildCommunicationGroups(mockCommunication);
            expect(component.previousWeekComunications).toBeDefined();
        });

        it('should Add communication in currentMonthComunications', () => {
            component.patientCommunications = [];
            component.defaultCommunications = [];
            spyOn(component, 'buildCurrentCommunications');
            const todaysDate = new Date();
            const mockCommunication: any = {
                CommunicationDate: new Date(todaysDate.getFullYear(), todaysDate.getMonth(), 1)
            };
            component.buildCommunicationGroups(mockCommunication);
            expect(component.currentMonthComunications).toBeDefined();
            expect(component.buildCurrentCommunications).toHaveBeenCalledTimes(1);
        });

        it('should Add communication in previousMonthComunications', () => {
            spyOn(component, 'buildCurrentCommunications').and.callThrough();
            component.todaysDate = new Date(2019, 11, 1);

            const mockCommunication: any = {
                CommunicationDate: new Date(2019, 10, 1)
            };
            component.buildCommunicationGroups(mockCommunication);
            expect(component.previousMonthComunications).toBeDefined();
            expect(component.previousMonthComunications.length).toEqual(1);
            expect(component.buildCurrentCommunications).toHaveBeenCalledTimes(1);
        });

        it('should Add communication in currentYearComunications', () => {
            spyOn(component, 'buildCurrentCommunications').and.callThrough();
            component.todaysDate = new Date(2019, 11, 1);
            const mockCommunication: any = {
                CommunicationDate: new Date(2019, 9, 1)
            };
            component.buildCommunicationGroups(mockCommunication);
            expect(component.currentYearComunications).toBeDefined();
            expect(component.currentYearComunications.length).toEqual(1);
            expect(component.buildCurrentCommunications).toHaveBeenCalledTimes(1);
        });

        it('should Add communication in previousYearComunications', () => {
            spyOn(component, 'buildCurrentCommunications').and.callThrough();
            const todaysDate = new Date();
            const mockCommunication: any = {
                CommunicationDate: new Date(todaysDate.getFullYear() - 1, 1, 1)
            };
            component.buildCommunicationGroups(mockCommunication);
            expect(component.previousYearComunications).toBeDefined();
            expect(component.previousYearComunications.length).toEqual(1);
            expect(component.buildCurrentCommunications).toHaveBeenCalledTimes(1);
        });

        it('should Add communication in priorYearsComunications', () => {
            spyOn(component, 'buildCurrentCommunications').and.callThrough();
            const todaysDate = new Date();
            const mockCommunication: any = {
                CommunicationDate: new Date(todaysDate.getFullYear() - 2, 1, 1)
            };
            component.buildCommunicationGroups(mockCommunication);
            expect(component.priorYearsComunications).toBeDefined();
            expect(component.priorYearsComunications.length).toEqual(1);
            expect(component.buildCurrentCommunications).toHaveBeenCalledTimes(1);
        });

    });
    describe('sortCommunications', () => {
        it('should sort communications from newest to oldest', () => {
            const communicationsFilterObject = {
                SortFilter: CommunicationSort.NewestToOldest
            };
            const communications = [{
                CommunicationDate: new Date(),
                CommunicationType: 2,
                Reason: 3,
                Notes: 'Communication New',
                CommunicationCategory: 5
            }, {
                CommunicationDate: new Date(new Date().getTime() - (1 * 24 * 60 * 60 * 1000)),
                CommunicationType: 3,
                Reason: 7,
                Notes: 'Communication Old',
                CommunicationCategory: 2
            }];
            component.filterCommunications(communicationsFilterObject, communications);
            expect(component.todayComunications).toBeDefined();
            expect(component.filteredCommunications.length).toEqual(2);
            expect(component.filteredCommunications[0].Notes).toEqual('Communication New');
            expect(component.filteredCommunications[1].Notes).toEqual('Communication Old');
        });
        it('should sort communications from oldest to newest', () => {
            const communicationsFilterObject = {
                SortFilter: CommunicationSort.OldestToNewest
            };
            const communications = [{
                CommunicationDate: new Date(),
                CommunicationType: 1,
                Reason: 4,
                Notes: 'Communication New',
                CommunicationCategory: 6
            }, {
                CommunicationDate: new Date(new Date().getTime() - (1 * 24 * 60 * 60 * 1000)),
                CommunicationType: 4,
                Reason: 6,
                Notes: 'Communication Old',
                CommunicationCategory: 1
            }];
            component.filterCommunications(communicationsFilterObject, communications);
            expect(component.todayComunications).toBeDefined();
            expect(component.filteredCommunications.length).toEqual(2);
            expect(component.filteredCommunications[0].Notes).toEqual('Communication Old');
            expect(component.filteredCommunications[1].Notes).toEqual('Communication New');
        });
    });
    describe('filter Communication on Category', () => {
        it('should Filter communications for selected category Filter', () => {
            const communicationsFilterObject = {
                SortFilter: CommunicationSort.OldestToNewest,
                CategoryFilter: CommunicationCategory.Insurance
            };
            const communications = [{
                CommunicationDate: new Date(),
                CommunicationType: 2,
                Reason: 3,
                Notes: 'Communication New',
                CommunicationCategory: 5
            }, {
                CommunicationDate: new Date(new Date().getTime() - (1 * 24 * 60 * 60 * 1000)),
                CommunicationType: 3,
                Reason: 7,
                Notes: 'Communication Old',
                CommunicationCategory: 2
            }];
            component.filterCommunications(communicationsFilterObject, communications);
            expect(component.todayComunications).toBeDefined();
            expect(component.filteredCommunications.length).toEqual(1);
            expect(component.filteredCommunications[0].CommunicationCategory).toEqual(CommunicationCategory.Insurance);
        });
        it('should not apply categoryFilter for All Categories ', () => {
            const communicationsFilterObject = {
                SortFilter: CommunicationSort.OldestToNewest,
                CategoryFilter: -1
            };
            const communications = [{
                CommunicationDate: new Date(),
                CommunicationType: 1,
                Reason: 4,
                Notes: 'Communication New',
                CommunicationCategory: 6
            }, {
                CommunicationDate: new Date(new Date().getTime() - (1 * 24 * 60 * 60 * 1000)),
                CommunicationType: 4,
                Reason: 6,
                Notes: 'Communication Old',
                CommunicationCategory: 1
            }];
            component.filterCommunications(communicationsFilterObject, communications);
            expect(component.todayComunications).toBeDefined();
            expect(component.filteredCommunications.length).toEqual(2);
            expect(component.filteredCommunications[0].Notes).toEqual('Communication Old');
            expect(component.filteredCommunications[1].Notes).toEqual('Communication New');
        });
    });
    describe('filter Communication on Date', () => {
        it('should Filter communications for only Start date Filter', () => {
            const communicationsFilterObject = {
                SortFilter: CommunicationSort.OldestToNewest,
                CategoryFilter: -1,
                StartDate: new Date(new Date().toDateString())

            };
            const communications = [{
                CommunicationDate: new Date(),
                CommunicationType: 2,
                Reason: 3,
                Notes: 'Communication New',
                CommunicationCategory: 5
            }, {
                CommunicationDate: new Date(),
                CommunicationType: 3,
                Reason: 7,
                Notes: 'Communication Old',
                CommunicationCategory: 2
            }];
            component.filterCommunications(communicationsFilterObject, communications);
            expect(component.todayComunications).toBeDefined();
            expect(component.filteredCommunications.length).toEqual(2);
        });
        it('should Filter communications for only End date Filter', () => {
            const communicationsFilterObject = {
                SortFilter: CommunicationSort.OldestToNewest,
                CategoryFilter: -1,
                EndDate: new Date(new Date().toDateString())
            };
            const communications = [{
                CommunicationDate: new Date(new Date().toDateString()),
                CommunicationType: 1,
                Reason: 4,
                Notes: 'Communication New',
                CommunicationCategory: 6
            }, {
                CommunicationDate: new Date(),
                CommunicationType: 4,
                Reason: 6,
                Notes: 'Communication Old',
                CommunicationCategory: 1
            }];
            component.filterCommunications(communicationsFilterObject, communications);
            expect(component.todayComunications).toBeDefined();
            expect(component.filteredCommunications.length).toEqual(2);
        });
        it('should Filter communications for Both Start Date and End date Filter', () => {
            const communicationsFilterObject = {
                SortFilter: CommunicationSort.OldestToNewest,
                CategoryFilter: -1,
                StartDate: new Date(new Date(new Date().getTime() - (1 * 24 * 60 * 60 * 1000)).toDateString()),
                EndDate: new Date(new Date().toDateString())
            };
            const communications = [{
                CommunicationDate: new Date(new Date().toDateString()),
                CommunicationType: 1,
                Reason: 4,
                Notes: 'Communication New',
                CommunicationCategory: 6
            }, {
                CommunicationDate: new Date(new Date().getTime() - (1 * 24 * 60 * 60 * 1000)),
                CommunicationType: 4,
                Reason: 6,
                Notes: 'Communication Old',
                CommunicationCategory: 1
            }];
            component.filterCommunications(communicationsFilterObject, communications);
            expect(component.todayComunications).toBeDefined();
            expect(component.filteredCommunications.length).toEqual(2);
        });
    });
});
