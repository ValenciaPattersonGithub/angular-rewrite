import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppRadioButtonComponent } from 'src/@shared/components/form-controls/radio-button/radio-button.component';
import { PersonalDetailsComponent } from './personal-details.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { SvgIconComponent } from 'src/@shared/components/svg-icons/svg-icon.component';
import { configureTestSuite } from 'src/configure-test-suite';
import { AppCheckBoxComponent } from 'src/@shared/components/form-controls/check-box/check-box.component';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { ResponsiblePartySearchComponent } from 'src/@shared/components/responsible-party-search/responsible-party-search.component';
import { AppDatePickerComponent } from 'src/@shared/components/form-controls/date-picker/date-picker.component';
import { HighlightTextIfContainsPipe } from 'src/@shared/pipes';
import { PatientDuplicateSearchComponent } from '../../patient-duplicate-search/patient-duplicate-search.component';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { AgePipe } from 'src/@shared/pipes/age/age.pipe';

describe('PersonalDetailsComponent', () => {
    let component: PersonalDetailsComponent;
    let fixture: ComponentFixture<PersonalDetailsComponent>;
    let patSecurityService: any;
    const mockpatSecurityService = {
        IsAuthorizedByAbbreviation: (authtype: string) => { }
    };
    const mockservice = {
        getRegistrationEvent: (a: any) => of({}),
        setRegistrationEvent: (a: any) => of({}),
        transform: (a: any) => { },
        ConfirmModal: (a: any, b: any, c: any, d: any) => { },
        patientId: '4321'
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            // TranslateModule import required for components that use ngx-translate in the view or componenet code
            imports: [FormsModule, ReactiveFormsModule, TranslateModule.forRoot(), AppKendoUIModule],
            declarations: [PersonalDetailsComponent, AppRadioButtonComponent, SvgIconComponent, AppCheckBoxComponent,
                AppLabelComponent, ResponsiblePartySearchComponent, AppDatePickerComponent,
                HighlightTextIfContainsPipe, PatientDuplicateSearchComponent],
            providers: [
                { provide: PatientRegistrationService, useValue: mockservice },
                { provide: DatePipe, useValue: mockservice },
                { provide: 'ModalFactory', useValue: mockservice },
                { provide: AgePipe, useValue: mockservice },
                { provide: '$routeParams', useValue: mockservice },
                { provide: 'PatientAppointmentsFactory', useValue: mockservice },
                { provide: 'PersonServices', useValue: mockservice },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: 'toastrFactory', useValue: mockservice }

            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PersonalDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        patSecurityService = TestBed.get('patSecurityService');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    // describe('authAccess', () => {
    //     it('should call authAccess and set value true to activeInactiveStatusRadio', () => {
    //         spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(true);
    //         component.authAccess();
    //         expect(component.activeInactiveStatusRadio).toEqual(true);
    //         expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.inactiveRadioAuthAbbreviation);
    //         expect(component.inactiveRadioAuthAbbreviation).toEqual("soar-per-perdem-inactv");
    //     });
    //     it('should call authAccess and set value false to activeInactiveStatusRadio',()=>{
    //         spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(false);
    //         component.authAccess();
    //         expect(component.activeInactiveStatusRadio).toEqual(false);
    //         expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.inactiveRadioAuthAbbreviation);
    //         expect(component.inactiveRadioAuthAbbreviation).toEqual("soar-per-perdem-inactv");
            
    //     });
    // });
});
