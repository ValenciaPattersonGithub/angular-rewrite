import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { CommunicationTodoCollapsibleSectionComponent } from './communication-todo-collapsible-section.component';
import { TranslateModule } from '@ngx-translate/core';
import { of, BehaviorSubject } from 'rxjs';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    CommunicationReason, CommunicationCategory
} from '../../common/models/enums';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { CommunicationConstants } from '../communication-constants/communication.costants';
import { DatePipe } from '@angular/common';
import { AppCheckBoxComponent } from 'src/@shared/components/form-controls/check-box/check-box.component';
import { PatientCommunication } from 'src/patient/common/models/patient-communication.model';
import { configureTestSuite } from 'src/configure-test-suite';

describe('CommunicationTodoCollapsibleSectionComponent', () => {
    let component: CommunicationTodoCollapsibleSectionComponent;
    let fixture: ComponentFixture<CommunicationTodoCollapsibleSectionComponent>;
    let patientCommunicationService: any;
    let patSecurityService: any;
    let toastrFactory: any;
    const updatePatientCommSubjectMock = new BehaviorSubject<{}>(undefined);

    const mockPatientCommunicationCenterService: any = {
        getPatientCommunicationByPatientId: (a: any) => of([{}]),
        updatePreview: (a: any) => { },
        applyFilters: (a: any) => { },
        editCommunication: (a: any) => of([{}]),
        deletePatientCommunicationById: (a: any) => of({}),
        setCommunicationEvent: (a: any) => of({}),
        getCommunicationEvent: () => of({}),
        getPatientCommunicationToDoByPatientId: (a: any) => of([{}]),
        createToDoCommunication: (a: any, b: any) => of({}),
        getUserdetail: (a: any, b: any) => of([{}]),
        GetPatientCommunicationTemplates: () => of({}),
        patientDetail: of({}),
        createAccountNoteCommunication: (a: any, b: any) => of({}),
        updatePatientCommunication: (a: any, b: any) => of({}),
        updatePatientCommunications$: updatePatientCommSubjectMock
    };
    const mockRouteParams = {
        patientId: '4321',
        accountId: '1234',
    };
    const mockTostarfactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
    };
    const mockConfirmationModalService = {
        open: jasmine.createSpy().and.returnValue({
            events: {
                pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
            },
            subscribe: jasmine.createSpy(),
            closed: jasmine.createSpy(),
        }),
    };
    const mockCommunicationConstants = {
        deleteToDoConfirmationModalData: {
            header: 'Communication Center',
            message: 'Are you sure you want to delete this communication?',
            confirm: 'Yes',
            cancel: 'No'
        }
    };
    const mockpatSecurityService = {
        IsAuthorizedByAbbreviation: (authtype: string) => { }
    };
    const mockDatePipe: any = {
        transform: (a: any) => { }
    };
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), AppKendoUIModule, FormsModule, ReactiveFormsModule, BrowserAnimationsModule],
            providers: [
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: CommunicationConstants, useValue: mockCommunicationConstants },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
                { provide: DatePipe, useValue: mockDatePipe }
            ],
            declarations: [CommunicationTodoCollapsibleSectionComponent, EnumAsStringPipe, AppCheckBoxComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationTodoCollapsibleSectionComponent);
        component = fixture.componentInstance;
        patientCommunicationService = TestBed.get(PatientCommunicationCenterService);
        patSecurityService = TestBed.get('patSecurityService');
        toastrFactory = TestBed.get('toastrFactory');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('getInCompleteToDoCommunications', () => {
        it('should call getInCompleteToDoCommunications and set toDoCommunications if IsComplete is false', () => {
            const communications = [
                { Notes: 'Test 1', Reason: CommunicationReason.GeneralNote, CommunicationCategory: CommunicationCategory.ToDo, IsComplete: false },
                { Notes: 'Test 2', Reason: CommunicationReason.GeneralNote, CommunicationCategory: CommunicationCategory.ToDo, IsComplete: false }
            ];
            component.getInCompleteToDoCommunications(communications);
            expect(component.toDoCommunications.length).toEqual(2);
        });
    });
    describe('getCompletedToDoCommunications', () => {
        it('should call getCompletedToDoCommunications and set completedToDoCommunications if IsComplete is true', () => {
            const communications = [
                { Notes: 'Test 1', Reason: CommunicationReason.GeneralNote, CommunicationCategory: CommunicationCategory.ToDo, IsComplete: true },
                { Notes: 'Test 2', Reason: CommunicationReason.GeneralNote, CommunicationCategory: CommunicationCategory.ToDo, IsComplete: true }
            ];
            component.getCompletedToDoCommunications(communications);
            expect(component.completedToDoCommunications.length).toEqual(2);
        });
    });
    describe('deleteToDoCommunication', () => {
        it('should call patientCommunicationCenterService.deletePatientCommunicationById when deleteToDoCommunication called', () => {
            const communication: PatientCommunication = {
                CommunicationCategory: 0,
                CommunicationType: 0,
                CommunicationDate: new Date(),
                Notes: '',
                PatientCommunicationId: 20,
                PatientId: '',
                Reason: 0,
                Status: 0,
                AddedBy: '',
                UserModified: '',
                AccountId: '',
                PersonId: '',
                LocationId: 0,
                Description: '',
                Index: 0,
                EditedBy: '',
                DateModified: new Date(),
                CreatedBy: '',
                PersonAccountNoteId: 0,
                IsComplete: false,
                DueDate: new Date(),
                IsDisabled: false,
                IsModified: false,
                CommunicationMode: 0
            };
            component.hasDeleteAccess = true;
            component.deleteToDoCommunication(communication);
            expect(mockConfirmationModalService.open).toHaveBeenCalled();
        });
        it('should call deleteToDoCommunicationSuccess when patientCommunicationService.deletePatientCommunicationById return success', () => {
            const patientCommunicationId = 20;
            const personAccountNoteId = 0;
            spyOn(patientCommunicationService, 'deletePatientCommunicationById').and.returnValue(Promise.resolve({ result: 'success' }));
            patientCommunicationService.deletePatientCommunicationById(patientCommunicationId, personAccountNoteId)
                .then(() => {
                    component.deleteToDoCommunicationSuccess();
                    expect(toastrFactory.success).toHaveBeenCalled();
                }, () => {
                });
            expect(patientCommunicationService.patientCommunicationId);
        });
        it('should call deleteToDoCommunicationFailure when patientCommunicationService.deletePatientCommunicationById return failed', () => {
            const patientCommunicationId = 20;
            const personAccountNoteId = 0;
            spyOn(patientCommunicationService, 'deletePatientCommunicationById').and.returnValue(Promise.resolve({ result: 'failed' }));
            patientCommunicationService.deletePatientCommunicationById(patientCommunicationId, personAccountNoteId)
                .then(() => {
                }, () => {
                    component.deleteToDoCommunicationFailure();
                    expect(component.deleteToDoCommunicationFailure).toHaveBeenCalled();
                });
        });
    });
    describe('authAccess', () => {
        it('should call authAccess and set value true to hasDeleteAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').
                and.returnValue(true);
            component.authAccess();
            expect(component.hasDeleteAccess).toEqual(true);
        });
        it('should call authAccess and set value false to hasDeleteAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').
                and.returnValue(false);
            component.authAccess();
            expect(component.hasDeleteAccess).toEqual(false);
        });
    });
    describe('openConfirmationModal', () => {
        it('should call deleteToDoCommunicationSuccess when patientCommunicationService.deletePatientCommunicationById return success', () => {
            const patientCommunicationId = 19;
            spyOn(mockPatientCommunicationCenterService, 'deletePatientCommunicationById')
                .and.returnValue(Promise.resolve({ result: 'success' }));
            component.openConfirmationModal(mockCommunicationConstants.deleteToDoConfirmationModalData, patientCommunicationId);
            patientCommunicationService.deletePatientCommunicationById(patientCommunicationId)
                .then(() => component.deleteToDoCommunicationSuccess(),
                    () => {
                    });
            expect(patientCommunicationService.patientCommunicationId);
        });
        it('should call deleteCommunicationSuccess when patientCommunicationService.deletePatientCommunicationById return success', () => {
            const patientCommunicationId = 20;
            spyOn(mockPatientCommunicationCenterService, 'deletePatientCommunicationById')
                .and.returnValue(Promise.resolve({ result: 'failure' }));
            component.openConfirmationModal(mockCommunicationConstants.deleteToDoConfirmationModalData, patientCommunicationId);
            patientCommunicationService.deletePatientCommunicationById(patientCommunicationId)
                .then(() => component.deleteToDoCommunicationFailure(),
                    () => {
                    });
            expect(patientCommunicationService.patientCommunicationId);
        });
    });
});
