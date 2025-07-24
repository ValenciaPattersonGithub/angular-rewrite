import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommunicationToDoComponent } from './communication-to-do.component';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { TranslateModule } from '@ngx-translate/core';
import { of, BehaviorSubject, throwError } from 'rxjs';
import { AppDatePickerComponent } from 'src/@shared/components/form-controls/date-picker/date-picker.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    CommunicationTodoCollapsibleSectionComponent
} from '../communication-todo-collapsible-section/communication-todo-collapsible-section.component';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { DatePipe } from '@angular/common';
import { CommunicationConstants } from '../communication-constants/communication.costants';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { AppButtonComponent } from 'src/@shared/components/form-controls/button/button.component';
import { AppCheckBoxComponent } from 'src/@shared/components/form-controls/check-box/check-box.component';
import { configureTestSuite } from 'src/configure-test-suite';
import {AppLabelComponent} from '../../../@shared/components/form-controls/form-label/form-label.component';

describe('CommunicationToDoComponent', () => {
    let component: CommunicationToDoComponent;
    let fixture: ComponentFixture<CommunicationToDoComponent>;
    let patientCommunicationService: any;
    let patSecurityService: any;
    const fb: FormBuilder = new FormBuilder();

    const mockTostarfactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
    };
    const mockRouteParams = {
        patientId: '4321',
        accountId: '1234',
    };
    const mockDatePipe: any = {
        transform: (a: any) => { }
    };
    const mockPatientCommunicationCenterService: any = {
        getPatientCommunicationByPatientId: (a: any) => of({}),
        createAccountNoteCommunication: (a: any, b: any) => of({}),
        checkFormMode: (a: any) => { },
        updatePatientCommunication: (a: any, b: any) => of({}),
        setCommunicationEvent: (a: any) => of({}),
        getCommunicationEvent: () => of({}),
        createToDoCommunication: (a: any, b: any) => of({}),
        getPatientCommunicationToDoByPatientId: (a: any) => of([{}]),
        updateToDoPatientCommunication: (a: any, b: any) => of({}),
        patientDetail: of({}),
        setCachedTabWithData: () => { },
        resetPatientCommunicationService: () => { }
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
    const mockConfirmationModalService = {
        open: jasmine.createSpy().and.returnValue({
            events: {
                pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
            },
            subscribe: jasmine.createSpy(),
            closed: jasmine.createSpy(),
        }),
    };
    const mockEditCommunication = {
        PatientCommunicationId: '4321',
        CommunicationType: 1,
        CommunicationCategory: 2,
        Reason: '3',
        Status: '0',
        Notes: 'Update',
        PatientId: '4321',
        DataTag: '0x000000000002DDF4',
        PersonAccountNoteId: '111',
        CommunicationDate: new Date()
    };
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            // TranslateModule import required for components that use ngx-translate in the view or componenet code
            imports: [TranslateModule.forRoot(), AppKendoUIModule, FormsModule, ReactiveFormsModule, BrowserAnimationsModule],
            providers: [
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                { provide: DatePipe, useValue: mockDatePipe },
                { provide: CommunicationConstants, useValue: mockCommunicationConstants },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService }
            ],
            declarations: [CommunicationToDoComponent, AppDatePickerComponent, CommunicationTodoCollapsibleSectionComponent,
                EnumAsStringPipe, AppButtonComponent, AppCheckBoxComponent, AppLabelComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationToDoComponent);
        patientCommunicationService = TestBed.get(PatientCommunicationCenterService);
        patSecurityService = TestBed.get('patSecurityService');
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('createFormControls', () => {
        it('should create FormControls', () => {
            component.createFormControls();
            const communicationType = component.toDoCommunicationCenter.controls.CommunicationType;
            expect(communicationType).toBeDefined();
            const notes = component.toDoCommunicationCenter.controls.Notes;
            expect(notes).toBeDefined();
            const reason = component.toDoCommunicationCenter.controls.Reason;
            expect(reason).toBeDefined();
            const isComplete = component.toDoCommunicationCenter.controls.IsComplete;
            expect(isComplete).toBeDefined();
            const dueDate = component.toDoCommunicationCenter.controls.DueDate;
            expect(dueDate).toBeDefined();
        });
    });
    describe('resetFormValues', () => {
        it('should reset the form values to default values', () => {
            component.resetFormValues();
            expect(component.toDoCommunicationCenter.value).toBeDefined();
            expect(component.toDoCommunicationCenter.value.Notes).toEqual('');
            expect(component.toDoCommunicationCenter.value.IsComplete).toEqual(false);
        });
    });
    describe('addToDoCommunication', () => {
        it('should call patientCommunicationCenterService.createToDoCommunication when addToDoCommunication called', () => {
            spyOn(patientCommunicationService, 'createToDoCommunication').and.callThrough();
            component.personDetail = {
                AccountId: '98BFA2C2-8DB8-46AC-AA01-2E2144613054'
            };
            component.addToDoCommunication();
            expect(patientCommunicationService.createToDoCommunication);
        });
        it('should call addToDoCommunicationFailure when patientCommunicationCenterService.createToDoCommunication throw Error', () => {
            spyOn(patientCommunicationService, 'createToDoCommunication').and.returnValue(throwError('Error'));
            spyOn(component, 'addToDoCommunicationFailure').and.callThrough();
            component.personDetail = {
                AccountId: '98BFA2C2-8DB8-46AC-AA01-2E2144613054'
            };
            component.toDoCommunicationCenter.value.Notes = 'Test';
            component.addToDoCommunication();
            component.toDoCommunicationCenter.value.Notes = 'Test';
            expect(patientCommunicationService.createToDoCommunication)
                .toHaveBeenCalledWith(mockRouteParams.patientId, component.toDoCommunicationCenter.value, component.personDetail);
            expect(component.addToDoCommunicationFailure).toHaveBeenCalled();
            expect(patientCommunicationService.createToDoCommunication);
        });
    });
    describe('authAccess', () => {
        it('should call authAccess and set value true to hasEditAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').
                and.returnValue(true);
            component.authAccess();
            expect(component.hasEditAccess).toEqual(true);
        });
        it('should call authAccess and set value false to hasEditAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').
                and.returnValue(false);
            component.authAccess();
            expect(component.hasEditAccess).toEqual(false);
        });
    });
    describe('updateInCompleteToDoCommunication', () => {
        it('should call updateCommunicationFailure when patientCommunicationCenterService.updateToDoPatientCommunication throw Error', () => {
            component.hasEditAccess = true;
            component.isEdit = true;
            component.toDoCommunicationCenter = fb.group({
                CommunicationType: mockEditCommunication.CommunicationType,
                CommunicationCategory: mockEditCommunication.CommunicationCategory,
                Reason: mockEditCommunication.Reason,
                Status: mockEditCommunication.Status,
                Notes: mockEditCommunication.Notes,
                PatientId: mockEditCommunication.PatientId,
                PatientCommunicationId: mockEditCommunication.PatientCommunicationId,
                DataTag: mockEditCommunication.DataTag,
                PersonAccountNoteId: mockEditCommunication.PersonAccountNoteId,
                CommunicationDate: mockEditCommunication.CommunicationDate
            });
            spyOn(patientCommunicationService, 'updateToDoPatientCommunication').and.returnValue(throwError('Error'));
            spyOn(component, 'updateCommunicationFailure').and.callThrough();
            component.updateInCompleteToDoCommunication();
            expect(patientCommunicationService.updateToDoPatientCommunication)
                .toHaveBeenCalledWith(mockEditCommunication.PatientCommunicationId, mockEditCommunication);
            expect(component.updateCommunicationFailure).toHaveBeenCalled();
            expect(patientCommunicationService.updateToDoPatientCommunication);
        });
        //   it('should call updateCommunicationSuccess when patientCommunicationCenterService.updateToDoPatientCommunication is a success', () => {
        //     component.hasEditAccess = true;
        //     component.isEdit = true;
        //     component.toDoCommunicationCenter = fb.group({
        //       CommunicationType: mockEditCommunication.CommunicationType,
        //       CommunicationCategory: mockEditCommunication.CommunicationCategory,
        //       Reason: mockEditCommunication.Reason,
        //       Status: mockEditCommunication.Status,
        //       Notes: mockEditCommunication.Notes,
        //       PatientId: mockEditCommunication.PatientId,
        //       PatientCommunicationId: mockEditCommunication.PatientCommunicationId,
        //       DataTag: mockEditCommunication.DataTag,
        //       PersonAccountNoteId: mockEditCommunication.PersonAccountNoteId,
        //       CommunicationDate: mockEditCommunication.CommunicationDate
        //     });
        //     spyOn(patientCommunicationService, 'updateToDoPatientCommunication').and.callThrough();
        //     spyOn(component, 'updateCommunicationSuccess').and.callThrough();
        //     component.updateInCompleteToDoCommunication();
        //     expect(patientCommunicationService.updateToDoPatientCommunication)
        //       .toHaveBeenCalledWith(mockEditCommunication.PatientCommunicationId, mockEditCommunication);
        //     expect(component.updateCommunicationSuccess).toHaveBeenCalled();
        //     expect(patientCommunicationService.updateToDoPatientCommunication);
        //   });
    });
});
