import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { ContactDetailsComponent } from './contact-details.component';
import { configureTestSuite } from 'src/configure-test-suite';
import { of } from 'rxjs';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SvgIconComponent } from 'src/@shared/components/svg-icons/svg-icon.component';
import { AppCheckBoxComponent } from 'src/@shared/components/form-controls/check-box/check-box.component';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { AppRadioButtonComponent } from 'src/@shared/components/form-controls/radio-button/radio-button.component';
import { AppToggleComponent } from 'src/@shared/components/form-controls/toggle/toggle.component';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { AppSelectComponent } from 'src/@shared/components/form-controls/select-list/select-list.component';
import { PhoneNumberPipe } from 'src/@shared/pipes/phone-number/phone-number.pipe';
import { RegistrationCustomEvent } from 'src/patient/common/models/registration-custom-event.model';

describe('ContactDetailsComponent', () => {
    let component: ContactDetailsComponent;
    let fixture: ComponentFixture<ContactDetailsComponent>;
    let patientServices: PatientHttpService;
    let patientRegistrationService: PatientRegistrationService;
    let registrationCustomEvent: RegistrationCustomEvent;
    const mockservice = {
        getRegistrationEvent: (a: any) => of({}),
        setRegistrationEvent: (a: any) => of({}),
        getPatientResponsiblePartyPhonesAndEmails: (a: any) => of({}),
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message'),
        get: jasmine.createSpy().and.returnValue([{}]),
        getAllAccountMembersByAccountId: (a: any) => of({}),
        States: () => new Promise((resolve, reject) => {
            // the resolve / reject functions control the fate of the promise
        }),
        PhoneTypes: () => new Promise((resolve, reject) => {
            // the resolve / reject functions control the fate of the promise
        }),
        transform: (a: any) => { },

        personObject: {
            FirstName: 'Jhon',
            LastName: 'Chris',
            PatientId: '1234'
        },
        registrationCustomEvent: {
            eventtype: 3,
            data: {
                FirstName: 'Jhon',
                LastName: 'Chris',
                PatientId: '1234',
                AccountId: '1234',
                PersonAccount: {
                    FirstName: 'Jhon',
                    LastName: 'Chris',
                    PatientId: '1234',
                    AccountId: '1234'
                }
            }
        },
        person: {
            FirstName: 'Jhon',
            LastName: 'Chris',
            PatientId: '1234'
        },
        res: [
            {
                "PatientLite": {
                    "PatientId": "443f8aeb-ba02-4d72-82e3-5b48d4d03dc6",
                    "FirstName": "child22",
                    "LastName": "child22",
                    "MiddleName": "",
                    "PreferredName": "",
                    "SuffixName": "",
                    "DateOfBirth": "2018-12-12T06:00:00",
                    "IsPatient": true,
                    "PhoneNumber": null,
                    "IsResponsiblePerson": false,
                    "IsActiveAccountMember": true,
                    "RelationshipToPolicyHolder": null,
                    "IsActive": true,
                    "AddressReferrerId": null,
                    "PatientCode": "CHICH7",
                },
                "Contacts": [
                    {
                        "PatientId": "443f8aeb-ba02-4d72-82e3-5b48d4d03dc6",
                        "ContactId": "74f417bb-4faf-49de-b44c-a22848a41dfe",
                        "PhoneNumber": "8888888888",
                        "Type": "Mobile",
                        "TextOk": true,
                        "ReminderOK": true,
                        "Notes": null,
                        "IsPrimary": true,
                        "ObjectState": "None",


                    }
                ],
                "Emails": [
                    {
                        "PatientId": "443f8aeb-ba02-4d72-82e3-5b48d4d03dc6",
                        "PatientEmailId": "9608fc00-d89a-462a-8430-852336b6ed33",
                        "Email": "s4@abc.com",
                        "ReminderOK": true,
                        "IsPrimary": true,
                        "AccountEmailId": null,
                        "AccountEMail": null,
                        "Links": null,
                        "ObjectState": "None",
                    }
                ]
            },
            {
                "PatientLite": {
                    "PatientId": "cd7bcb7a-e0d6-42a9-a050-7f9342975e86",
                    "FirstName": "child11",
                    "LastName": "child11",
                    "MiddleName": "",
                    "PreferredName": "",
                    "SuffixName": "",
                    "DateOfBirth": "2019-12-12T06:00:00",
                    "IsPatient": true,
                    "PhoneNumber": null,
                    "IsResponsiblePerson": false,
                    "IsActiveAccountMember": true,
                    "RelationshipToPolicyHolder": null,
                    "IsActive": true,
                    "AddressReferrerId": null,
                    "PatientCode": "CHICH6",

                },
                "Contacts": [
                    {
                        "PatientId": "cd7bcb7a-e0d6-42a9-a050-7f9342975e86",
                        "ContactId": "0bdd9b12-e149-48e7-a89d-5bc5d56c8729",
                        "PhoneNumber": "4444444444",
                        "Type": "Mobile",
                        "TextOk": true,
                        "ReminderOK": true,
                        "Notes": null,
                        "IsPrimary": true,
                        "ObjectState": "None",


                    },
                    {
                        "PatientId": "cd7bcb7a-e0d6-42a9-a050-7f9342975e86",
                        "ContactId": "2a452001-743f-40db-8f95-756c2cedf012",
                        "PhoneNumber": "5555555555",
                        "Type": "Home",
                        "TextOk": false,
                        "ReminderOK": true,
                        "Notes": null,
                        "IsPrimary": false,
                        "ObjectState": "None",

                    },
                    {
                        "PatientId": "cd7bcb7a-e0d6-42a9-a050-7f9342975e86",
                        "ContactId": "4e1fa303-d82f-48bc-ba60-949f85a30e15",
                        "PhoneNumber": "6666666666",
                        "Type": "Work",
                        "TextOk": false,
                        "ReminderOK": true,
                        "Notes": null,
                        "IsPrimary": false,
                        "ObjectState": "None",

                    }
                ],
                "Emails": [
                    {
                        "PatientId": "cd7bcb7a-e0d6-42a9-a050-7f9342975e86",
                        "PatientEmailId": "8d8ffad3-b707-42ac-80a7-074073a87414",
                        "Email": "s2@abc.com",
                        "ReminderOK": true,
                        "IsPrimary": false,
                        "AccountEmailId": null,
                        "AccountEMail": null,
                        "Links": null,
                        "ObjectState": "None",
                    },
                    {
                        "PatientId": "cd7bcb7a-e0d6-42a9-a050-7f9342975e86",
                        "PatientEmailId": "29291c8d-37f4-4567-8bca-6c60ae24ad88",
                        "Email": "s1@abc.com",
                        "ReminderOK": true,
                        "IsPrimary": true,
                        "AccountEmailId": null,
                        "AccountEMail": null,
                        "Links": null,
                        "ObjectState": "None",
                    },
                    {
                        "PatientId": "cd7bcb7a-e0d6-42a9-a050-7f9342975e86",
                        "PatientEmailId": "637c5d14-3f9a-42e0-bd2c-dbd9992367bc",
                        "Email": "s3@abc.com",
                        "ReminderOK": true,
                        "IsPrimary": false,
                        "AccountEmailId": null,
                        "AccountEMail": null,
                        "Links": null,
                        "ObjectState": "None",
                    }
                ]
            },
            {
                "PatientLite": {
                    "PatientId": "9fc37445-2a23-4dcf-a10e-bcf753920be0",
                    "FirstName": "Dady",
                    "LastName": "dada",
                    "MiddleName": "",
                    "PreferredName": "",
                    "SuffixName": "",
                    "DateOfBirth": "1980-12-12T06:00:00",
                    "IsPatient": true,
                    "PhoneNumber": null,
                    "IsResponsiblePerson": true,
                    "IsActiveAccountMember": true,
                    "RelationshipToPolicyHolder": null,
                    "IsActive": true,
                    "AddressReferrerId": null,
                    "PatientCode": "DADDA2",
                },
                "Contacts": [
                    {
                        "PatientId": "9fc37445-2a23-4dcf-a10e-bcf753920be0",
                        "ContactId": "77f1e691-edb1-4746-81c9-53d425c0afd0",
                        "PhoneNumber": "3333333333",
                        "Type": "Work",
                        "TextOk": false,
                        "ReminderOK": true,
                        "Notes": null,
                        "IsPrimary": false,
                        "ObjectState": "None",

                    },
                    {
                        "PatientId": "9fc37445-2a23-4dcf-a10e-bcf753920be0",
                        "ContactId": "96b02610-abac-4a78-8a46-a75058e452b3",
                        "PhoneNumber": "2222222222",
                        "Type": "Home",
                        "TextOk": false,
                        "ReminderOK": true,
                        "Notes": null,
                        "IsPrimary": false,
                        "ObjectState": "None",


                    },
                    {
                        "PatientId": "9fc37445-2a23-4dcf-a10e-bcf753920be0",
                        "ContactId": "c5475c90-ed66-4d5a-aba1-d6ec9a191853",
                        "PhoneNumber": "1111111111",
                        "Type": "Mobile",
                        "TextOk": true,
                        "ReminderOK": true,
                        "Notes": null,
                        "IsPrimary": true,
                        "ObjectState": "None",

                    }
                ],
                "Emails": [
                    {
                        "PatientId": "9fc37445-2a23-4dcf-a10e-bcf753920be0",
                        "PatientEmailId": "8a9e92b3-659d-4d31-b595-213bf32fed63",
                        "Email": "1@abc.com",
                        "ReminderOK": true,
                        "IsPrimary": true,
                        "AccountEmailId": null,
                        "AccountEMail": null,
                        "Links": null,
                        "ObjectState": "None",
                    },
                    {
                        "PatientId": "9fc37445-2a23-4dcf-a10e-bcf753920be0",
                        "PatientEmailId": "075f8c76-4aa0-464f-bffc-98dcbd348f2d",
                        "Email": "3@abc.com",
                        "ReminderOK": true,
                        "IsPrimary": false,
                        "AccountEmailId": null,
                        "AccountEMail": null,
                        "Links": null,
                        "ObjectState": "None",
                    },
                    {
                        "PatientId": "9fc37445-2a23-4dcf-a10e-bcf753920be0",
                        "PatientEmailId": "5c48d573-2b6d-40c3-ae88-a6863ad825c4",
                        "Email": "2@abc.com",
                        "ReminderOK": true,
                        "IsPrimary": false,
                        "AccountEmailId": null,
                        "AccountEMail": null,
                        "Links": null,
                        "ObjectState": "None",
                        
                    }
                ]
            },
            {
                "PatientLite": {
                    "PatientId": "30da8585-8585-4119-a71b-ed08bc232bdc",
                    "FirstName": "child33",
                    "LastName": "child33",
                    "MiddleName": "",
                    "PreferredName": "",
                    "SuffixName": "",
                    "DateOfBirth": null,
                    "IsPatient": true,
                    "PhoneNumber": null,
                    "IsResponsiblePerson": false,
                    "IsActiveAccountMember": true,
                    "RelationshipToPolicyHolder": null,
                    "IsActive": true,
                    "AddressReferrerId": null,
                    "PatientCode": "CHICH8",
                    "PrimaryDuplicatePatientId": null,
                    "IsRxRegistered": false
                },
                "Contacts": [
                    {
                        "PatientId": "30da8585-8585-4119-a71b-ed08bc232bdc",
                        "ContactId": "6e8748b3-5079-4a6d-afd4-066ea7088995",
                        "PhoneNumber": "9000000000",
                        "Type": "Mobile",
                        "TextOk": true,
                        "ReminderOK": true,
                        "Notes": null,
                        "IsPrimary": false,
                        "ObjectState": "None",
                        "FailedMessage": null,
                        "PhoneReferrerId": null,
                        "PhoneReferrerName": null,
                        "PhoneReferrer": null,

                    }
                ],
                "Emails": []
            }
        ],
    };


    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), AppKendoUIModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule],
            declarations: [ContactDetailsComponent, AppToggleComponent, SvgIconComponent, AppCheckBoxComponent, AppLabelComponent,
                AppRadioButtonComponent, AppSelectComponent],
            providers: [
                { provide: PatientRegistrationService, useValue: mockservice },
                { provide: 'PatientServices', useValue: mockservice },
                { provide: 'toastrFactory', useValue: mockservice },
                { provide: 'StaticData', useValue: mockservice },
                { provide: '$routeParams', useValue: mockservice },
                { provide: PhoneNumberPipe, useValue: mockservice },
                { provide: PatientHttpService, useValue: mockservice },

            ]

        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ContactDetailsComponent);
        spyOn(window.sessionStorage, 'getItem').and.callFake(() => (JSON.stringify({ Result: { User: '1' } })));
        component = fixture.componentInstance;
        fixture.detectChanges();
        patientRegistrationService = TestBed.inject(PatientRegistrationService);
        patientServices = TestBed.inject(PatientHttpService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should verify the event form handlePersonRegristerationEvents for SelectResponsible to call handleSelectedResponsiblePerson ', () => {
        const event={...mockservice.registrationCustomEvent};
        spyOn(patientRegistrationService, 'getRegistrationEvent').and.returnValue(of(event));
        spyOn(component, 'handleSelectedResponsiblePerson').and.callThrough();
        component.handlePersonRegristerationEvents();
        expect(patientRegistrationService.getRegistrationEvent).toHaveBeenCalled();
        expect(component.handleSelectedResponsiblePerson).toHaveBeenCalled();
        expect(mockservice.registrationCustomEvent.eventtype).toEqual(3);

    });
    it('should call handleSelectedResponsiblePerson then getPhonesAndEmails to get the emails and phones of RP and its dependents', () => {
        const event={...mockservice.registrationCustomEvent};
        spyOn(patientServices, 'getAllAccountMembersByAccountId').and.callThrough();
        spyOn(patientServices, 'getPatientResponsiblePartyPhonesAndEmails').and.returnValue(of(mockservice.res));
        component.handleSelectedResponsiblePerson(event);
        expect(patientServices.getAllAccountMembersByAccountId).toHaveBeenCalled();
        expect(patientServices.getPatientResponsiblePartyPhonesAndEmails).toHaveBeenCalled();
    });

});
