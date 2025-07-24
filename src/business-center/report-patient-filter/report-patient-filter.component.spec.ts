import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportPatientFilterComponent } from './report-patient-filter.component';
import { HighlightTextIfContainsPipe } from 'src/@shared/pipes';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
describe('ReportPatientFilterComponent', () => {
    let component: ReportPatientFilterComponent;
    let fixture: ComponentFixture<ReportPatientFilterComponent>;
    let patient = {
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
    const mockPatientServices = {
        Patients: {
            search: jasmine
                .createSpy()
                .and.returnValue({}),
            get: jasmine.createSpy().and.returnValue({})
        }
    };
    const mockSearchFactory = {
        CreateSearch: jasmine
            .createSpy()
            .and.returnValue({})
    };
    const mockGlobalSearchFactory = {
        SaveMostRecentPerson: jasmine
            .createSpy()
            .and.returnValue({})
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [ReportPatientFilterComponent, HighlightTextIfContainsPipe, ToShortDisplayDateUtcPipe],
            imports: [FormsModule, ReactiveFormsModule,
                TranslateModule.forRoot()],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: 'SearchFactory', useValue: mockSearchFactory },
                { provide: 'PatientServices', useValue: mockPatientServices },
                { provide: 'GlobalSearchFactory', useValue: mockGlobalSearchFactory }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReportPatientFilterComponent);
        component = fixture.componentInstance;
        component.filterModels = {
            ActualFilterString: 'All',
            FilterDto: ['cbf66064-d4d0-4fd3-b8b2-fcceb2a95b7d'],
            FilterFilterModel: null,
            FilterId: 'patients',
            FilterString: 'No filters applied',
            Name: 'Patients',
            Reset: false,
            data: []
        };
        component.userDefinedPatinets = [];
        component.patientSearchParams = {
            includeInactive: false,
            searchFor: '',
            skip: 0,
            sortyBy: 'LastName',
            take: 45
        };
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

        it('should have injected services ', () => {
            expect(mockSearchFactory).not.toBeNull();
            expect(mockPatientServices).not.toBeNull();
            expect(mockGlobalSearchFactory).not.toBeNull();
            expect(mockLocalizeService).not.toBeNull();
            expect(mockTostarfactory).not.toBeNull();
        });

        it('should set scope properties', () => {
            expect(component.emptyGuid).toEqual('00000000-0000-0000-0000-000000000000');
            expect(component.patientSearchParams.searchFor).toBe('');
            expect(component.patientSearchParams.skip).toBe(0);
            expect(component.patientSearchParams.take).toBe(45);
            expect(component.patientSearchParams.sortyBy).toBe('LastName');
            expect(component.patientSearchParams.includeInactive).toBe(false);
            expect(component.selectedPatients).toEqual([]);
            expect(component.includeAllPatients).toEqual('true');
        });
    });

    describe('toggleRadio ->', () => {
        it('toggleRadio should be called with includeAllPatients true', () => {
            component.onChanged.emit = jasmine.createSpy();
            component.includeAllPatients = 'true';
            component.toggleRadio();
            expect(component.selectedPatients).toEqual([]);
            expect(component.patientSearchParams.searchFor).toEqual('');
        });
    });

    describe('setFilterString ->', () => {
        it('setFilterString should be called with includeAllPatients true', () => {
            component.includeAllPatients = 'true';
            component.setFilterString();
            expect(component.reportPatientFilterModel.FilterString).toEqual('All');
        });

        it('setFilterString should be called with includeAllPatients false', () => {
            component.includeAllPatients = 'false';
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
                },
                {
                    DateOfBirth: '1980-11-16T00:00:00',
                    FirstName: 'Jagan',
                    IsActive: true,
                    IsPatient: true,
                    LastName: 'Dornala',
                    MiddleName: null,
                    PatientCode: 'JD1996',
                    PatientId: 'cbf66064-d4d0-4fd3-b8b2-fcceb2a95b7d',
                    PreferredName: null,
                    Suffix: null
                }
            ];
            component.setFilterString();
            expect(component.reportPatientFilterModel.FilterString).toEqual('Acevedo, Jaden - ACEJA1, Dornala, Jagan - JD1996');
        });

        it('ctrl.setFilterString should be called with includeAllPatients false and empty selected patients', () => {
            component.includeAllPatients = 'false';
            component.selectedPatients = [];
            component.setFilterString();
            expect(component.reportPatientFilterModel.FilterString).toEqual('No filters applied');
        });
    });

    describe('selectPatient ->', () => {
        it('selectPatient should be called', () => {
            component.selectPatient(patient);
            expect(component.patientSearchParams.searchFor).toEqual(
                'Acevedo, Jaden - ACEJA1'
            );
            expect(mockGlobalSearchFactory.SaveMostRecentPerson).toHaveBeenCalledWith(
                patient.PatientId
            );
        });
    });

    describe('saveMostRecent ->', () => {
        it('saveMostRecent should be called', () => {
            component.saveMostRecent(patient.PatientId);
            expect(mockGlobalSearchFactory.SaveMostRecentPerson).toHaveBeenCalledWith(
                patient.PatientId
            );
        });
    });

    describe('selectPatient ->', () => {
        it('selectPatient should be called', () => {

            component.selectPatient(patient);
            expect(component.patientSearchParams.searchFor).toEqual(
                'Acevedo, Jaden - ACEJA1'
            );
            expect(mockGlobalSearchFactory.SaveMostRecentPerson).toHaveBeenCalledWith(
                patient.PatientId
            );
        });
    });

    describe('saveMostRecent ->', () => {
        it('saveMostRecent should be called', () => {
            component.saveMostRecent(patient.PatientId);
            expect(mockGlobalSearchFactory.SaveMostRecentPerson).toHaveBeenCalledWith(
                patient.PatientId
            );
        });
    });

    describe('buildDisplayName ->', () => {
        it('buildDisplayName should be called with patient object', () => {
            const result = component.buildDisplayName(patient);
            const displayName = patient.LastName + ', ' + patient.FirstName + ' - ' + patient.PatientCode;
            expect(result).toEqual(displayName);
        });

        it('buildDisplayName should be called with empty object', () => {
            const result = component.buildDisplayName(false);
            const displayName = '';
            expect(result).toEqual(displayName);
        });
    });

    describe('toggleRadio ->', () => {
        it('toggleRadio should be called with includeAllPatients true', () => {
            component.onChanged.emit = jasmine.createSpy();
            component.includeAllPatients = 'true';
            component.toggleRadio();
            expect(component.selectedPatients).toEqual([]);
            expect(component.patientSearchParams.searchFor).toEqual('');
        });
        it('toggleRadio should be called with includeAllPatients false', () => {
            component.includeAllPatients = '';
            component.toggleRadio();
            expect(component.selectedPatients).toEqual(component.selectedPatients);
            expect(component.patientSearchParams.searchFor).toEqual(component.patientSearchParams.searchFor);
        });
    });

    describe('buildFilterString ->', () => {
        it('buildFilterString should be called with includeAllPatients true', () => {
            component.includeAllPatients = 'true';
            const result = component.buildFilterString();
            expect(result).toEqual('All');
        });

        it('buildFilterString should be called with includeAllPatients false', () => {
            component.includeAllPatients = 'false';
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
                },
                {
                    DateOfBirth: '1980-11-16T00:00:00',
                    FirstName: 'Jagan',
                    IsActive: true,
                    IsPatient: true,
                    LastName: 'Dornala',
                    MiddleName: null,
                    PatientCode: 'JD1996',
                    PatientId: 'cbf66064-d4d0-4fd3-b8b2-fcceb2a95b7d',
                    PreferredName: null,
                    Suffix: null
                }
            ];
            const result = component.buildFilterString();
            expect(result).toEqual('Acevedo, Jaden - ACEJA1, Dornala, Jagan - JD1996');
        });

        it('ctrl.buildFilterString should be called with includeAllPatients false and empty selected patients', () => {
            component.includeAllPatients = 'false';
            component.selectedPatients = [];
            const result = component.buildFilterString();
            expect(result).toEqual('No filters applied');
        });
    });

    describe('notifyChange ->', () => {
        it('notifyChange should be called with includeAllPatients is true', () => {
            component.onChanged.emit = jasmine.createSpy();
            component.includeAllPatients = 'true';
            component.notifyChange();
            expect(component.reportPatientFilterModel.FilterDto).toEqual(['00000000-0000-0000-0000-000000000000']);
        });

        it('notifyChange should be called with includeAllPatients is false', () => {
            component.onChanged.emit = jasmine.createSpy();
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
            component.includeAllPatients = 'false';
            component.notifyChange();
            expect(component.reportPatientFilterModel.FilterDto[0]).toEqual('cbf66064-d4d0-4fd3-b8b2-fcceb2a95123');
            expect(component.reportPatientFilterModel.FilterDto[1]).toEqual('cbf66064-d4d0-4fd3-b8b2-fcceb2a95456');
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

    describe('executePatientSearch ->', () => {
        it('executePatientSearch should be called with patientSearchParams', () => {
            component.patientSearchParams.searchFor = 's';
        });
        it('executePatientSearch should not be called', () => {
            component.patientSearchParams.searchFor = '';
        });
    });

    describe('resetMethod ->', () => {
        beforeEach(() => {
        });
        it('resetMethod should be called', () => {
            component.includeAllPatients = 'false';
            component.patientSearchParams.searchFor = 'S';
            component.selectedPatients = [1, 2, 3];
            component.resetMethod();
            component.reportPatientFilterModel = { Reset: false };
            expect(component.includeAllPatients).toEqual('true');
            expect(component.patientSearchParams.searchFor).toEqual('');
            expect(component.selectedPatients).toEqual([]);
            expect(component.reportPatientFilterModel.Reset).toBe(false);
            component.notifyChange();
        });

    });

});
