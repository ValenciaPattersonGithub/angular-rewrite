import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { PatientDuplicateSearchComponent } from './patient-duplicate-search.component';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { of } from 'rxjs';

describe('PatientDuplicateSearchComponent', () => {
    let component: PatientDuplicateSearchComponent;
    let fixture: ComponentFixture<PatientDuplicateSearchComponent>;
    const retValue = { $promise: { then: jasmine.createSpy() } };

    const patientSearchListMock = [
        // tslint:disable-next-line: max-line-length
        { PatientId: '1234', FirstName: 'Bob', LastName: 'Johnson', IsSelected: false, City: 'Findlay', State: 'IL', ZipeCode: '62401', IsActive: true, IsPatient: true, DateOfBirth: '2001-11-05', PrimaryDuplicatePatientId: null, IsPrimaryDuplicate: false, IsResponsiblePerson: true, Datatag: '4569' },
        // tslint:disable-next-line: max-line-length
        { PatientId: '1235', FirstName: 'Larry', LastName: 'Johnson', IsSelected: false, City: 'Findlay', State: 'IL', ZipeCode: '62401', IsActive: true, IsPatient: true, DateOfBirth: '2001-11-05', PrimaryDuplicatePatientId: null, IsPrimaryDuplicate: false, IsResponsiblePerson: false, Datatag: '4577' },
        // tslint:disable-next-line: max-line-length
        { PatientId: '1236', FirstName: 'Sid', LastName: 'Johnson', IsSelected: false, City: 'Findlay', State: 'IL', ZipeCode: '62401', IsActive: true, IsPatient: true, DateOfBirth: '2001-11-05', PrimaryDuplicatePatientId: null, IsPrimaryDuplicate: false, IsResponsiblePerson: false, Datatag: '4566' },
        // tslint:disable-next-line: max-line-length
        { PatientId: '1237', FirstName: 'Pat', LastName: 'Johnson', IsSelected: false, City: 'Findlay', State: 'IL', ZipeCode: '62401', IsActive: true, IsPatient: true, DateOfBirth: '2001-11-05', PrimaryDuplicatePatientId: null, IsPrimaryDuplicate: false, IsResponsiblePerson: false, Datatag: '4555' },
    ];
    const mockPatientServices = {
        Account: {
            getAccountMembersWithDuplicates: jasmine.createSpy().and.callFake(() => retValue)
        },
        Patients: {
            duplicates: jasmine.createSpy().and.callFake(() => retValue)
        }
    };
    // mock for patSecurityService
    const patValidationServiceMock = {
        generateMessage: jasmine.createSpy().and.returnValue(''),
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(''),
    };
    const patServicesMock = {
        duplicates: jasmine.createSpy().and.returnValue(''),
    }
    const mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };
    const mockservice = {
        getRegistrationEvent: (a: any) => of({}),
        setRegistrationEvent: (a: any) => of({}),
        tabLauncher: jasmine.createSpy()
    };
    
    configureTestSuite(() => {
        let mockFeatureService = { isEnabled: jasmine.createSpy().and.returnValue({ then: () => { } }) };
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [PatientDuplicateSearchComponent],
            providers: [
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'PatientServices', useValue: mockPatientServices },
                { provide: 'PatientValidationFactory', useValue: patValidationServiceMock },
                { provide: 'tabLauncher', useValue: mockservice },
                { provide: PatientRegistrationService, useValue: mockservice },
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientDuplicateSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        component.patientSearchList = patientSearchListMock;
        expect(component).toBeTruthy();
    });

    describe('ngOnInit function ->', () => {

        beforeEach(() => {
            component.getDuplicatePatients = jasmine.createSpy();
        });

        it('should call functions', () => {
            component.ngOnInit();

            expect(component.getDuplicatePatients).toHaveBeenCalled();
        });

    });

    describe('duplicatePatientSearchGetFailure method', () => {
        it('should empty this.duplicatePatients', () => {
            component.duplicatePatientSearchGetFailure();
            expect(component.duplicatePatients).toEqual([]);
        });
        it('should change showDuplicatePatients to false', () => {
            component.duplicatePatientSearchGetFailure();
            expect(component.showDuplicatePatients).toEqual(false);
        });
    });

    describe('closeDuplicatePatient method', () => {
        it('should change showDuplicatePatients to false', () => {
            component.closeDuplicatePatient();
            expect(component.showDuplicatePatients).toEqual(false);
        });
    });

    describe('duplicateClicked function', () => {

        beforeEach(() => {
            component.duplicateSelected.emit = jasmine.createSpy();
        });

        it('should call duplicateSelected.emit', () => {
            let duplicate = 'dupe';

            component.duplicateClicked(duplicate);

            expect(component.duplicateSelected.emit).toHaveBeenCalledWith(duplicate);
        });

    });

});


