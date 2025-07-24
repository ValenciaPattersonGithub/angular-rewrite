import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { PatientHttpService } from '../../../common/http-providers/patient-http.service';
import { PatientOverview } from '../../../common/models/patient-overview.model';
import { ReferralManagementHttpService } from '../../../../@core/http-services/referral-management-http.service';
import { AffilateDetails, Patient, Provider } from '../patient-referral-model';
import { ResponseItem } from '../patient-referral-model'
import { PatientSearchParams } from '../patient-referral-model';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { PatientCommunicationCenterService } from '../../../common/http-providers/patient-communication-center.service';
import { PatientReferralPrintService } from '../patient-referral-print.service';
import { PrintPatientReferral } from '../patient-referral-print.model';
import moment from 'moment';
import { ProviderSelectorWithGroupingComponent } from 'src/@shared/components/provider-selector-with-grouping/provider-selector-with-grouping.component';
import { ReferralSource } from 'src/business-center/practice-settings/patient-profile/referral-sources/referral-sources';

@Component({
    selector: 'patient-referral-crud',
    templateUrl: './patient-referral-crud.component.html',
    styleUrls: ['./patient-referral-crud.component.scss']
})
export class PatientReferralCrudComponent extends DialogContentBase implements OnInit {
    
    @Input() fromAddPatientProfile: boolean = false;
    fromClinicalsPage: boolean = false;
    providerSelector: ProviderSelectorWithGroupingComponent;
    addReferral: FormGroup;
    showTooltip: boolean = true;
    patientProfile: PatientOverview;
    referralDirections: Array<{
        text: string;
        value: number;
        IsDisabled?: boolean;
    }> = [];
    referralDirectionId;
    referralCategories: Array<{
        text: string;
        value: number;
        IsDisabled?: boolean;
    }> = [];
    referralCategoryId;
    referringProviders: Array<{
        text: string;
        value: number;
        IsDisabled?: boolean;
    }> = [];
    referringProviderId;
    profileDetails = {};
    showRefCategories: boolean = false;
    practiceId: number;
    locationId: number;
    selectedProvider: string;
    showProviders: boolean = false;
    showReferringTo: boolean = false;
    showPatientForm: boolean;
    showPatientListForm: boolean = false;
    showTxPlan: boolean = false;
    txPlanServicesList: Array<{
        Description: string;
        Area: string;
        Tooth: string;
        Location: string;
    }>;
    plans: Array<{
        text: string;
        value: number;
        availableServices: string[];
        IsDisabled?: boolean;
        availableServicesList: Array<{
            Description: string;
            Area: string;
            Tooth: string;
            Location: string;
        }>;
    }> = [];
    allTxPlans: Array<{
        text: string;
        value: number;
        availableServices: string[];
        IsDisabled?: boolean;
        allReferredComplete: boolean;
        availableServicesList: Array<{
            Description: string;
            Area: string;
            Tooth: string;
            Location: string;
        }>;
    }> = [];
    selectedPatientName: string;
    patientList: Patient[];
    providerListBase: Provider[];
    providerList: Provider[];
    patientSearchPlaceholder: string;
    providerSearchPlaceholder: string;
    disablePatientSearch: boolean;
    filteredPatientList: Patient[];
    selectedPatientFromNewPatient: Patient;
    filteredProviderList: Provider[];
    providerSearchTemplate = 'kendoAutoCompleteProviders';
    patientSearchTemplate = 'kendoAutoCompleteAddPatient';
    showSuggestion = true;
    showPatientSearch = false;
    planId;
    selectedTxPlan: any;
    sourceNameId;
    remainingText = 0;
    isFormValid: boolean = false;
    sourceNames: any[];
    showOtherForm: boolean;
    showCampaignName: boolean = false;
    showReferringFrom: boolean;
    showPracticeInformation: boolean = false;
    patientSearchParams: PatientSearchParams;
    private searchInput$ = new Subject<string>();
    referringToProviderId: string;
    @Output() refreshPatientReferralGrid = new EventEmitter();
    selectedReferringFromProvOtherDetails: AffilateDetails;
    editReferral: any;
    addOrEditReferral: string;
    selectedProviderAffiliateName: string;
    selectedReferringFrom: string
    referringDoctorName: string;
    referringAddress: string;
    providerTypes: number[] = [1];
    processing: boolean = false;
    title: string;
    isProviderValid: boolean;
    isReferringToProviderValid: boolean = true;
    isPlanValid: boolean;
    isReferralCategoryValid: boolean;
    isReferringFromValid: boolean;
    isSourceNameValid: boolean;
    isNewSourceNameValid: boolean;
    isOldPatientNameValid: boolean;
    isFirstNameValid: boolean;
    isLastNameValid: boolean;
    isEmailEntered: boolean = false;
    isPhoneEntered: boolean = false;
    isEmailValid: boolean;
    isPhoneValid: boolean;
    nextAppointment: Date;
    allLoc: any[] = [];
    currentPatientId: number;
    showAddReferralSource: boolean = false;
    allProvidersList: any[] = [];
    constructor(@Optional() public dialog: DialogRef,
        private fb: FormBuilder,
        @Inject('$routeParams') public routeParams,
        @Inject('practiceService') private practiceService,
        @Inject('locationService') private locationService,
        @Inject('PatientServices') private patientServices,
        @Inject('toastrFactory') private toastrFactory,
        private patientCommunicationCenterService: PatientCommunicationCenterService,
        private translate: TranslateService,
        private patientHttpService: PatientHttpService,
        private patientReferralPrintService: PatientReferralPrintService,
        private referralManagementHttpService: ReferralManagementHttpService,
        @Inject('ReferralSourcesService') private referralSourcesService,
        @Inject('referenceDataService') private referenceDataService
    ) {
        super(dialog);
        this.getReferralSources();

        this.providerSearchPlaceholder = 'Search for a provider';
        this.patientSearchPlaceholder = 'Search Patient';
        this.disablePatientSearch = false;
        this.allLoc = this.locationService.getActiveLocations();
        this.allProvidersList = this.referenceDataService.get(
            this.referenceDataService.entityNames.users
          );
        this.addDynamicColumnsToProviders(this.allProvidersList);
    }

    addDynamicColumnsToProviders(providersList: any[]) {
        if (providersList) {
          providersList.forEach(provider => {
            provider.Name =
              provider.FirstName +
              ' ' +
              provider.LastName +
              (provider.ProfessionalDesignation
                ? ', ' + provider.ProfessionalDesignation
                : '');
            provider.FullName = provider.FirstName + ' ' + provider.LastName;
            provider.ProviderId =
              provider.ProviderId > '' ? provider.ProviderId : provider.UserId;
          });
        }
      }

    ngOnInit(): void {
        if (this.dialog && this.dialog?.content?.instance?.IsFromClinicals == true && this.dialog?.content?.instance?.AddOrEditReferral != 'editReferral') {
            this.fromClinicalsPage = true;
        }
        
        this.currentPatientId = this.fromAddPatientProfile ? null : (this.dialog.content.instance?.PatientProfile ? this.dialog.content.instance?.PatientProfile.PatientId : this.routeParams.patientId);
        this.getAppointments();
        this.addOrEditReferral = this.fromAddPatientProfile ? "addReferral" : this.dialog.content?.instance?.AddOrEditReferral;
        if (this.addOrEditReferral == 'editReferral')
            this.title = 'Edit Referral';
        else this.title = 'Create Referral';
        if (this.addOrEditReferral == 'editReferral')
            this.editReferral = this.dialog.content?.instance?.EditReferral;
        if (this.editReferral) {
            this.referralDirectionId = this.editReferral.referralDirectionId;
            if (this.referralDirectionId == 1) {
                this.referralCategoryId = this.editReferral.referralCategoryId;
                if (this.referralCategoryId == 1)
                    this.referringProviderId = this.editReferral.referringProviderId;
                else if (this.referralCategoryId == 3)
                    this.sourceNameId = this.editReferral.sourceNameId.toLowerCase();
            }
            else if (this.referralDirectionId == 2) {
                this.planId = this.editReferral.planId;
                this.selectedProvider = this.editReferral.selectedProvider;
                this.referringToProviderId = this.editReferral.referringToProviderId;
            }
        }
        else {
            if (this.fromClinicalsPage) {
                this.referralDirectionId = 2;
            } else {
                this.referralDirectionId = 1;
            }
            
            this.referralCategoryId = 0;
            this.showRefCategories = true;
            this.showProviders = false;
            this.showReferringTo = false;
            this.selectedPatientName = '';
            this.showPatientForm = false;
            this.showTxPlan = false;
            this.selectedProvider = this.fromAddPatientProfile ? "" : (this.fromClinicalsPage ? null : this.dialog.content.instance?.PatientProfile?.PreferredDentist);
            this.referringToProviderId = null;
            this.getTreatmentPlans();
        }
        this.initiateFormBuilder();
        if (this.editReferral) {
            if (this.referralDirectionId == 1) {
                if (this.referralCategoryId == 2) {
                    if (this.editReferral.isPatientExternal) {
                        this.showPatientForm = true;
                        this.f.firstName.setValue(this.editReferral.patientFirstName);
                        this.f.lastName.setValue(this.editReferral.patientLastName);
                        this.f.email.setValue(this.editReferral.patientEmailAddress);
                        this.f.phone.setValue(this.editReferral.patientPhone);
                        if (this.editReferral.patientEmailAddress != "" && this.editReferral.patientEmailAddress != null && this.editReferral.patientEmailAddress != undefined) {
                            this.isEmailEntered = true;
                            if (this.f.email?.value?.errors)
                                this.isEmailValid = false;
                            else this.isEmailValid = true;
                        }
                        if (this.editReferral.patientPhone != "" && this.editReferral.patientPhone != null && this.editReferral.patientPhone != undefined) {
                            this.isPhoneEntered = true;
                            var numericPhoneNumber = this.f.phone?.value?.replace(/\D/g, '');
                            if (numericPhoneNumber.length != 10)
                                this.isPhoneValid = false;
                            else this.isPhoneValid = true;
                        }
                    }
                }
                else if (this.referralCategoryId == 3)
                    this.f.campaignName.setValue(this.editReferral.campaignName);
            }
            else if (this.referralDirectionId == 2) {
                this.onChangePrintTxPlan('', true);
            }
            this.f.notes.setValue(this.editReferral.notes);
            this.f.returnDate.setValue(this.editReferral.returnDate);
            this.f.actualReturnDate.setValue(this.editReferral.actualReturnDate);
        }
        this.getPatientInformation();
        this.getReferralDirections();
        this.getPatientList(true);
        this.getRefferingProviders();
        this.getReferralCategories();
        this.locationId = this.fromAddPatientProfile ? null : this.dialog.content.instance?.PatientProfile?.PreferredLocation;
        this.practiceId = this.practiceService.getCurrentPractice().id;

        if (this.fromAddPatientProfile) {
            this.referralDirectionId = 1;
            this.onChangeReferralDirection('', true);
        }
        if (this.fromClinicalsPage) {
            this.referralDirectionId = 2;
            this.onChangeReferralDirection('', false);
        }
    }

    getReferralSources = () => {
        this.referralManagementHttpService.getSources().then((res) => {
            this.sourceNames = res;
        });
    }

    initiateFormBuilder() {

        this.addReferral = this.fb.group({

            referralDirection: [this.referralDirectionId, Validators.required],
            referralCategory: [this.referralCategoryId],
            provider: [this.selectedProvider, Validators.required],
            txPlan: [this.planId],
            chkPrintTxPlan: [],
            notes: [],
            referringTo: [this.referringToProviderId, Validators.required],
            referringFrom: [this.referringProviderId],
            firstName: [],
            lastName: [],
            email: [, [Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$')]],
            phone: [, [Validators.minLength(10)]],
            sourceName: [this.sourceNameId],
            referralSource: [this.sourceNameId === '00000000-0000-0000-0000-000000000000' ? null : '', Validators.required],
            campaignName: [],
            patient: [],
            returnDate: [],
            actualReturnDate: []
        });
    }

    cancelReferral = () => {
        this.dialog.close();
    }

    addReferralSource = (referralSource, refObj: any, isPrintReferral: boolean) => {
        this.referralSourcesService.save({'SourceName': referralSource})
        .$promise.then((res) => {
            this.createReferralSourceSuccess(res.Value, refObj, isPrintReferral)
        }, (error) => {
            this.createReferralSourceError(error);
        });
    }
    
    createReferralSourceSuccess = (referralSource: ReferralSource, refObj: any, isPrintReferral: boolean) => {
        refObj.sourceName = referralSource.PatientReferralSourceId;
        this.sourceNameId = referralSource.PatientReferralSourceId;
        this.sourceNames.push({ value: referralSource.PatientReferralSourceId, text: referralSource.SourceName });
        this.saveReferralRecord(refObj, isPrintReferral);
    }
    
    createReferralSourceError = (error) => {
        error.data.InvalidProperties.forEach((v, k) => {
            if (v.PropertyName === "SourceName") {
            this.toastrFactory.error('Referral Source cannot be longer than 64 characters.', 'Save Error');
            }
            else {
                this.toastrFactory.error(v.ValidationMessage + '.', 'Save Error');
            }
        });
        if (this.processing)
            this.processing = false;
    }

    saveReferralRecord(refObj: any, isPrintReferral: boolean, fromAddPatient: boolean = false) {
        this.referralManagementHttpService
                .saveReferral(refObj, this.addOrEditReferral)
                .then((res) => {
                    if (!fromAddPatient){
                        if (isPrintReferral) {
                            this.printReferral();
                        }
                        if (this.addOrEditReferral == 'addReferral')
                            this.dialog.close('1');
                        else this.dialog.close('2');
                        if (this.processing)
                            this.processing = false;
                    }                    
                }, () => {
                    if (this.processing)
                        this.processing = false;
                    this.onFailure();
                });
    }

    saveReferralFromAddPatient = (patientId, locationId) => {
        this.locationId = locationId;
        this.saveReferral(false, true, patientId);
    }

    saveReferral(isPrintReferral: boolean, fromAddPatient: boolean = false, patientId: string = '') {
        if (!isPrintReferral) this.processing = true;
        if (this.isValid()) {
            var refObj = this.createReferralObject(fromAddPatient, patientId);

            if (refObj.sourceName == '00000000-0000-0000-0000-000000000000') {
                this.addReferralSource(this.addReferral.controls.referralSource.value, refObj, isPrintReferral);
            } else {
                this.saveReferralRecord(refObj, isPrintReferral, fromAddPatient);
            }
        }
        else {
            this.showValidations();
        }
    }

    showValidations = () => {
        if (this.processing)
            this.processing = false;
        if (this.referralDirectionId == 1) {
            if (this.referralCategoryId == 0) {
                this.f.referralCategory.markAsDirty();
                this.isReferralCategoryValid = false;
            }
            else if (this.referralCategoryId == 1) {
                this.isReferringFromValid = false;
                this.f.referringFrom.markAsDirty();
            }
            else if (this.referralCategoryId == 2) {
                if (this.showPatientListForm || (!this.showPatientListForm && !this.showPatientForm)) {
                    this.f.patient.markAsDirty();
                    this.isOldPatientNameValid = false;
                }
                else if (this.showPatientForm) {
                    if (this.f.firstName.value == null
                        || this.f.firstName.value == undefined
                        || this.f.firstName.value == '') {
                        this.isFirstNameValid = false;
                        this.f.firstName.markAsDirty();
                    }
                    if (this.isEmailEntered) {
                        if (this.f.email.errors) {
                            this.f.email.markAsDirty();
                            this.isEmailValid = false;
                        }
                    }
                    if (this.f.lastName.value == null
                        || this.f.lastName.value == undefined
                        || this.f.lastName.value == '') {
                        this.isLastNameValid = false;
                        this.f.lastName.markAsDirty();
                    }
                    if (this.isPhoneEntered) {
                        var numericPhoneNumber = this.f.phone?.value?.replace(/\D/g, '');
                        if (numericPhoneNumber.length != 10) {
                            this.f.phone.markAsDirty();
                            this.isPhoneValid = false;
                        }
                    }

                }
            }
            else if (this.referralCategoryId == 3) {
                if (!this.showAddReferralSource) {
                    this.f.sourceName.markAsDirty();
                    this.isSourceNameValid = false;
                }
                if (this.showAddReferralSource) {
                    this.f.referralSource.markAsDirty();
                    this.isNewSourceNameValid = false;
                }
            }
        }
        else {
            if (this.referringToProviderId == null || this.referringToProviderId == undefined) {
                this.isReferringToProviderValid = false;
                this.f.referringTo.markAsDirty();
            }
            if (this.selectedProvider == null || this.selectedProvider == undefined) {
                this.isProviderValid = false;
                this.f.provider.markAsDirty();
            }
        }
    }

    getAddress = (address) => {
        if (!address) return '';

        const { address1, address2, city, state, zipCode, email, phone } = address;
        return [address1, address2, city, state, zipCode, email, phone].filter(part => part);

    }

    printReferral = () => {
        var addressParts = this.getProviderDetailsAddress(this.referringProviderId);
        var printPatientReferral: PrintPatientReferral = {
            name: this.profileDetails['patientName'],
            dob: this.formatDate(this.profileDetails['dateOfBirth']),
            age: this.calculateAge(this.profileDetails['dateOfBirth']),
            phone: this.formatPhoneNumber(this.profileDetails['phone']),
            workPhone: this.formatPhoneNumber(this.profileDetails['workphone']),
            email: this.profileDetails['email'],
            gender: this.profileDetails['gender'],
            responsibleParty: this.profileDetails['responsibleParty'],
            height: this.profileDetails['height'],
            weight: this.profileDetails['weight'],
            alerts: this.profileDetails['alerts'],
            signatureOnFile: this.profileDetails['signatureOnFile'],
            statusPatient: this.profileDetails['status'],
            notes: this.addReferral.controls.notes.value,
            referringOfficeAddress1: addressParts[0],
            practiceName: JSON.parse(sessionStorage.getItem('userPractice'))?.name,
            referringOfficeName: this.getRefferingOfficeName(),
            referringDoctorName: this.getReferringDoctorName(),
            treatmentPlan: (this.plans == null || !this.addReferral.controls.chkPrintTxPlan.value || !this.planId) ? '' : this.plans.find(e => e.value == this.planId).text,
            services: (this.plans == null || this.referralDirectionId == 1) ? [] : this.plans.find(e => e.value == this.planId)?.availableServices,
            reportType: this.referralDirectionId == 1 ? 'Referral In' : 'Referral Out',
            referralSource: this.sourceNames.find(e => e.value == this.sourceNameId)?.text,
            campaignName: this.referralDirectionId == 1 && this.referralCategoryId == 3 ? this.addReferral.controls.campaignName.value : '',
            referralCategory: this.referralCategoryId,
            referringOfficeAddress2: addressParts[1],
            referringPatientEmail: this.getReferringPatientEmail(),
            nextAppointment: this.nextAppointment != null ? this.formatDate(this.nextAppointment) : '-',
            returnDate: this.addReferral.controls.returnDate.value != null ? this.formatDate(this.addReferral.controls.returnDate.value) : '-',
            actualReturnDate: this.addReferral.controls.actualReturnDate.value != null ? this.formatDate(this.addReferral.controls.actualReturnDate.value) : '-',
            referringEmail: addressParts.length > 2 ? addressParts[2] : "",
            referringPhone: addressParts.length > 3 ? addressParts[3] : ""
            
        };
        this.patientReferralPrintService.downloadPatientReferral(printPatientReferral);
    }

    getReferringPatientEmail = () => {
        if (this.addReferral.controls.email?.value != null && this.addReferral.controls.email?.value != undefined) {
            return `${this.addReferral.controls.email?.value || ''}`;
        }
        else if (this.selectedPatientFromNewPatient?.email != null && this.selectedPatientFromNewPatient?.email != undefined) {
            return this.selectedPatientFromNewPatient.email;
        }
        return '';
    }

    getProviderDetailsAddress = (providerId: string) => {
        const {
            referralDirectionId,
            referralCategoryId,
            providerList,
            referringToProviderId,
            referringProviderId,
            selectedPatientFromNewPatient,
        } = this;

        if (referralDirectionId == 2) {
            var referringToProviderName = this.providerList.find(e => e["value"] == referringToProviderId);
            var address =
            {
                address1 : `${referringToProviderName?.address1} ${referringToProviderName?.address2}`,
                address2 : `${referringToProviderName?.city},${referringToProviderName?.state} ${referringToProviderName?.zipCode}`,
                email: referringToProviderName?.emailAddress,
                phone: this.formatPhoneNumber(referringToProviderName?.phone)
            };
            if (address.address2 == ", ")
                address.address2 = "";
            return this.getAddress(address) || [];
        }

        if (referralDirectionId == 1) {
            if (this.referralCategoryId == 1) {
                var referringFromName = this.providerList.find(e => e.value == this.referringProviderId);
                var address =
                {
                    address1 : `${referringFromName?.address1} ${referringFromName?.address2}`,
                    address2 : `${referringFromName?.city},${referringFromName?.state} ${referringFromName?.zipCode}`,
                    email: referringFromName?.emailAddress,
                    phone: this.formatPhoneNumber(referringFromName?.phone)
                };
                if (address.address2 == ", ")
                    address.address2 = "";
                return this.getAddress(address) || [];
            }
            else if (this.referralDirectionId == 1 && this.referralCategoryId == 2) {
                if (this.selectedPatientFromNewPatient?.fullName != undefined) {
                    if (!this.selectedPatientFromNewPatient.address) return '';
                    var addressParts = [this.selectedPatientFromNewPatient?.address, this.selectedPatientFromNewPatient?.address1].filter(part => part);
                    return addressParts;
                }
            }
        }
        return [];
    }


    getReferringDoctorName = () => {
        if (this.editReferral) {
            if (this.referralDirectionId == 2) {
                return this.getSelectedProviderText();
            }
            else if (this.referralDirectionId == 1 && this.referralCategoryId == 1) {
                const referringFromName = this.providerList.find(e => e.value == this.referringProviderId);
                let practiceName = this.selectedReferringFromProvOtherDetails?.practiceName;
                practiceName = practiceName + ((practiceName && (referringFromName?.firstName || referringFromName?.lastName)) ? ' - ' : '');
                return `${practiceName}${referringFromName?.firstName} ${referringFromName?.lastName}`;
            }
            else if (this.referralDirectionId == 1 && this.referralCategoryId == 2) {
                if (this.selectedPatientFromNewPatient?.fullName != undefined)
                    return this.selectedPatientFromNewPatient?.fullName;
                else return `${this.addReferral.controls.firstName.value} ${this.addReferral.controls.lastName.value}`;

            }
        }
        else if (this.referralDirectionId == 2 && this.selectedProvider) {
            return this.getSelectedProviderText();
        }
        else if (this.referralDirectionId == 1 && this.referralCategoryId == 2) {
            if (this.addReferral.controls.lastName.value && this.addReferral.controls.firstName.value) {
                return `${this.addReferral.controls.firstName.value} ${this.addReferral.controls.lastName.value}`;
            }
            return this.selectedPatientFromNewPatient.fullName;
        }
        else if (this.referralDirectionId == 1 && this.referralCategoryId == 1 && this.referringProviderId) {
            return this.providerList.find(x => x.providerAffiliateId == this.referringProviderId).text;
        }
        else {
            return this.referringDoctorName;
        }
    }


    getRefferingOfficeName = (): string | undefined => {
        const {
            referralDirectionId,
            referralCategoryId,
            providerList,
            referringToProviderId,
            selectedReferringFromProvOtherDetails,
            sourceNames,
            sourceNameId
        } = this;
        if (referralDirectionId == 2) {
            const provider = providerList.find(e => e.value === referringToProviderId);
            return provider?.text;
        }
        if (referralDirectionId == 1) {
            return JSON.parse(sessionStorage.getItem('userPractice'))?.name;
        }
        return '';
    }


    calculateAge(dateOfBirth: Date): string {
        if (dateOfBirth) {
            return moment().diff(dateOfBirth, 'years').toString();
        }
        return '--';
    }

    formatDate(date: Date): string {
        if (date) {
            return moment(date).format('MM/DD/YYYY');
        }
        return '--';
    }

    parseDate = (date): Date | null => {
        const momentInputDate = moment(date);        
        if (momentInputDate.isValid()) {
            return momentInputDate.utc(true).toDate();
        }    
        return null;
    };

    formatPhoneNumber(phoneNumber: string): string {
        if (phoneNumber) {
            return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        return '--';
    }

    onFailure = () => {
        this.toastrFactory.error(
            this.translate.instant('There was an error and referral was not created.'),
            this.translate.instant('Server Error'));
    }

    get f() {
        return this.addReferral.controls;
    }

    getPatientInformation = () => {

        if (this.dialog && this.dialog.content?.instance) {
            var patientProfile = this.dialog.content.instance.PatientProfile;
            var patientName = '';
            var patientInitials = '';
            if (patientProfile.PatientId) {
                if (patientProfile.Suffix) {
                    patientName += ` ${patientProfile.Suffix as string},`;
                }
                if (patientProfile.FirstName) {
                    patientName += !patientProfile.Suffix ? `${patientProfile.FirstName as string}` : `${patientProfile.FirstName as string}`
                }
                if (patientProfile.MiddleName) {
                    patientName += ` ${patientProfile.MiddleName as string}`;
                }

                if (patientProfile.LastName) {
                    patientName += ` ${patientProfile.LastName as string}`;
                }

                patientInitials = `${patientProfile.FirstName[0].toUpperCase() as string}${patientProfile.LastName[0].toUpperCase() as string}`;
            }
            this.profileDetails = {
                patientName: patientName,
                patientInitials: patientInitials,
                dateOfBirth: patientProfile.DateOfBirth,
                height: patientProfile?.HeightFeet + "'" + patientProfile?.HeightInches,
                gender: patientProfile.Sex == 'M' ? 'Male' : (patientProfile.Sex == 'F' ? 'Female' : ''),
                signatureOnFile: patientProfile.SignatureOnFile == false ? 'No' : 'Yes',
                responsibleParty: patientProfile.ResponsiblePersonName,
                status: patientProfile.IsActive == 0 ? 'Inactive' : 'Active',
                weight: patientProfile.Weight,
                imageUrl: patientProfile.imageUrl,
                hasImage: patientProfile.hasImage,
                alerts: patientProfile.alerts,
                phone: patientProfile.phone,
                email: patientProfile.email,
                workphone: patientProfile.workphone,
                isMobile: patientProfile.isMobile
            };
        }
    }

    getReferralDirections = () => {

        this.referralDirections.push({
            text: "Referral In", value: 1,
        });
        this.referralDirections.push({
            text: "Referral Out", value: 2,
        });
        if (this.editReferral) {
            this.onChangeReferralDirection('', true);
        }

    }

    getReferralCategories = () => {

        this.referralCategories.push({
            text: "", value: 0
        });
        this.referralCategories.push({
            text: "External Provider", value: 1,
        });
        this.referralCategories.push({
            text: "Patient", value: 2,
        });
        this.referralCategories.push({
            text: "External Sources", value: 3,
        });
        if (this.editReferral) {
            this.onChangeReferralCategory('', true);
        }
    }

    getRefferingProviders = () => {
        this.referralManagementHttpService.getPracticeProviders()
            .subscribe({
                next: (data: ResponseItem[]) => {
                    this.providerList = data.map(item => {
                        const practiceName = item.practice?.name;
                        const firstName = item.provider.firstName;
                        const lastName = item.provider.lastName;
                    
                        const text = [
                            practiceName,
                            (practiceName && (lastName || firstName)) ? ' - ' : '',
                            firstName,
                            (lastName && firstName) ? ' ' : '',
                            lastName
                        ].filter(Boolean).join('').trim();
                    
                        return {
                            ...item.provider,
                            text,
                            value: item.provider.providerAffiliateId,
                            type: 'Provider',
                            affiliateDetails: {
                                practiceName,
                                address1: `${item.provider?.address1} ${item.provider?.address2}`.trim(),
                                address2: `${item.provider?.city}, ${item.provider?.state} ${item.provider?.zipCode}`.trim(),
                                phone: item.provider?.phone,
                                email: item.provider?.emailAddress
                            }
                        };
                    });
                    this.providerListBase = this.providerList;
                    if (this.editReferral?.referralDirectionId == 1 && this.editReferral?.referralCategoryId == 1) {
                        this.onChangeReferringProvider('', true);
                    }
                    if (this.editReferral?.referralDirectionId == 2) {
                        var affiliate = this.providerList.find(x => x.providerAffiliateId == this.editReferral.referringToProviderId);
                        this.selectedProviderAffiliateName = affiliate.text;
                    }
                },
                error: (error) => {
                    this.toastrFactory.error('Failed to load providers. Refresh the page to try again.', 'Server Error');
                }
            });
            
    }

    getPatientCommunicationInfo() {
        this.patientCommunicationCenterService.getPatientInfoByPatientId(this.editReferral.referringPatientId)
            .subscribe((data: any) => {
                if (data) {
                    this.selectedPatientName = data.FirstName + ' ' + data.LastName;
                    var event = { type: 'Patient' };
                    this.onSearchItemClick(event, true);
                    this.selectedPatientFromNewPatient = new Patient();
                    this.selectedPatientFromNewPatient.patientId = this.editReferral.referringPatientId;
                    this.selectedPatientFromNewPatient.fullName = data.FirstName + ' ' + data.LastName;
                    this.selectedPatientFromNewPatient.phone = data.PhoneNumbers?.find(x => x.IsPrimary)?.PhoneNumber;
                    this.selectedPatientFromNewPatient.email = data.Emails?.find(x => x.IsPrimary)?.Email;
                    this.selectedPatientFromNewPatient.address = `${data.AddressLine1 || ''} ${data.AddressLine2 || ''}`;
                    this.selectedPatientFromNewPatient.address1 = `${data.City || ''}, ${data.State || ''} ${data.ZipCode || ''}`;
                    if (this.selectedPatientFromNewPatient.address1 == ",  ")
                        this.selectedPatientFromNewPatient.address1 = "";
                }
            });
    }

    getPatientList = (isOnload) => {
        if (this.editReferral && isOnload && this.editReferral?.referralDirectionId == 1
            && this.editReferral?.referralCategoryId == 2) {
            if (!this.editReferral?.isPatientExternal && this.editReferral.referringPatientId) {
                this.getPatientCommunicationInfo();
            }
        }
        this.searchInput$
            .pipe(
                debounceTime(300), // Adjust the debounce time to your preferred delay (e.g., 300 milliseconds)
                distinctUntilChanged(), // Ensure that only distinct values are processed
                switchMap(query => {
                    if (query.length >= 3) {
                        this.patientSearchParams = new PatientSearchParams();
                        this.patientSearchParams.searchFor = query;
                        return this.patientHttpService.patientSearchWithDetails(this.patientSearchParams);
                    } else {
                        return of(null); // If the input length is less than 3, return null
                    }
                })
            )
            .subscribe({
                next: (data: Patient) => {
                    if (data) {
                        this.patientList = data.Value.map(patientData => new Patient(patientData));

                    } else {
                        this.patientList = []; // Clear the patient list if input length is less than 3
                    }
                },
                error: (error) => {
                    this.toastrFactory.error('Failed to load patients. Refresh the page to try again.', 'Server Error');
                }
            });
    }

    onChangeReferralDirection = ($event, isOnLoad) => {
        this.resetValidation();
        if (!isOnLoad) {
            this.referralDirectionId = !this.fromClinicalsPage ? $event.target.value : 2;
            this.fromClinicalsPage = false;
        }
        this.showReferringFrom = false;
        this.selectedReferringFromProvOtherDetails = { practiceName: '', email: '', phone: '', address1: '', address2: '' };
        if (this.referralDirectionId == 1) {
            this.showRefCategories = true;
            this.f.referralCategory.setValidators([Validators.min(1)]);
            this.f.provider.clearValidators();
            this.f.referringTo.clearValidators();
            this.showProviders = false;
            this.showReferringTo = false;
            this.showTxPlan = false;
            if (!isOnLoad) {
                this.selectedProvider = null;
                this.referringToProviderId = null;
                this.selectedProviderAffiliateName = '';
                this.f.referringTo.patchValue(this.referringToProviderId);
                this.planId = null;
                this.txPlanServicesList = [];
                this.f.txPlan.patchValue(this.planId);
                this.f.chkPrintTxPlan.patchValue(false);
                this.referralCategoryId = 0;
                this.f.referralCategory.patchValue(this.referralCategoryId);

            }
        }
        else if (this.referralDirectionId == 2) {
            this.showRefCategories = false;
            if (!isOnLoad) {
                this.referralCategoryId = 0;
                this.f.referralCategory.patchValue(this.referralCategoryId);
            }
            this.f.referralCategory.clearValidators();
            this.f.provider.setValidators([Validators.required]);
            this.f.referringTo.setValidators([Validators.required]);
            this.showProviders = true;
            this.showReferringTo = true;
            this.showPatientForm = false;
            this.showOtherForm = false;
            this.showTxPlan = true;
            this.getTreatmentPlans();
            this.showPracticeInformation = false;
            this.showPatientListForm = false;
            this.showPatientSearch = false;
        }

    }

    getTreatmentPlans() {
        var serviceStatusId;
        if (this.plans.length == 0) {
            this.patientServices.TreatmentPlans.getTreatmentPlansWithServicesByPersonId(
                {
                    Id: this.currentPatientId,
                }
            ).$promise.then(res => {
                if (res.Value) {
                    this.setAllTxPlans(res.Value);
                    res.Value.forEach(item => {
                        serviceStatusId = item.TreatmentPlanServices.find(service => service.ServiceTransaction.ServiceTransactionStatusId == 2);
                        if (serviceStatusId != null)
                            this.plans.push({
                                value: item.TreatmentPlanHeader.TreatmentPlanId,
                                text: item.TreatmentPlanHeader.TreatmentPlanName,
                                availableServices: item.TreatmentPlanServices.filter(service => service.ServiceTransaction.ServiceTransactionStatusId == 2).map(service => service.ServiceTransaction.Description),
                                availableServicesList: item.TreatmentPlanServices.filter(service => service.ServiceTransaction.ServiceTransactionStatusId == 2).map(service => ({
                                    Description: service.ServiceTransaction.Description,
                                    Tooth: service.ServiceTransaction.Tooth,
                                    Area: service.ServiceTransaction.RootSummaryInfo,
                                    Location: this.allLoc.length > 0 ? this.allLoc.find(x => x.id == service.ServiceTransaction.LocationId).name : ''
                                }))
                            });
                    });
                    if (this.planId != null) {
                        this.txPlanServicesList = this.plans.find(e => e.value == this.planId)?.availableServicesList;
                    }
                }
            });
        }
    }

    setAllTxPlans(res){
        res.forEach(item => {
            const services = item.TreatmentPlanServices;
            const referred = services?.filter(service => service.ServiceTransaction.ServiceTransactionStatusId === 2).length;
            const referredCompleted = services?.filter(service => service.ServiceTransaction.ServiceTransactionStatusId === 8).length;
            const allReferredComplete = (referred === 0 && referredCompleted > 0);

            this.allTxPlans.push({
                value: item.TreatmentPlanHeader.TreatmentPlanId,
                text: item.TreatmentPlanHeader.TreatmentPlanName,
                availableServices: item.TreatmentPlanServices.map(service => service.ServiceTransaction.Description),
                availableServicesList: item.TreatmentPlanServices.map(service => ({
                    Description: service.ServiceTransaction.Description,
                    Tooth: service.ServiceTransaction.Tooth,
                    Area: service.ServiceTransaction.RootSummaryInfo,
                    Location: this.allLoc.length > 0 ? this.allLoc.find(x => x.id == service.ServiceTransaction.LocationId).name : ''
                })),
                allReferredComplete: allReferredComplete
            });
        });
        if (this.planId != null) {
            this.selectedTxPlan = this.allTxPlans.find(e => e.value == this.planId);
        }
    }

    createReferralObject(fromAddPatient: boolean = false, patientId: string = '') {
        var patientProfile = fromAddPatient == true ? {} : this.dialog.content.instance.PatientProfile;
        var currentUser = JSON.parse(localStorage.getItem('fuseUser'));
        return {
            campaignName: this.addReferral.controls.campaignName.value,
            email: this.addReferral.controls.email.value,
            firstName: this.addReferral.controls.firstName.value,
            isPrintTreatmentPlan: this.addReferral.controls.chkPrintTxPlan.value ?? false,
            lastName: this.addReferral.controls.lastName.value,
            notes: this.addReferral.controls.notes.value,
            patientId: fromAddPatient == true ? patientId : patientProfile.PatientId,
            phone: this.addReferral.controls.phone.value,
            practiceId: this.practiceId,
            practiceName: '',
            referralCategoryId: this.referralCategoryId,
            referralDirectionTypeId: this.referralDirectionId,
            referringPatientId: this.selectedPatientFromNewPatient?.patientId || null,
            referringProviderId: this.referralDirectionId == 1 ? this.referringProviderId : this.selectedProvider,
            referringToProviderId: this.referralDirectionId == 2 ? this.referringToProviderId : null,
            sourceName: this.sourceNameId?.toString(),
            treatmentPlanId: this.planId,
            userId: currentUser?.UserId || null,
            locationId: this.locationId,
            referralId: this.addOrEditReferral == 'editReferral' ? this.editReferral?.referralId : null,
            status: true,
            returnDate: this.parseDate(this.addReferral.controls.returnDate.value),
            actualReturnDate: this.parseDate(this.addReferral.controls.actualReturnDate.value),
            PreferredLocationId: this.locationId
        };
    }

    onChangePrintTxPlan(event, isOnLoad) {
        if (this.editReferral && isOnLoad) {
            this.addReferral.controls.chkPrintTxPlan.patchValue(
                this.editReferral.isPrintTreatmentPlan
            );
        }
        else
            this.addReferral.controls.chkPrintTxPlan.patchValue(
                event.target.checked
            );
    }

    filterPatients(query: string) {
        this.selectedPatientFromNewPatient = null;
        this.searchInput$.next(query);
    }

    filterProviders(item: string) {
        this.referringToProviderId = null;
        this.filteredProviderList = this.providerListBase.filter(x => x.text.toLowerCase().includes(item.toLowerCase()) || x.affiliateDetails?.practiceName.toLowerCase().includes(item.toLowerCase()));
        this.f.referringTo.setErrors(null);
    }

    cancelSelection() {
        this.selectedPatientName = null;
    }

    resetForm() {

        this.addReferral.controls.campaignName.setValue(null);
        this.addReferral.controls.email.setValue(null);
        this.planId = null;
        this.txPlanServicesList = [];
        this.sourceNameId = null;
        this.referringProviderId = null;
        this.selectedProvider = null;
        this.selectedPatientFromNewPatient = null;
        this.selectedPatientName = null;
        this.referringToProviderId = null;
        this.addReferral.controls.chkPrintTxPlan.patchValue(false);
        this.addReferral.controls.returnDate.setValue(null);
        this.addReferral.controls.actualReturnDate.setValue(null);
    }

    resetValidation() {
        this.isOldPatientNameValid = true;
        this.isPlanValid = true;
        this.isProviderValid = true;
        this.isReferralCategoryValid = true;
        this.isReferringFromValid = true;
        this.isReferringToProviderValid = true;
        this.isSourceNameValid = true;
        this.isNewSourceNameValid = true;
    }

    onChangeReferralCategory($event, isOnLoad) {
        this.isReferralCategoryValid = true;
        if (!isOnLoad) {
            this.referralCategoryId = parseInt($event.target.value);
            this.f.referralCategory.patchValue(this.referralCategoryId);
            this.referringProviderId = null;
            this.f.referringFrom.patchValue(this.referringProviderId);
        }

        switch (this.referralCategoryId) {
            case 0:
                this.f.referralCategory.setValidators([Validators.min(1)]); this.showReferringFrom = false; this.showPracticeInformation = false; this.showPatientSearch = false; this.showOtherForm = false; this.showPatientListForm = false;
                this.resetForm();
                break;
            case 1:
                this.showReferringFrom = true; this.showPatientForm = false; this.showPatientListForm = false; this.showPatientSearch = false; this.showOtherForm = false; this.f.sourceName.clearValidators(); this.f.referralCategory.setErrors(null); this.f.referringFrom.setValidators([Validators.required]); this.f.firstName.clearValidators(); this.f.lastName.clearValidators(); this.f.patient.clearValidators();
                break;
            case 2:
                this.showPatientSearch = true; if (!this.editReferral?.isPatientExternal && !isOnLoad) this.showPatientForm = false; this.showOtherForm = false; this.showPatientListForm = false; this.showReferringFrom = false; this.f.sourceName.clearValidators(); this.f.referralCategory.setErrors(null); this.f.referringFrom.clearValidators(); this.f.firstName.setValidators([Validators.required]); this.f.lastName.setValidators([Validators.required]); this.f.patient.setValidators([Validators.required]); this.showPracticeInformation = false;
                break;
            case 3:
                this.showOtherForm = true; this.showPatientSearch = false; this.showPatientForm = false; this.showPatientListForm = false; this.showReferringFrom = false; this.f.sourceName.setValidators([Validators.required]); this.f.referralCategory.setErrors(null); this.f.referringFrom.clearValidators(); this.f.firstName.clearValidators(); this.f.lastName.clearValidators(); this.f.patient.clearValidators(); this.showPracticeInformation = false;
                break;

        }
    }

    onChangeSourceName($event) {
        this.isSourceNameValid = true;
        this.isNewSourceNameValid = true;
        this.sourceNameId = $event.target.value;
        if (this.sourceNameId > 0 || this.sourceNameId != null) {
            this.f.sourceName.setErrors(null);
        }
        if (this.sourceNameId == '00000000-0000-0000-0000-000000000000'){
            this.showAddReferralSource = true;
        } else {
            this.showAddReferralSource = false;
        }
    }

    onChangeTxPlan($event) {
        this.planId = $event.target.value;
        this.txPlanServicesList = this.plans.find(e => e.value == this.planId)?.availableServicesList;
        this.selectedTxPlan = this.allTxPlans.find(e => e.value == this.planId);
    }

    onChangeReferringProvider($event, isOnLoad) {
        this.isReferringFromValid = true;
        if (!isOnLoad){            
            this.selectedReferringFrom = $event;
        } else {
            this.selectedReferringFrom = this.providerList?.find(e => e.value == this.referringProviderId)?.text;
        }
            
        this.f.referringFrom.setErrors(null);
        this.showPracticeInformation = true;
        this.setAffiliateDetails();
    }

    setAffiliateDetails() {
        let affiliateDetails = null;
        if (this.selectedReferringFrom){
            let _provider = this.providerList?.find(e => e.text == this.selectedReferringFrom);
            affiliateDetails = _provider?.affiliateDetails;
            this.referringProviderId = _provider?.value;
        }
            
        if (affiliateDetails){
            this.selectedReferringFromProvOtherDetails =
            {
                practiceName: affiliateDetails?.practiceName,
                address1: affiliateDetails?.address1,
                address2: affiliateDetails?.address2 == ", " ? affiliateDetails?.address2.substring(0, affiliateDetails?.address2.length - 2) : affiliateDetails?.address2,
                phone: affiliateDetails?.phone,
                email: affiliateDetails?.email,
            };
        } else {
            this.isReferringFromValid = false;
            this.f.referringFrom.markAsDirty();
            this.showPracticeInformation = false;
            this.selectedReferringFromProvOtherDetails = {
                practiceName: '',
                address1: '',
                address2: '',
                phone: '',
                email: ''
            };
        }
        
    }

    onProviderChange = (event: any) => {
        this.selectedProvider = event;
        this.f.provider.setErrors(null);
        this.isProviderValid = true;
    };

    onKeyUp = (event) => {
        this.remainingText = event.target?.value?.length;
        this.addReferral.patchValue({ notes: event.target.value });
    }

    isValidFromAddPatient(){
        if(this.f.referralCategory.value == 0){
            return "NoReferral";
        }
        var res = this.isValid();
        if (res == false){
            this.showValidations();
        }
        return res ? "Valid" : "Invalid";
    }

    isValid() {
        this.isFormValid = false;
        if (this.referralDirectionId == 2) {
            if (this.selectedProvider != undefined && this.selectedProvider != null)
                this.isFormValid = true;
            else return false;
            if (this.referringToProviderId != undefined && this.referringToProviderId != null)
                this.isFormValid = true;
            else return false;
        }
        else if (this.referralDirectionId == 1) {
            if (this.referralCategoryId == 1) {
                if (this.referringProviderId != undefined && this.referringProviderId != null)
                    this.isFormValid = true;
            }
            else if (this.referralCategoryId == 2) {
                if (this.showPatientForm) {
                    if ((this.f.firstName.value != null && this.f.firstName.value != '') && (this.f.lastName.value != null && this.f.lastName.value != '')) {
                        this.isFormValid = true;
                    }
                    var numericPhoneNumber = this.f.phone?.value?.replace(/\D/g, '');
                    if (this.isPhoneEntered && numericPhoneNumber.length != 10)
                        this.isFormValid = false;
                    if (this.isEmailEntered && this.f.email?.errors)
                        this.isFormValid = false;
                }
                else if (this.selectedPatientFromNewPatient?.patientId != null)
                    this.isFormValid = true;

            }
            else if (this.referralCategoryId == 3) {
                if (this.sourceNameId == '00000000-0000-0000-0000-000000000000' && (this.f.referralSource.value == null || this.f.referralSource.value == '')) {
                    this.isFormValid = false;
                }   
                else if (this.sourceNameId != 0 && this.sourceNameId != null) {
                    this.isFormValid = true;
                }
            }
            else if (this.referralCategoryId == 0) this.isFormValid = false;
            else this.isFormValid = true;

        }
        return this.isFormValid;

    }

    onProviderSelected = (event: any) => {
        this.referringToProviderId = event === '' ? null : this.referringToProviderId;
        if (this.referringToProviderId == null) {
            this.selectedProviderAffiliateName = '';
        };
    }

    onPatientSelected(event: any) {
        if (event === '') {
            this.selectedPatientFromNewPatient = null;
            this.showPatientListForm = false;
            this.f.patient.setErrors({ required: true });
        }
    }

    getSelectedProviderText() {
        return this.allProvidersList.find(provider => provider.UserId === this.selectedProvider).Name;
    }

    onSearchItemClick(event: any, isOnLoad) {
        if (event && event.type === 'Patient') {
            this.isOldPatientNameValid = true;
            if (!isOnLoad) {
                this.selectedPatientFromNewPatient = event;
            }
            this.showPatientListForm = true;
            this.showPatientForm = false;
            this.f.patient.setErrors(null);

        }
        else if (event && event.type === 'Provider') {
            if (!isOnLoad) {
                this.referringToProviderId = event.providerAffiliateId;
                this.isReferringToProviderValid = true;
            }
        }
        else if (event === 'addNewPatient') {
            this.showPatientForm = true;
            this.showPatientListForm = false;
        }
    }

    OnFirstNameChange($event) {
        this.isFirstNameValid = true;
    }

    OnLastNameChange($event) {
        this.isLastNameValid = true;
    }
    OnEmailChange($event) {
        this.isEmailValid = true;
        var email = $event.target.value;
        if (email != null && email != undefined && email != '')
            this.isEmailEntered = true;
        else this.isEmailEntered = false;
    }

    OnPhoneChange($event) {
        this.isPhoneValid = true;
        var phone = $event.target.value;
        if (phone != null && phone != undefined && phone != '')
            this.isPhoneEntered = true;
        else this.isPhoneEntered = false;
    }

    getAppointments = () => {
        if (!this.fromAddPatientProfile){
            this.patientHttpService
            .getAppointmentsByPatientId(
              this.currentPatientId,
              false
            )
            .subscribe(
              (data: any) => this.getAppointmentsByPatientIdSuccess(data),
              error => this.getAppointmentsByPatientIdFailure()
            );
        }
    };

    getAppointmentsByPatientIdSuccess = (res: any) => {
        if (res.length) {
            const date = new Date();
            const nextAppointments = res.filter(
              (x: any) => new Date(x.StartTime) >= date
            );
            if (nextAppointments.length && nextAppointments[0].StartTime) {
              this.nextAppointment = nextAppointments[0].StartTime;
            }
        }
      };
      getAppointmentsByPatientIdFailure = () => {
        this.toastrFactory.error(
          this.translate.instant('Failed to retrieve the appointments.'),
          this.translate.instant('Server Error')
        );
      };

      providerFilterChanged($event){
        this.providerList = this.providerListBase.filter(x => x.text.toLowerCase().includes($event.toLowerCase()) || x.affiliateDetails?.practiceName.toLowerCase().includes($event.toLowerCase()));
      }
}
