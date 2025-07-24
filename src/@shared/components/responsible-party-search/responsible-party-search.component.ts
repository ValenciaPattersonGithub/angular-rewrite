import { Component, OnInit, Inject, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { ResponsiblePersonTypeEnum } from '../../models/responsible-person-type-enum';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { debounceTime } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { RegistrationEvent } from 'src/patient/common/models/enums';
@Component({
    selector: 'responsible-party-search',
    templateUrl: './responsible-party-search.component.html',
    styleUrls: ['./responsible-party-search.component.scss'],
    host: {
        '(document:click)': 'onClick($event)',
    },
})
export class ResponsiblePartySearchComponent implements OnInit {
    showSearch: any = false;
    takeAmount: number = 45;
    limit: number = 15;
    limitResults: boolean = true;
    searchTerm: any = '';
    searchString: any = '';
    resultCount: number = 0;
    searchResults: any = [];
    noSearchResults: any;
    disableResponsiblePerson: any = false;
    person: any;
    selectedResponsiblePerson: any;
    responsiblePerson: any;
    ageCheck: any;
    patient: any;
    responsiblePersonName: any;
    IsResponsiblePersonEditable: any;
    responsiblePersonForm: FormGroup;
    searchInput = new FormControl();
    hideData: any;
    disableSearchInput: any;
    @Output() selectedValueChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() selectedInsuranceValueChanged: EventEmitter<any> = new EventEmitter<any>();
    @Input() componentName: string;
    @Input() variation: string;
    @Input() responsibleParty: string;
    @Input() isDisabled: boolean;
    @Input() isValid: boolean;
    @Input() errorToolTipMessage: string;
    @Input() currentPersonId: string;
    constructor(
        @Inject('toastrFactory') private toastrFactory,
        private translate: TranslateService,
        @Inject('PatientServices') private patientServices,
        @Inject('PersonServices') private personServices,
        @Inject('PatientValidationFactory') private patientValidationFactory,
        @Inject('ModalFactory') private modalFactory,
        private datepipe: DatePipe,
        private patientService: PatientHttpService,
        private elementref: ElementRef,
        private registrationService: PatientRegistrationService,
        @Inject('tabLauncher') private tabLauncher) { }

    ngOnInit() {
        this.isValid = true;
        setTimeout(() => {
            if (this.responsibleParty && this.componentName === 'PersonalDetail') {
                this.searchTerm = this.responsibleParty;
                this.disableSearchInput = true;
                this.IsResponsiblePersonEditable = true;
            }
            if (this.responsibleParty && this.componentName === 'Referral') {
                this.searchTerm = this.responsibleParty;
            }
        }, 400);
        this.onSearchChanges();
    }
    onClick(event) {
        if (this.componentName === 'PersonalDetail') {
            if (!this.elementref.nativeElement.contains(event.target)) {
                this.hideData = true;
            }
            else {
                this.hideData = false;
            }
        }
    }
    responsiblePersonTypeChange = (type) => {
        this.showSearch = type == ResponsiblePersonTypeEnum.other ? true : false;
    }
    onSearchChanges = () => {
        this.searchInput.valueChanges.pipe(debounceTime(500)).subscribe(() => {
            if (this.searchInput.value.length > 0) {
                if (this.validSearch(this.searchInput.value)) {
                    this.IsResponsiblePersonEditable = true;
                    this.limit = 15;
                    this.limitResults = true;
                    this.searchString = this.searchInput.value;
                    this.resultCount = 0;
                    this.searchResults = [];
                    let searchParams = {
                        searchFor: this.searchString,
                        skip: this.searchResults.length,
                        take: this.takeAmount,
                        excludePatient: this.currentPersonId
                    };
                    this.patientService.patientSearch(searchParams)
                        .subscribe((data: any) => this.searchGetOnSuccess(data),
                            error => this.searchGetOnError());
                }
            } else {
                this.searchResults = [];
                this.IsResponsiblePersonEditable = false;
            }
        });
    }
    searchGetOnSuccess = (res) => {
        this.resultCount = res.Count;
        this.searchResults = res.Value;
        this.noSearchResults = this.resultCount === 0;
    };
    searchGetOnError = () => {
        this.toastrFactory.error(
            this.translate.instant('Please search again.'),
            this.translate.instant('Server Error'));
        this.resultCount = 0;
        this.searchResults = [];
        this.noSearchResults = true;
    };
    validSearch = (searchString) => {
        // if format XXX- allow search
        const validPhoneRegex = new RegExp(/^[0-9]{3}?\-$/);
        if (validPhoneRegex.test(searchString)) {
            return true;
        }
        // if format X or XX or XXX prevent search
        const phoneRegex = new RegExp(/^[0-9]{1,3}?$/);
        if (phoneRegex.test(searchString)) {
            return false;
        }
        // if format XX- or XX/ allow search
        const validDateRegex = new RegExp(/^[0-9]{1,2}?\-?$/);
        if (validDateRegex.test(searchString)) {
            return true;
        }
        // if format XX- or XX/ allow search
        const dateRegex = new RegExp(/^[0-9]{1,2}?\/?$/);
        if (dateRegex.test(searchString)) {
            return true;
        }
        return true;
    }
    onResponsiblePersonSelect = (person) => {
        this.selectedResponsiblePerson = person;
        this.disableResponsiblePerson = true;
        this.registrationService.selectedResponsiblePerson = person;
        this.personServices.Persons.get({ Id: person.PatientId }, this.PersonServicesGetSuccess, this.PersonServicesGetFailure);
    }
    PersonServicesGetSuccess = (res) => {
        if (res.Value) {
            this.person = res.Value;
            const userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
            if (this.componentName === 'Referral' || this.componentName === 'Insurance') {
                this.populateSelectedResult();
                this.hideData = true;
            } else {
                this.searchResults = [];
                const locationMatch = this.patientValidationFactory.CheckPatientLocation(this.person, userLocation);
                if (locationMatch) {
                    this.populateSelectedResult();
                }
                else {
                    this.patientValidationFactory.SetCheckingUserPatientAuthorization(true);
                    this.patientValidationFactory.PatientSearchValidation(this.selectedResponsiblePerson)
                        .then(this.patientSearchValidationSuccess);
                }
                this.disableResponsiblePerson = false;
            }
        }
    }

    PersonServicesGetFailure = () => {
        this.searchResults = [];
        this.toastrFactory.error(
            this.translate.instant('Failed to retrieve the patient info.'),
            this.translate.instant('Server Error'));
    }
    patientSearchValidationSuccess = (res) => {
        const patientInfo = res;
        if (!patientInfo.authorization.UserIsAuthorizedToAtLeastOnePatientLocation) {
            this.patientValidationFactory.LaunchPatientLocationErrorModal(patientInfo);
            this.patientValidationFactory.SetCheckingUserPatientAuthorization(false);
            this.searchTerm = '';
            this.selectedResponsiblePerson = null;
        } else {
            this.populateSelectedResult();
        }
        this.patientValidationFactory.SetCheckingUserPatientAuthorization(false);
    }
    populateSelectedResult = () => {
        const dob = this.datepipe.transform(this.selectedResponsiblePerson.DateOfBirth, 'MM/dd/yyyy');
        this.searchTerm = `${this.selectedResponsiblePerson.FirstName} ${this.selectedResponsiblePerson.LastName} | ID: ${this.selectedResponsiblePerson.PatientCode ? this.selectedResponsiblePerson.PatientCode : ''} | DOB: ${dob ? dob : ''}`;
        this.responsiblePerson = this.selectedResponsiblePerson;
        this.patientServices.Patients.get({ Id: this.responsiblePerson.PatientId },
            this.PatientServicesGetSuccess, this.PatientServicesGetFailure);
        if (this.componentName === 'PersonalDetail') {
            this.IsResponsiblePersonEditable = true;
        }
    }
    PatientServicesGetSuccess = (res) => {
        if (res.Value) {
            this.disableSearchInput = true;
            if (res.Value && this.componentName === 'PersonalDetail') {
                this.selectedValueChanged.emit(res.Value);
                if (res.Value.PersonAccount && res.Value.PersonAccount.PersonAccountMember &&
                    res.Value.PersonAccount.PersonAccountMember.ResponsiblePersonId == this.responsiblePerson.PatientId) {
                    this.responsiblePerson.PersonAccount = res.Value.PersonAccount;
                    this.checkForResponsiblePersonAccountAndAge(this.responsiblePerson);
                } else {
                    this.responsiblePerson.PatientId = null;
                    this.checkForResponsiblePersonAccountAndAge(this.responsiblePerson);
                }
            } else if (this.componentName === 'Insurance') {
                this.selectedInsuranceValueChanged.emit(res.Value);
                this.hideData = true;
            } else if (this.componentName === 'Referral') {
                this.selectedValueChanged.emit(res.Value);
            }
        }
    }

    PatientServicesGetFailure = () => {
        this.responsiblePerson.PatientId = null;
        if (this.componentName === 'PersonalDetail') {
            this.checkForResponsiblePersonAccountAndAge(this.responsiblePerson);
        }
    }
    checkForResponsiblePersonAccountAndAge = (patient) => {
        let message, title, okButtonText;
        if (patient != null && patient.PatientId == null) {
            message = `${patient.FirstName ? patient.FirstName : ''} ${patient.LastName ? patient.LastName : ''} cannot be selected as the responsible person as he/she is not the responsible person for his/her own account.`;
            title = this.translate.instant('Responsible Person Validation');
            okButtonText = this.translate.instant('OK');
            this.modalFactory.ConfirmModal(title, message, okButtonText).then(this.clearSearch);
        } else {
            this.ageCheck = true;
            this.validateAge(patient);

        }
    }
    validateAge = (patient) => {
        let message, title, continueButtonText, cancelButtonText;
        const dob = this.datepipe.transform(this.selectedResponsiblePerson.DateOfBirth, 'MM/dd/yyyy');
        if (patient != null && patient.DateOfBirth) {
            const timeDiff = Math.abs(Date.now() - new Date(patient.DateOfBirth).getTime());
            const age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);
            if (age < 18 && this.ageCheck) {
                this.ageCheck = false;
                message = `${patient.FirstName} ${patient.LastName} is under the age of 18.`;
                title = this.translate.instant('Responsible Person Validation');
                continueButtonText = this.translate.instant('Continue');
                cancelButtonText = this.translate.instant('Cancel');
                this.modalFactory.ConfirmModal(title, message, continueButtonText, cancelButtonText)
                    .then(this.continueResponsiblePerson, this.clearSearch);
            } else {
                this.disableResponsiblePerson = (patient != null && patient.PatientId ? true : false);

                if (this.selectedResponsiblePerson != null) {
                    this.searchTerm = `${this.selectedResponsiblePerson.FirstName} ${this.selectedResponsiblePerson.LastName} (RP) | ID: ${this.selectedResponsiblePerson.PatientCode ? this.selectedResponsiblePerson.PatientCode : ''} | DOB: ${dob ? dob : ''}`;
                }
            }
        } else {
            this.disableResponsiblePerson = (patient != null && patient.ResponsiblePersonId ? true : false);
            this.searchTerm = this.selectedResponsiblePerson != null && this.selectedResponsiblePerson != undefined ? this.searchTerm = `${this.selectedResponsiblePerson.FirstName} ${this.selectedResponsiblePerson.LastName} (RP) | ID: ${this.selectedResponsiblePerson.PatientCode ? this.selectedResponsiblePerson.PatientCode : ''} | DOB: ${dob ? dob : ''}` : this.searchTerm;
        }
    }
    clearSearch = () => {
        if (!this.isDisabled) {
            this.searchInput.patchValue('');
            this.initializeSearch();
            this.disableSearchInput = null;
            if (this.componentName === 'PersonalDetail') {
                this.selectedValueChanged.emit('');
                this.registrationService.setRegistrationEvent({
                    eventtype: RegistrationEvent.SelectedResponible,
                    data: ''
                });
                this.disableResponsiblePerson = false;
                this.IsResponsiblePersonEditable = false;
                this.responsiblePerson = null;
            } else if (this.componentName === 'Insurance') {
                this.selectedInsuranceValueChanged.emit('');
                this.hideData = false;
            }
        }
    }
    initializeSearch = () => {
        this.takeAmount = 45;
        this.limit = 15;
        this.limitResults = true;
        this.searchTerm = '';
        this.searchString = '';
        this.resultCount = 0;
        this.searchResults = [];
    }
    continueResponsiblePerson = () => {
        const dob = this.datepipe.transform(this.selectedResponsiblePerson.DateOfBirth, 'MM/dd/yyyy');
        this.disableResponsiblePerson = true;
        this.searchTerm = `${this.selectedResponsiblePerson.FirstName} ${this.selectedResponsiblePerson.LastName} (RP) | ID: ${this.selectedResponsiblePerson.PatientCode ? this.selectedResponsiblePerson.PatientCode : ''} | DOB: ${dob ? dob : ''}`;
    }
    addAPerson = () => {
        const patientPath = '#/Patient/';
        this.tabLauncher.launchNewTab(patientPath + 'Register/');
    }
}
