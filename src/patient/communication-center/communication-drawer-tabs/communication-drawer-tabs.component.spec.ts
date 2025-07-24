import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommunicationDrawerTabsComponent } from './communication-drawer-tabs.component';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { CommunicationCenterAddrecordComponent } from '../communication-center-addrecord/communication-center-addrecord.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppRadioButtonComponent } from 'src/@shared/components/form-controls/radio-button/radio-button.component';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { of } from 'rxjs';
import { CommunicationToDoComponent } from '../communication-to-do/communication-to-do.component';
import { AppDatePickerComponent } from 'src/@shared/components/form-controls/date-picker/date-picker.component';
import {
    CommunicationTodoCollapsibleSectionComponent
} from '../communication-todo-collapsible-section/communication-todo-collapsible-section.component';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { AppButtonComponent } from 'src/@shared/components/form-controls/button/button.component';
import { AppCheckBoxComponent } from 'src/@shared/components/form-controls/check-box/check-box.component';
import { CommunicationGenerateLetterComponent } from '../communication-generate-letter/communication-generate-letter.component';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { DialogContainerService, DialogRef } from '@progress/kendo-angular-dialog';
import { CommunicationConstants } from '../communication-constants/communication.costants';
import { CommunicationReason, CommunicationCategory } from 'src/patient/common/models/enums';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TruncateTextPipe } from 'src/@shared/pipes/truncate/truncate-text.pipe';
import { AgePipe } from 'src/@shared/pipes/age/age.pipe';
import { CommunicationPatientDrawerComponent } from '../communication-patient-drawer/communication-patient-drawer.component';
import { AlertsFlagsComponent } from '../communication-patient-drawer/alerts-flags/alerts-flags.component';
import { PatientContactComponent } from '../communication-patient-drawer/patient-contact/patient-contact.component';
import { GeneralInfoComponent } from '../communication-patient-drawer/general-info/general-info.component';
import { ProvidersLocationsComponent } from '../communication-patient-drawer/providers-locations/providers-locations.component';
import { PhoneNumberPipe } from 'src/@shared/pipes/phone-number/phone-number.pipe';
import { AccountMembersComponent } from '../communication-patient-drawer/account-members/account-members.component';
import { PatientFinancialComponent } from '../communication-patient-drawer/patient-financial/patient-financial.component';
import { AdditionalInfoComponent } from '../communication-patient-drawer/additional-info/additional-info.component';
import { CommunicationAppointmentsComponent } from 'src/scheduling/appointments/communication-appointments/communication-appointments.component';
import { DrawerAppointmentCardsComponent } from 'src/scheduling/appointments/communication-appointments/drawer-appointment-cards/drawer-appointment-cards.component';
import { PatientDetailService } from 'src/patient/patient-detail/services/patient-detail.service';
import { AppointmentStatusHoverComponent } from 'src/scheduling/appointment-statuses/appointment-status-hover/appointment-status-hover.component';
import { PatientInsuranceComponent } from '../communication-patient-drawer/patient-insurance/patient-insurance.component';
import { configureTestSuite } from 'src/configure-test-suite';
import {AppLabelComponent} from '../../../@shared/components/form-controls/form-label/form-label.component';

describe('CommunicationDrawerTabsComponent', () => {
    let component: CommunicationDrawerTabsComponent;
    let fixture: ComponentFixture<CommunicationDrawerTabsComponent>;

    const mockPatientCommunicationCenterService: any = {
        setCommunicationEvent: (a: any) => of({}),
        getCommunicationEvent: () => of({})
    };
    const mockDialogRef = {
        close: () => of({}),
        open: (dialogResult: any) => { },
        content: {
            instance: {
                title: ''
            }
        }
    }
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
        CommunicationReasons: [
            { text: 'Account Note', value: CommunicationReason.AccountNote, category: CommunicationCategory.Account },
            { text: 'Other Insurance', value: CommunicationReason.OtherInsurance, category: CommunicationCategory.Insurance },
            { text: 'General Note', value: CommunicationReason.GeneralNote, category: CommunicationCategory.MiscCommunication },
            { text: 'Appointments', value: CommunicationReason.Appointments, category: CommunicationCategory.PatientCare },
            { text: 'Preventive Care', value: CommunicationReason.PreventiveCare, category: CommunicationCategory.PatientCare },
            { text: 'Treatment Plan', value: CommunicationReason.TreatmentPlan, category: CommunicationCategory.PatientCare }
        ]
    };
    const mockStaticData = {
        AlertIcons: () => { }
    };
    const mockPatientDetailService: any = {
        getPatientDashboardOverviewByPatientId: (a: any) => new Promise((resolve, reject) => { }),
        setPatientPreferredDentist: (a: any) => of({}),
        setPatientPreferredHygienist: (a: any) => of({}),
        getNextAppointmentStartTimeLocalized: (a: any) => { }
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [CommunicationDrawerTabsComponent, CommunicationCenterAddrecordComponent,
                AppRadioButtonComponent, CommunicationToDoComponent, AppDatePickerComponent, CommunicationTodoCollapsibleSectionComponent,
                EnumAsStringPipe, AppButtonComponent, AppCheckBoxComponent, CommunicationGenerateLetterComponent,
                TruncateTextPipe, AgePipe, CommunicationPatientDrawerComponent, AlertsFlagsComponent, PatientContactComponent,
                GeneralInfoComponent, ProvidersLocationsComponent, PhoneNumberPipe, AccountMembersComponent, PatientFinancialComponent,
                AdditionalInfoComponent, CommunicationAppointmentsComponent, DrawerAppointmentCardsComponent, AppointmentStatusHoverComponent
                , PatientInsuranceComponent, AppLabelComponent],
            imports: [FormsModule, ReactiveFormsModule, AppKendoUIModule, TranslateModule.forRoot(), BrowserAnimationsModule],
            providers: [DialogContainerService,
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                { provide: DialogRef, useValue: mockDialogRef },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
                { provide: CommunicationConstants, useValue: mockCommunicationConstants },
                { provide: 'StaticData', useValue: mockStaticData },
                { provide: PatientDetailService, useValue: mockPatientDetailService }
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationDrawerTabsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
