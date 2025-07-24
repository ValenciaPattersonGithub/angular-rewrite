import { Component, Inject, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";
import { PatientRegistrationService } from "src/patient/common/http-providers/patient-registration.service";
import { RegistrationEvent } from "src/patient/common/models/enums";
import { RegistrationCustomEvent } from "src/patient/common/models/registration-custom-event.model";
import { PatientHttpService } from "src/patient/common/http-providers/patient-http.service";
import { TranslateService } from "@ngx-translate/core";
import { ResponsiblePersonTypeEnum } from "src/@shared/models/responsible-person-type-enum";
import { PhoneNumberPipe } from "src/@shared/pipes/phone-number/phone-number.pipe";
@Component({
    selector: "contact-details",
    templateUrl: "./contact-details.component.html",
    styleUrls: ["./contact-details.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class ContactDetailsComponent implements OnInit {
    phoneDetailHeaders: any[];
    emailDetailHeaders: any[];
    @Input() phoneTypes: any[];
    filteredAccountMembers: Array<{ text: string; value: number }> = [];
    @Input() states: Array<{ text: string; value: any }> = [];
    @Input() contactDetails: FormGroup;
    state: any;
    disableMemberAddress: any;
    responsiblePersonType: any;
    optMails: boolean;
    optPhones: boolean;
    optEmails: boolean;
    optAll: boolean;
    disableState: boolean;
    disableAccountMemberAddress: any;
    isValidZipCode = true;
    patientEmails: any[] = [];
    patientPhones: any[] = [];
    isHidePhoneEmailOwners = false;
    isEditRegister: boolean;
    constructor(
        private registrationService: PatientRegistrationService,
        @Inject("PatientServices") private patientServices,
        private patientService: PatientHttpService,
        @Inject("toastrFactory") private toastrFactory,
        private translate: TranslateService,
        private fb: FormBuilder,
        private phoneNumberPipe: PhoneNumberPipe,
        @Inject("$routeParams") private route
    ) {}

    ngOnInit() {
        this.initialize();
        this.handlePersonRegristerationEvents();
        this.isEditRegister = this.route.hasOwnProperty('patientId');
    }
    initialize = () => {
        this.disableAccountMemberAddress = "disabled";
        this.optPhones = false;
        this.optEmails = false;
        this.optAll = false;
        this.phoneDetailHeaders = [
            { label: "Phone Owner", hide: true },
            { label: "Phone Number" },
            { label: "Phone Type" },
            { label: "Primary" },
            { label: "Phone Reminders" },
            { label: "Text Reminders" },
            { label: "" },
        ];

        this.emailDetailHeaders = [{ label: "Email Owner", hide: true }, { label: "Email Address" }, { label: "Primary" }, { label: "Email Reminders" }, { label: "" }];
    };

    handlePersonRegristerationEvents = () => {
        this.registrationService
            .getRegistrationEvent()
            .pipe()
            .subscribe((event: RegistrationCustomEvent) => {
                if (event) {
                    switch (event.eventtype) {
                        case RegistrationEvent.SelectedResponible:
                            this.handleSelectedResponsiblePerson(event);
                            break;
                        case RegistrationEvent.CheckedResponsiblePerson:
                            this.handleCheckedResponsiblePerson(event);
                            break;
                    }
                }
            });
        if (this.contactDetails) {
            this.contactDetails.valueChanges.subscribe((contactDetail: any) => {
                if (contactDetail.optOutPhones || contactDetail.optOutEmails) {
                    this.optEmails = contactDetail.optOutEmails;
                    this.optPhones = contactDetail.optOutPhones;
                    this.optAll = this.optEmails && this.optPhones;
                    this.optMails = this.optAll;
                }
            });
        }
    };
    getPhonesAndEmails = (person: any) => {
        this.patientService.getPatientResponsiblePartyPhonesAndEmails(person.PatientId).subscribe(
            (data: any) => this.getPatientContactsByIdOnSuccess(data, person),
            (error) => this.getPatientContactsByIdOnFail()
        );
    };
    getAccountMembers = (accountId: any) => {
        if (accountId) {
            this.disableMemberAddress = true;
            this.patientService.getAllAccountMembersByAccountId(accountId).subscribe(
                (data: any) => this.getAllAccountMembersByAccountIdOnSuccess(data),
                (error) => this.getAllAccountMembersByAccountIdOnFail()
            );
        }
    };
    handleSelectedResponsiblePerson = (event: RegistrationCustomEvent) => {
        if (event.data) {
            if (event.data.PersonAccount) {
                const accountId = event.data.PersonAccount.AccountId;
                this.getAccountMembers(accountId);
            }
            this.getPhonesAndEmails(event.data);
        } else {
            this.disableAccountMemberAddress = "disabled";
            this.contactDetails.patchValue({
                //AddressLine1: "",
                //AccountMember: "",
                //AddressLine2: "",
                //City: "",
                //State: "",
                MemberAddress: "",
                //ZipCode: "",
                ResponsiblePersonId: null,
                RPLastName: null,
                RPFirstName: null,
            });
            this.disableMemberAddress = null;
            this.filteredAccountMembers = [];
            this.registrationService.setRegistrationEvent({
                eventtype: RegistrationEvent.AccountMembers,
                data: this.filteredAccountMembers,
            });
            this.isHidePhoneEmailOwners = false;
            this.phoneDetailHeaders.forEach((phoneHeader: any) => {
                if (!phoneHeader.hide && phoneHeader.label === "Phone Owner") {
                    phoneHeader.hide = true;
                }
            });
            this.emailDetailHeaders.forEach((emailHeader: any) => {
                if (!emailHeader.hide && emailHeader.label === "Email Owner") {
                    emailHeader.hide = true;
                }
            });
        }
    };
    handleCheckedResponsiblePerson = (event: RegistrationCustomEvent) => {
        this.disableMemberAddress = null;
        if (Number(event.data) === ResponsiblePersonTypeEnum.other) {
            this.responsiblePersonType = ResponsiblePersonTypeEnum.other;
        } else {
            this.responsiblePersonType = ResponsiblePersonTypeEnum.self;
            this.isHidePhoneEmailOwners = false;
            this.emailDetailHeaders.forEach((emailHeader: any) => {
                if (!emailHeader.hide && emailHeader.label === "Email Owner") {
                    emailHeader.hide = true;
                }
            });
            this.phoneDetailHeaders.forEach((phoneHeader: any) => {
                if (!phoneHeader.hide && phoneHeader.label === "Phone Owner") {
                    phoneHeader.hide = true;
                }
            });
            this.filteredAccountMembers = [];
            const phones = this.contactDetails.controls.Phones as FormArray;
            phones.controls.forEach((item: any, index: number) => {
                if (item.value.PhoneOwner !== "0" && this.isEditRegister) {
                    this.deletePhoneNumber(index);
                }
            });

            const emails = this.contactDetails.controls.Emails as FormArray;
            emails.controls.forEach((item: any, index: number) => {
                if (item.value.EmailOwner !== "0" && this.isEditRegister) {
                    this.deleteEmail(index);
                }
            });
            this.registrationService.setRegistrationEvent({
                eventtype: RegistrationEvent.AccountMembers,
                data: this.filteredAccountMembers,
            });
        }
    };
    getAllAccountMembersByAccountIdOnSuccess = (response) => {
        if (response && response.Value && response.Value.length) {
            this.filteredAccountMembers = [];
            this.disableAccountMemberAddress = null;
            response.Value.forEach((accountMember: any) => {
                if (accountMember.PatientId !== this.route.patientId) {
                    this.filteredAccountMembers.push({
                        text: accountMember.FirstName + " " + accountMember.LastName,
                        value: accountMember.PatientId,
                    });
                }
            });
            this.registrationService.setRegistrationEvent({
                eventtype: RegistrationEvent.AccountMembers,
                data: response.Value,
            });
        }
        this.disableMemberAddress = this.contactDetails && this.contactDetails.value.MemberAddress ? true : null;
    };
    getAllAccountMembersByAccountIdOnFail = () => {
        this.toastrFactory.error(this.translate.instant("Failed to load account members for responsible person"), this.translate.instant("Server Error"));
    };
    onAccountMemberSelected = (event: any) => {
        if (event.target.value && event.target.value !== "0") {
            this.disableMemberAddress = true;
            this.patientServices.Patients.get({ Id: event.target.value }, this.getPatientByIdOnSuccess, this.getPatientByIdOnFail);
        } else {
            this.disableMemberAddress = null;
            this.contactDetails.patchValue({
                AddressLine1: "",
                AccountMember: "",
                AddressLine2: "",
                City: "",
                State: "",
                MemberAddress: "",
                ZipCode: "",
                PersonAccountId: "",
            });
        }
    };
    getPatientByIdOnSuccess = (res) => {
        const responsiblePerson = res.Value;
        this.contactDetails.patchValue({
            AddressLine1: responsiblePerson.AddressLine1,
            AddressLine2: responsiblePerson.AddressLine2,
            City: responsiblePerson.City,
            State: responsiblePerson.State ? responsiblePerson.State : "",
            ZipCode: responsiblePerson.ZipCode,
        });
    };

    getPatientByIdOnFail = (error) => {
        this.toastrFactory.error(this.translate.instant("Failed to load patient info"), this.translate.instant("Server Error"));
    };
    newPhone = (isPrimary: boolean) => {
        return this.fb.group({
            PhoneNumber: [null, [Validators.minLength(10)]],
            PhoneType: [0, [Validators.required]],
            IsPrimary: [isPrimary],
            PhoneReminder: [true],
            TextReminder: [false],
            ValidPhoneNumber: [true],
            ValidPhoneType: [true],
            ObjectState: ["Add"],
            ContactId: [null],
            DataTag: [null],
            PhoneOwner: [0],
            PatientId: [this.route ? this.route.patientId : null],
            PhoneReferrerId: [null],
            isDisabled: [false],
        });
    };
    newEmail = (isPrimary: boolean) => {
        const emails = this.contactDetails.controls.Emails as FormArray;
        // isPrimary = emails.length === 0;
        return this.fb.group({
            EmailAddress: [null, [Validators.required, Validators.pattern("^[a-zA-Z0-9.!#$%&'*+-/=?^_`{|]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$")]],
            IsPrimary: [isPrimary],
            EmailReminder: [true],
            ValidEmail: [true],
            ObjectState: ["Add"],
            PatientEmailId: [null],
            DataTag: [null],
            EmailOwner: [0],
            isHidePhoneEmailOwners: [this.responsiblePersonType === ResponsiblePersonTypeEnum.other ? true : false],
            PatientId: [this.route ? this.route.patientId : null],
            AcountEmailId: [null],
            isDisabled: [false],
        });
    };
    addPhoneNumber = () => {
        const phones = this.contactDetails.controls.Phones as FormArray;
        let flag: boolean = false;
        for (let el of phones.controls) {
            let p = el as FormGroup;
            flag = p.controls.ObjectState.value !== "Delete";
            if (flag) break;
        }
        if (!phones.invalid) {
            phones.push(this.newPhone(!flag));
        }
    };
    addEmail = () => {
        const emails = this.contactDetails.controls.Emails as FormArray;
        let flag: boolean = false;
        for (let el of emails.controls) {
            let p = el as FormGroup;
            flag = p.controls.ObjectState.value !== "Delete";
            if (flag) break;
        }
        if (!emails.invalid) {
            emails.push(this.newEmail(!flag));
        }
    };
    deleteEmail = (index: any) => {
        const emails = this.contactDetails.controls.Emails as FormArray;
        const selectedemail = emails.controls[index];
        if (emails.length > 1) {
            if (selectedemail.value.IsPrimary) {
                const nonprimaryIndex = emails.value.findIndex((x) => !x.IsPrimary && x.ObjectState !== "Delete");
                if (nonprimaryIndex !== -1) {
                    const nonPrimaryEmail = emails.controls[nonprimaryIndex].value;
                    const objectState = nonPrimaryEmail.PatientEmailId ? "Update" : nonPrimaryEmail.ObjectState;
                    emails.controls[nonprimaryIndex].patchValue({ IsPrimary: true, ObjectState: objectState });
                }
            }
            if (selectedemail.value.PatientEmailId) {
                selectedemail.patchValue({ IsPrimary: false, ObjectState: "Delete" });
            } else {
                emails.removeAt(index);
            }
        } else {
            const email = emails.controls[index].value;
            const objectState = email.PatientEmailId ? "Delete" : email.ObjectState;
            const emailAddress = email.PatientEmailId ? email.EmailAddress : null;
            const isPrimary = email.PatientEmailId ? false : true;
            emails.controls[index].patchValue({
                EmailAddress: emailAddress,
                IsPrimary: isPrimary,
                EmailReminder: true,
                ObjectState: objectState,
                ValidEmail: true,
                EmailOwner: 0,
            });
        }
    };
    deletePhoneNumber = (index: any) => {
        const phones = this.contactDetails.controls.Phones as FormArray;
        const selectedphone = phones.controls[index];
        if (phones.length > 1) {
            if (selectedphone.value.IsPrimary) {
                const nonprimaryIndex = phones.value.findIndex((x) => !x.IsPrimary && x.ObjectState !== "Delete");
                if (nonprimaryIndex !== -1) {
                    const nonPrimaryphone = phones.controls[nonprimaryIndex].value;
                    const objectState = nonPrimaryphone.ContactId ? "Update" : nonPrimaryphone.ObjectState;
                    phones.controls[nonprimaryIndex].patchValue({ IsPrimary: true, ObjectState: objectState });
                }
            }
            if (selectedphone.value.ContactId) {
                selectedphone.patchValue({ IsPrimary: false, ObjectState: "Delete" });
            } else {
                phones.removeAt(index);
            }
        } else {
            const objectState = selectedphone.value.ContactId ? "Delete" : selectedphone.value.ObjectState;
            const phoneNumber = selectedphone.value.ContactId ? selectedphone.value.PhoneNumber : null;
            const phoneType = selectedphone.value.ContactId ? selectedphone.value.PhoneType : 0;
            const isPrimary = true;
            selectedphone.patchValue({
                PhoneNumber: phoneNumber,
                PhoneType: phoneType,
                IsPrimary: isPrimary,
                PhoneReminder: true,
                TextReminder: false,
                ObjectState: objectState,
                PrimaryPhoneId: 0,
                ValidPhoneNumber: true,
                ValidPhoneType: true,
                PhoneOwner: 0,
            });
        }
    };
    optPhoneCommunications = (event: any) => {
        this.optPhones = event.currentTarget.checked;
        this.optAll = this.optPhones && this.optEmails && this.optMails;
        const phones = this.contactDetails.controls.Phones as FormArray;
        this.contactDetails.patchValue({
            optOutPhones: event.currentTarget.checked,
        });
        phones.controls.forEach((item: any) => {
            const phoneType = item.controls.PhoneType.value;
            let textReminder = false;
            if (Number(phoneType) === 3) {
                textReminder = !event.currentTarget.checked;
            }
            item.patchValue({
                PhoneReminder: !this.optPhones,
                TextReminder: textReminder,
                ObjectState: item.value.ContactId ? "Update" : item.value.ObjectState,
                optOutPhones: event.currentTarget.checked,
            });
        });
    };
    optEmailCommunications = (event: any) => {
        this.optEmails = event.currentTarget.checked;
        this.optAll = this.optPhones && this.optEmails && this.optMails;
        const emails = this.contactDetails.controls.Emails as FormArray;
        this.contactDetails.patchValue({
            optOutEmails: event.currentTarget.checked,
        });
        emails.controls.forEach((item: any) => {
            item.patchValue({
                EmailReminder: !this.optEmails,
                ObjectState: item.value.PatientEmailId ? "Update" : item.value.ObjectState,
            });
        });
    };
    optAllCommunications = (event: any) => {
        const optReminders = event.currentTarget.checked;
        this.optPhones = optReminders;
        this.optEmails = optReminders;
        this.optMails = optReminders;
        this.optPhoneCommunications(event);
        this.optEmailCommunications(event);
    };
    optMailsCommunications = (event: any) => {
        this.optMails = event.currentTarget.checked;
        this.optAll = this.optPhones && this.optEmails && this.optMails;
    };
    selectedPhoneTypeChanged = (value: any, selectedRow: any) => {
        const textReminder = Number(value) === 3;
        selectedRow.patchValue({
            PhoneType: Number(value),
            TextReminder: textReminder,
            ValidPhoneType: value !== "",
            ObjectState: selectedRow.value.ContactId ? "Update" : selectedRow.controls.ObjectState.value,
        });
        this.isPhoneNumberValid(selectedRow);
    };
    IsPrimaryPhoneChange = (rowId: any) => {
        const phones = this.contactDetails.controls.Phones as FormArray;
        phones.controls.forEach((item: any, index: any) => {
            item.patchValue({
                IsPrimary: index === rowId,
                ObjectState: item.value.ContactId && item.value.ObjectState !== "Delete" && (item.value.IsPrimary || index === rowId) ? "Update" : item.value.ObjectState,
            });
        });
    };
    IsPrimaryEmailChange = (rowId: any) => {
        const emails = this.contactDetails.controls.Emails as FormArray;
        emails.controls.forEach((item: any, index: any) => {
            item.patchValue({
                IsPrimary: index === rowId,
                ObjectState: item.value.PatientEmailId && item.value.ObjectState !== "Delete" && (item.value.IsPrimary || index === rowId) ? "Update" : item.value.ObjectState,
            });
        });
    };
    isPhoneNumberValid = (phone: any) => {
        const value = phone.value;
        let validPhoneNumber = true;

        if (value.PhoneType) {
            if (!value.PhoneNumber) {
                validPhoneNumber = false;
                phone.get("PhoneNumber").setErrors(Validators.required);
            } else if (value.PhoneNumber.length < 10) {
                validPhoneNumber = false;
                phone.get("PhoneNumber").setErrors(Validators.maxLength);
            } else if (!phone.valid) {
                validPhoneNumber = phone.valid;
            } else {
                validPhoneNumber = phone.controls.PhoneNumber.valid;
            }
        } else {
            if (value.PhoneNumber) {
                phone.get("PhoneType").setErrors(Validators.required);
            }
        }
        phone.patchValue({
            ValidPhoneNumber: validPhoneNumber,
            ValidPhoneType: value.PhoneType && value.PhoneNumber ? true : !value.PhoneNumber ? true : false,
            ObjectState: value.ContactId ? "Update" : value.ObjectState,
        });
    };
    isEmailValid = (email: any) => {
        const value = email.value;
        email.patchValue({
            ValidEmail: value.EmailAddress ? email.controls.EmailAddress.valid : true,
            ObjectState: value.PatientEmailId ? "Update" : value.ObjectState,
        });
    };
    optPhoneReminder = (event: any, phone: any) => {
        const value = phone.value;
        phone.patchValue({
            PhoneReminder: event.currentTarget.checked,
            ObjectState: value.ContactId ? "Update" : value.ObjectState,
        });
        const phones = this.contactDetails.controls.Phones as FormArray;
        this.optPhones = phones.controls.every((item: any) => !item.controls.PhoneReminder.value && !item.controls.TextReminder.value);
        this.optAll = this.optPhones && this.optEmails && this.optMails;
    };
    optTextReminder = (event: any, phone: any) => {
        const value = phone.value;
        phone.patchValue({
            TextReminder: event.currentTarget.checked,
            ObjectState: value.ContactId ? "Update" : value.ObjectState,
        });
        const phones = this.contactDetails.controls.Phones as FormArray;
        this.optPhones = phones.controls.every((item: any) => !item.controls.PhoneReminder.value && !item.controls.TextReminder.value);
        this.optAll = this.optPhones && this.optEmails && this.optMails;
    };
    optEmailReminder = (event: any, email: any) => {
        const value = email.value;
        email.patchValue({
            EmailReminder: event.currentTarget.checked,
            ObjectState: value.PatientEmailId ? "Update" : value.ObjectState,
        });
        const emails = this.contactDetails.controls.Emails as FormArray;
        this.optEmails = emails.controls.every((item: any) => !item.controls.EmailReminder.value);
        this.optAll = this.optPhones && this.optEmails && this.optMails;
    };
    isZipCodeValid = (event: any) => {
        this.isValidZipCode = this.contactDetails.controls.ZipCode.valid;
    };
    getPatientContactsByIdOnSuccess = (res: any, responsiblePerson: any) => {
        if (res.length && responsiblePerson) {
            this.isHidePhoneEmailOwners = true;
            this.phoneDetailHeaders.forEach((phoneHeader: any) => {
                if (phoneHeader.hide && phoneHeader.label === "Phone Owner") {
                    phoneHeader.hide = false;
                }
            });
            this.patientPhones = [];
            if (this.route.patientId) {
                res = res.filter((x) => x.PatientLite && x.PatientLite.PatientId !== this.route.patientId);
            }
            res.forEach((patientorperson: any) => {
                const contactsDto = patientorperson.Contacts;
                const patientLiteDto = patientorperson.PatientLite;
                const responsiblePersonPhones = contactsDto.map((phone) => ({
                    text: `${patientLiteDto.FirstName} ${patientLiteDto.LastName} ${this.phoneNumberPipe.transform(phone.PhoneNumber)} ${phone.Type}`,
                    value: phone.ContactId,
                    PatientName: `${patientLiteDto.FirstName} ${patientLiteDto.LastName}`,
                    PatientPhoneNumber: phone.PhoneNumber,
                    PatientPhoneType: phone.Type,
                    IsPrimary: phone.IsPrimary,
                    ReminderOK: phone.ReminderOK,
                    TextOK: phone.TextOK,
                    ObjectState: phone.ObjectState,
                }));
                responsiblePersonPhones.forEach((element: any) => {
                    this.patientPhones.push(element);
                });
            });
            this.getPatientEmailsByIdOnSuccess(res, responsiblePerson);
        }
    };
    getPatientContactsByIdOnFail = () => {};
    getPatientEmailsByIdOnSuccess = (res: any, responsiblePerson: any) => {
        if (res && res.length && responsiblePerson) {
            this.isHidePhoneEmailOwners = true;
            this.emailDetailHeaders.forEach((emailHeader: any) => {
                if (emailHeader.hide && emailHeader.label === "Email Owner") {
                    emailHeader.hide = false;
                }
            });
            this.patientEmails = [];
            res.forEach((patientorperson: any) => {
                const emailsDto = patientorperson.Emails;
                const patientLiteDto = patientorperson.PatientLite;
                const responsiblePersonEmails = emailsDto.map((email) => ({
                    text: `${patientLiteDto.FirstName} ${patientLiteDto.LastName} ${email.Email}`,
                    value: email.PatientEmailId,
                    Email: email.Email,
                    PatientName: `${patientLiteDto.FirstName} ${patientLiteDto.LastName}`,
                    IsPrimary: email.IsPrimary,
                    ReminderOK: email.ReminderOK,
                    ObjectState: email.ObjectState,
                }));
                responsiblePersonEmails.forEach((element: any) => {
                    this.patientEmails.push(element);
                });
            });
        }
    };
    getPatientEmailsByIdOnFail = () => {};
    selectedPhoneOwnerChanged = (contactId: any, selectedRow: any) => {
        let patchObject;
        if (contactId !== "0") {
            const filteredPatientPhone = this.patientPhones.filter((x) => x.value === contactId);
            if (filteredPatientPhone.length) {
                const filteredPhoneType = this.phoneTypes.filter((x) => x.text === filteredPatientPhone[0].PatientPhoneType);
                const phones = this.contactDetails.controls.Phones as FormArray;
                patchObject = {
                    PhoneNumber: filteredPatientPhone[0].PatientPhoneNumber,
                    PhoneType: filteredPhoneType[0].value,
                    PhoneOwner: filteredPatientPhone[0].value,
                    TextReminder: filteredPhoneType[0].value === 3 ? true : false,
                    IsPrimary: phones.length > 1 ? false : true,
                    PhoneReminder: true,
                    ObjectState: selectedRow.value.ContactId ? "Update" : selectedRow.value.ObjectState,
                    PhoneReferrerId: filteredPatientPhone[0].value,
                    isDisabled: true,
                    ValidPhoneType: true,
                    ValidPhoneNumber: true,
                };
            }
        } else {
            patchObject = {
                PhoneNumber: "",
                PhoneType: 0,
                PhoneOwner: "",
                TextReminder: false,
                IsPrimary: false,
                PhoneReminder: true,
                ObjectState: selectedRow.value.ObjectState,
                isDisabled: false,
                ValidPhoneType: true,
                ValidPhoneNumber: true,
            };
        }
        selectedRow.patchValue(patchObject);
    };
    selectedEmailOwnerChanged = (patientEmailId: any, selectedRow: any) => {
        let patchObject;
        if (patientEmailId !== "0") {
            const filteredPatientEmail = this.patientEmails.filter((x) => x.value === patientEmailId);
            if (filteredPatientEmail.length) {
                const emails = this.contactDetails.controls.Emails as FormArray;
                patchObject = {
                    EmailAddress: filteredPatientEmail[0].Email,
                    EmailOwner: filteredPatientEmail[0].value,
                    IsPrimary: emails.length > 1 ? false : true,
                    EmailReminder: filteredPatientEmail[0].ReminderOK,
                    ObjectState: selectedRow.value.PatientEmailId ? "Update" : selectedRow.value.ObjectState,
                    isDisabled: true,
                    ValidEmail: true,
                };
            }
        } else {
            patchObject = {
                EmailAddress: "",
                EmailOwner: "",
                IsPrimary: false,
                EmailReminder: true,
                ObjectState: selectedRow.value.ObjectState,
                AcountEmailId: null,
                isDisabled: false,
                ValidEmail: true,
            };
        }
        selectedRow.patchValue(patchObject);
    };
}
