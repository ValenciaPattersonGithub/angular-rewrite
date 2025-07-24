import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PatientReferralsFilterComponent } from './patient-referrals-filter.component';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { HighlightTextIfContainsPipe } from 'src/@shared/pipes';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
describe('PatientReferralsFilterComponent', () => {
    let component: PatientReferralsFilterComponent;
    let fixture: ComponentFixture<PatientReferralsFilterComponent>;
    const mockTostarfactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
    };
    let mockFilterModel = {
        ActualFilterString: 'All',
        FilterString: 'No filters applied',
        Name: 'Referral Sources',
        ReferralPatientIdName: 'ReferringPatientIds',
        ReferralSourceIdName: 'ReferralSourceIds',
        ReferringPatientIdFilterDto: [],
        ReferringSourceIdFilterDto: [],
        selectedAll: false,
        selectedPatients: [],
        selectedReferralSources: [],
        selectedReferralType: '2',
        totalSelected: 0
    };
    let mockPatientReferralTypes = {
        Other: 1,
        Person: 2
    };
    const mockLocalizeService = {
        getLocalizedString: jasmine
            .createSpy('localize.getLocalizedString')
            .and.callFake((val) => {
                return val;
            })
    };
    let mockSearchFactory = {
        CreateSearch: jasmine
            .createSpy()
            .and.returnValue({ Results: [] })
    };
    let mockGlobalSearchFactory = {
        SaveMostRecentPerson: jasmine
            .createSpy()
            .and.returnValue({})
    };

    let referralSources = {
        Value: [
            {
                PatientReferralSourceId: "2df3b05f-d2b4-40fd-86fa-44c93cec7425",
                SourceName: "facebook",
                DataTag: "AAAAAAAAyeE=",
                UserModified: "d0be7456-e01b-e811-b7c1-a4db3021bfa0",
                DateModified: "2020-02-20T11:54:55.5081129"
            }
        ]
    }

    let mockReferralSourcesService = {
        get: jasmine.createSpy('ReferralSourcesService.get').and.returnValue({
            $promise: {
                Value: [],
                then: (callback) => {
                    callback({
                        Value:
                            referralSources.Value
                    })
                }
            }
        })
    };

    let mockPatientServices = {
        Patients: {
            search: jasmine
                .createSpy()
                .and.returnValue({}),
            get: jasmine.createSpy().and.returnValue({})
        }
    };

    let mockListHelper = {
        findItemByFieldValue: jasmine
            .createSpy()
            .and.returnValue({}),
        get: jasmine.createSpy().and.returnValue({})
    };


    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [PatientReferralsFilterComponent, HighlightTextIfContainsPipe, ToShortDisplayDateUtcPipe],
            imports: [FormsModule, ReactiveFormsModule,
                TranslateModule.forRoot()],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: 'SearchFactory', useValue: mockSearchFactory },
                { provide: 'GlobalSearchFactory', useValue: mockGlobalSearchFactory },
                { provide: 'ReferralSourcesService', useValue: mockReferralSourcesService },
                { provide: 'PatientServices', useValue: mockPatientServices },
                { provide: 'ListHelper', useValue: mockListHelper }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientReferralsFilterComponent);
        component = fixture.componentInstance;
        component.filterModels = {
            selectedReferralType: null
        };
        component.options = [{
            Id: 1,
            Name: "Other",
            Order: 1
        },
        {
            Id: 2,
            Name: "Person",
            Order: 2
        }
        ]
        component.patientSearchParams = {
            searchFor: '',
            skip: 0,
            take: 45,
            sortBy: 'LastName',
            includeInactive: false
        };
        component.emptyGuid = '00000000-0000-0000-0000-000000000000';
        component.selectedAll = true;
        component.selectedPatients = [];
        component.selectedReferralSources = [];
        // Gets patient referral types, constants
        component.patientReferralTypesData = component.options;
        component.patientReferralTypes = {};

        // Gets options for select element
        component.patientReferralTypeOptions = [];

        component.referral = {};
        component.referral.ReferralSourceId = null;
        component.patientSearch = {
            Results: [{
                PatientId: "103cf202-7761-4698-87f3-60622ed8d424",
                FirstName: "Sudheer",
                LastName: "Kumar",
                MiddleName: "P",
                Suffix: "Sr",
                PreferredName: "",
                DateOfBirth: null,
                IsPatient: true,
                PatientCode: "KUMSU1",
                IsActive: true,
                DirectoryAllocationId: "45f48b55-8b33-ea11-9cbb-4889e7340df9",
                DisplayStatementAccountId: "1-21"
            }]
        };
        component.referralSources = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(mockReferralSourcesService.get).toHaveBeenCalled();
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
        });
        it('should call ngOnInit', () => {
            component.ngOnInit();
        });
    });

    describe('referralSourcesServiceGetSuccess ->', () => {
        it('referralSourcesServiceGetSuccess should be', () => {
            var resultObject = {
                Value: [
                    {
                        PatientReferralSourceId: '6f17041a-ba1e-4f2d-93f8-47daa9b20f4d',
                        SourceName: 'Select Referral Source',
                        DataTag: 'AAAAAAALzow=',
                        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
                        DateModified: '2018-11-09T12:56:20.1863473'
                    }
                ]
            };
            component.referralSourcesServiceGetSuccess(resultObject);
            expect(component.referralSources[0].SourceName).toEqual('Select Referral Source');
        });
    });

    describe('buildReferralSourcesFilterString ->', () => {
        beforeEach(() => {
            component.inputReferralFilterModel = {
                ActualFilterString: 'All',
                FilterString: 'No filters applied',
                Name: 'Referral Sources',
                ReferralPatientIdName: 'ReferringPatientIds',
                ReferralSourceIdName: 'ReferralSourceIds',
                ReferringPatientIdFilterDto: [],
                ReferringSourceIdFilterDto: [],
                selectedAll: false,
                selectedPatients: [],
                selectedReferralSources: [],
                selectedReferralType: '2',
                totalSelected: 0
            };
        });

        it('buildReferralSourcesFilterString should be called with selectedAll true', () => {
            component.inputReferralFilterModel.selectedAll = true;
            var result = component.buildReferralSourcesFilterString();
            expect(result).toEqual('All');
        });

        it('buildReferralSourcesFilterString should be called with selectedAll false', () => {
            component.inputReferralFilterModel.selectedPatients = [
                {
                    DisplayName: 'Acevedo, Jaden - ACEJA1',
                    PatientId: 'cbf66064-d4d0-4fd3-b8b2-fcceb2a95b7d'
                },
                {
                    DisplayName: 'Adams, Jaxton - ADAJA1',
                    PatientId: '43eb63f6-97b9-4b5c-9880-8ba1c65de728'
                }
            ];
            var result = component.buildReferralSourcesFilterString();
            expect(result).toEqual('Acevedo, Jaden - ACEJA1, Adams, Jaxton - ADAJA1');
        });

        it('buildReferralSourcesFilterString should be called with selectedAll false and empty selected patients', () => {
            var result = component.buildReferralSourcesFilterString();
            expect(result).toEqual('No filters applied');
        });
    });

    describe('SelectPatient ->', () => {
        it('SelectPatient should be called', () => {
            var patient = {
                DateOfBirth: '1980-11-16T00:00:00',
                FirstName: 'Jaden',
                IsActive: true,
                IsPatient: true,
                LastName: 'Acevedo',
                MiddleName: null,
                PatientCode: 'ACEJA1',
                PatientId: 'cbf66064-d4d0-4fd3-b8b2-fcceb2a95b7d',
                PreferredName: null,
                Suffix: null
            };
            component.SelectPatient(patient);
            expect(component.patientSearchParams.searchFor).toEqual(
                'Acevedo, Jaden - ACEJA1'
            );
            expect(component.globalSearchFactory.SaveMostRecentPerson).toHaveBeenCalledWith(
                patient.PatientId
            );
        });
    });

    describe('notifyChange ->', () => {
        it('notifyChange should be called', () => {
            component.onChanged.emit = jasmine.createSpy();
            component.selectedAll = false;
            component.inputReferralFilterModel = mockFilterModel;
            component.selectedPatients = [
                {
                    DateOfBirth: '1980-11-16T00:00:00',
                    FirstName: 'Jaden',
                    IsActive: true,
                    IsPatient: true,
                    LastName: 'Acevedo',
                    MiddleName: null,
                    PatientCode: 'ACEJA1',
                    PatientId: 'cbf66064-d4d0-4fd3-b8b2-fcceb2a95b7d',
                    PreferredName: null,
                    Suffix: null
                }
            ];
            component.notifyChange();
            expect(component.inputReferralFilterModel.totalSelected).toBe(1);
            expect(component.inputReferralFilterModel.selectedAll).toBe(false);
            expect(
                component.inputReferralFilterModel.selectedPatients[0].PatientId
            ).toEqual('cbf66064-d4d0-4fd3-b8b2-fcceb2a95b7d');
            expect(component.inputReferralFilterModel.FilterString).toEqual(
                'Acevedo, Jaden - ACEJA1'
            );
        });
    });

    describe('removeSelectedPatient ->', () => {
        it('removeSelectedPatient should be called', () => {
            component.selectedPatients = [
                {
                    DateOfBirth: '1980-11-16T00:00:00',
                    FirstName: 'Jaden',
                    IsActive: true,
                    IsPatient: true,
                    LastName: 'Acevedo',
                    MiddleName: null,
                    PatientCode: 'ACEJA1',
                    PatientId: 'cbf66064-d4d0-4fd3-b8b2-fcceb2a95123',
                    PreferredName: null,
                    Suffix: null
                },
                {
                    DateOfBirth: '1980-11-16T00:00:00',
                    FirstName: 'Jagan',
                    IsActive: true,
                    IsPatient: true,
                    LastName: 'Dornala',
                    MiddleName: null,
                    PatientCode: 'JD1996',
                    PatientId: 'cbf66064-d4d0-4fd3-b8b2-fcceb2a95456',
                    PreferredName: null,
                    Suffix: null
                }
            ];
            component.removeSelectedPatient(1, component.selectedPatients[1]);
            expect(component.selectedPatients[0].FirstName).toEqual('Jaden');
        });
    });

    describe('removeSelectedReferenceSource ->', () => {
        it('removeSelectedReferenceSource should be called', () => {
            component.selectedReferralSources = [
                {
                    DataTag: 'AAAAAAALzow=',
                    DateModified: '2018-11-09T12:56:20.1863473',
                    PatientReferralSourceId: '6f17041a-ba1e-4f2d-93f8-47daa9b20f4d',
                    SourceName: 'Test_UnUsed_12',
                    UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                },
                {
                    DataTag: 'AAAAAAALzoQ=',
                    DateModified: '2018-11-09T12:43:48.6663391',
                    PatientReferralSourceId: 'dd3e842d-0aef-4b3f-841b-74ab52c55cf1',
                    SourceName: 'Test_Used_1234',
                    UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
                }
            ];
            component.removeSelectedReferenceSource(1, component.selectedReferralSources[1]);
            expect(component.selectedReferralSources[0].SourceName).toEqual(
                'Test_UnUsed_12'
            );
        });
    });

    describe('ReferralTypeChanged ->', () => {
        beforeEach(() => {
        });

        it('ReferralTypeChanged should be called with type empty', () => {
            var type = '';
            component.patientReferralTypes = mockPatientReferralTypes;
            component.ReferralTypeChanged(type);
            expect(component.selectedAll).toBe(true);
            expect(component.patientSearchParams.searchFor).toBe('');
            expect(component.selectedPatients).toEqual([]);
            expect(component.selectedReferralSources).toEqual([]);
        });

        it('ReferralTypeChanged should be called with type 2', () => {
            var type = 2;
            component.patientReferralTypes = mockPatientReferralTypes;
            component.ReferralTypeChanged(type);
            expect(component.selectedAll).toBe(false);
            expect(component.patientSearchParams.searchFor).toBe('');
            expect(component.selectedPatients).toEqual([]);
            expect(component.selectedReferralSources).toEqual([]);
        });

        it('ReferralTypeChanged should be called with type 1', () => {
            var type = 1;
            component.patientReferralTypes = mockPatientReferralTypes;
            component.ReferralTypeChanged(type);
            expect(component.selectedAll).toBe(false);
            expect(component.patientSearchParams.searchFor).toBe('');
            expect(component.selectedPatients).toEqual([]);
            expect(component.selectedReferralSources).toEqual([]);
        });
    });

});
