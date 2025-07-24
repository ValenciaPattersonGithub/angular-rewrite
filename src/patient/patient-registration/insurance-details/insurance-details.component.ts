import { Component, OnInit, Inject, ViewEncapsulation, Input } from '@angular/core';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { InsurancePriority } from 'src/patient/common/models/enums/insurance-priority.enum';
import { RegistrationCustomEvent } from 'src/patient/common/models/registration-custom-event.model';
import { RegistrationEvent } from 'src/patient/common/models/enums';
import { ResponsiblePersonTypeEnum } from 'src/@shared/models/responsible-person-type-enum';
import { Insurance } from '../../common/models/insurance.model';
import { BroadcastService } from 'src/@shared/providers/broad-cast.service';
import { AddPatientBenefitPlansModalService } from 'src/patient/patient-benefit-plan/add-patient-benefit-plans-modal.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'insurance-details',
    templateUrl: './insurance-details.component.html',
    styleUrls: ['./insurance-details.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InsuranceDetailsComponent implements OnInit {

    benefitPlans: any;
    planNameSelected: any;
    template = 'kendoAutoCompleteBenefitPlanTemplate';
    minDate: Date;
    @Input() insuranceDetails: FormGroup;
    filteredAccountMembers: Array<{ text: string, value: any }> = [];
    isSelf: boolean;
    priorityList: Array<{ text: string, value: number }> = [
        { text: this.translate.instant('Primary'), value: InsurancePriority.Primary },
        { text: this.translate.instant('Secondary'), value: InsurancePriority.Secondary },
        { text: this.translate.instant('3rd Supplemental'), value: InsurancePriority.ThirdSupplemental },
        { text: this.translate.instant('4th Supplemental'), value: InsurancePriority.FourthSupplemental },
        { text: this.translate.instant('5th Supplemental'), value: InsurancePriority.FifthSupplemental },
        { text: this.translate.instant('6th Supplemental'), value: InsurancePriority.SixthSupplemental }
    ];
    availablePriorities: Array<{ text: string, value: number }> = [];
    policies: any;
    policyHolders: any;
    policyHolderSelectedValue: any;
    filteredPolicyHolder: any;
    insurance: Insurance;
    index: any;
    isPolicyHolderId: any;
    relationships: Array<{ text: string, value: string }> = [
        { text: this.translate.instant('Dependent'), value: this.translate.instant('Dependent') },
        { text: this.translate.instant('Spouse'), value: this.translate.instant('Spouse') },
        { text: this.translate.instant('Other'), value: this.translate.instant('Other') }
    ];
    selectedPersonDetail: any;
    maxPolicies: any = 5;
    selectedBenefitPlan: any;
    unsavedSelectedBenefitPlans: any[] = [];
    filteredBenefitPlans: any;    
    modalSubscription: Subscription;
    
    constructor(
        private registrationService: PatientRegistrationService,
        @Inject('toastrFactory') private toastrFactory,
        private translate: TranslateService,
        private fb: FormBuilder,
        @Inject('PatientValidationFactory') private patientValidationFactory,
        @Inject('PatientServices') private patientServices,
        @Inject('ModalFactory') private modalFactory,
        @Inject('tabLauncher') private tabLauncher,
        private broadCastService: BroadcastService,
        private addPatientBenefitPlansModalService: AddPatientBenefitPlansModalService,
        ) { }

    ngOnInit(): void {
        
        this.initializeInsurance();
        this.initializeUnsavedBenefitPlans(this.priorityList[0].value);
        this.minDate = new Date();
        this.handlePersonRegristerationEvents();
        this.getBenefitPlans();
        if (this.insuranceDetails) {
            this.policies = this.insuranceDetails.controls.Policies as FormArray;
        }
        this.availablePriorities.push(this.priorityList[0]);
        this.setPolicyHolders(null, this.isSelf);
        this.broadCastService.messagesOfType('benefitPlan').subscribe(message => {
            this.getBenefitPlans();
        });
    }
    
    initializeInsurance = () => {
        this.insurance = {
            BenefitPlanId: null,
            DependentChildOnly: false,
            PatientId: null,
            PolicyHolderId: null,
            PolicyHolderStringId: null,
            Priority: InsurancePriority.Primary,
            RelationshipToPolicyHolder: null,
            RequiredIdentification: null,
            MemberId: null
        };
    }
    initializeUnsavedBenefitPlans = (priority: any) => {
        const unsavedBenefitPlans: any = {
            BenefitPlanId: null,
            DependentChildOnly: false,
            PatientId: null,
            PolicyHolderId: null,
            PolicyHolderStringId: null,
            Priority: priority,
            RelationshipToPolicyHolder: null,
            MemberId: null
        };
        this.unsavedSelectedBenefitPlans.push(unsavedBenefitPlans);
    }
    handlePersonRegristerationEvents = () => {
        this.registrationService.getRegistrationEvent().pipe().subscribe(
            (event: RegistrationCustomEvent) => {
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
    }
    handleSelectedResponsiblePerson = (event: RegistrationCustomEvent) => {
        if (event.data) {
            if (event.data.PersonAccount) {
                const accountId = event.data.PersonAccount.AccountId;
                this.registrationService.getAvailablePolicyHolders(accountId)
                    .subscribe((data: any) => this.getAvailablePolicyHoldersOnSuccess(data),
                        error => this.getAvailablePolicyHoldersOnFail());
            }
        } else {
            this.filteredAccountMembers = [];
            this.policies = this.insuranceDetails.controls.Policies as FormArray;
            const item = this.policies.at(this.index);
            if (item) {
                item.showRelationships = false;
                item.showPlans = false;
                item.showPolicyHolderSearch = false;
                item.showPlanName = false;
                item.showChangeText = false;
                item.showIfPlanSelected = false;
                item.showPersonSearch = false;
            }
        }
    }
    handleCheckedResponsiblePerson = (event: RegistrationCustomEvent) => {
        if (Number(event.data) === ResponsiblePersonTypeEnum.self) {
            this.filteredAccountMembers = [];
        }
    }
    getAvailablePolicyHoldersOnSuccess = (res) => {
        if (res) {
            this.policyHolders = res;
            this.setPolicyHolders(res, this.isSelf);
        }
    }
    getAvailablePolicyHoldersOnFail = () => {
        this.toastrFactory.error(
            this.translate.instant('Failed to load account members for responsible person'),
            this.translate.instant('Server Error'));
    }
    setPolicyHolders = (policyHolders: any, responsiblePersonType: boolean) => {
        if (policyHolders) {
            policyHolders.forEach((accountMember: any) => {
                if (accountMember.PolicyHolder.length > 0 && accountMember.Person.PatientId !== '1') {
                    this.filteredAccountMembers.push({
                        text: accountMember.Person.FirstName + ' ' + accountMember.Person.LastName, value: accountMember.Person.PatientId
                    });
                }
            });
        }
    }

    getBenefitPlans = () => {
        this.registrationService.getPatientBenefitPlans()
            .subscribe((data: any) => this.getPatientBenefitPlansOnSuccess(data),
                error => this.getPatientBenefitPlansOnFail());
    }
    getPatientBenefitPlansOnSuccess = (res) => {
        if (res && res.Value) {
            if (res.Value.length) {
                this.benefitPlans = res.Value.map((o: any) => ({
                    Name: o.Name,
                    CarrierName: o.CarrierName,
                    PlanGroupNumber: o.PlanGroupNumber,
                    AddressLine1: o.AddressLine1,
                    AddressLine2: o.AddressLine2,
                    City: o.City,
                    State: o.State,
                    ZipCode: o.ZipCode,
                    BenefitId: o.BenefitId
                }));
                this.filteredBenefitPlans = [...this.benefitPlans];
            }
        }
    }
    getPatientBenefitPlansOnFail = () => {
        this.toastrFactory.error(
            this.translate.instant('Failed to retrieve benefit plans.'),
            this.translate.instant('Server Error'));
    }
    selectPlan = (selectedValue: any, insurancePolicy: any) => {
        if (selectedValue) {
            this.benefitPlans.forEach((benefitplan: any) => {
                if (benefitplan.BenefitId === selectedValue) {
                    this.selectedBenefitPlan = benefitplan;
                    insurancePolicy.showPlanName = true;
                    insurancePolicy.showIfPlanSelected = true;
                    insurancePolicy.showChangeText = true;
                    insurancePolicy.selectPlan = false;

                }
            });
        } else {
            insurancePolicy.showIfPlanSelected = false;
        }
        insurancePolicy.patchValue({
            PlanName: this.selectedBenefitPlan.Name,
            BenefitPlanId: this.selectedBenefitPlan.BenefitId
        });
    }
    onChangePlan = (insurancePolicy: any) => {
        this.selectedBenefitPlan = null;
        insurancePolicy.showPlanName = false;
        insurancePolicy.showIfPlanSelected = false;
    }
    onPolicyHolderSelected = (event: any, insurancePolicy: any, rowId: any) => {        
        this.index = rowId;
        if (!event.target.value) {
            this.showFields(insurancePolicy, 'default', 'policyHolder');
            insurancePolicy.patchValue({
                PolicyHolderStringId: '',
                BenefitPlanId: '',
                PlanName: '',
                PolicyHolderId: '',
                MemberId: ''
            });
        } else if (event.target.value === '1') {
            this.showFields(insurancePolicy, 'self', 'policyHolder');
            // once a policy holder is selected, filter available plans
            this.filterBenefitPlans();
        } else if (event.target.value === '2') {
            this.showFields(insurancePolicy, 'other', 'policyHolder');            
        } else {
            this.policyHolderSelectedValue = event.target.value;
            this.isPolicyHolderId = true;
            const policyHolder = this.policyHolders.filter(x => x.Person.PatientId === event.target.value);
            this.patientValidationFactory.PatientSearchValidation(policyHolder[0].Person).then(this.patientSearchValidationSuccess);
        }
    }
    patientSearchValidationSuccess = (res) => {
        if (!res.authorization.UserIsAuthorizedToAtLeastOnePatientLocation) {
            this.patientValidationFactory.LaunchPatientLocationErrorModal(res);
            return;
        } else {
            this.continuePolicyHolder(this.policyHolderSelectedValue);
        }
    }
    continuePolicyHolder = (patientId: any) => {
        if (patientId && patientId !== '1' && patientId !== '2' && patientId !== '0') {
            const patient = this.policyHolders.filter(x => x.Person.PatientId === patientId);
            this.filteredPolicyHolder = patient[0].Person;
            if (!patient) { return; }
            if (this.registrationService.selectedResponsiblePerson.PersonAccount) {
                const selectedPerson = this.registrationService.selectedResponsiblePerson.PersonAccount.PersonAccountMember ?
                    this.registrationService.selectedResponsiblePerson.PersonAccount.PersonAccountMember : '';
                if (patientId && patientId != -1 && patientId == selectedPerson.ResponsiblePersonId) {
                    this.insurance.PolicyHolderId = patientId;
                }
            }
            if (this.filteredPolicyHolder) {
                this.getBenefitPlansForPolicyHolder(this.filteredPolicyHolder);
            }
        }
    }
    getBenefitPlansForPolicyHolder = (patient) => {
        if (patient) {
            this.unsavedSelectedBenefitPlans.forEach((benefitPlan: any) => {
                if ((benefitPlan && !benefitPlan.PolicyHolderId)) {
                    benefitPlan.PolicyHolderId = patient.PatientId;
                }
            });
            this.filteredPolicyHolder = patient;
            this.patientServices.PatientBenefitPlan.
                get({ patientId: patient.PatientId }, this.getPatientBenefitPlanSuccess, this.getPatientBenefitPlanFailure);
        }
    }
    getPatientBenefitPlanSuccess = (res) => {
        if (res) {
            const patientBenefitPlans = res.Value
                .filter(x => x.PolicyHolderBenefitPlanDto.PolicyHolderId === this.filteredPolicyHolder.PatientId);
            // this.unsavedSelectedBenefitPlans[0].PolicyHolderId = patientBenefitPlans[0].PolicyHolderId;
            const allowedPlans = 6 - res.Value.length;
            if (patientBenefitPlans.length > 0) {

                this.filteredPolicyHolder.PatientBenefitPlanDtos = patientBenefitPlans;
                /** retrieve insurance plan */
                this.modalFactory.Modal({
                    templateUrl: 'App/Patient/components/insurance-selector-modal/insurance-selector-modal.html',
                    backdrop: 'static',
                    keyboard: false,
                    size: 'md',
                    windowClass: 'center-modal insuranceSelectorModal__modal',
                    controller: 'InsuranceSelectorModalController',
                    amfa: 'soar-acct-insinf-view',
                    resolve: {
                        patient: () => {
                            return this.filteredPolicyHolder;
                        },
                        insurance: () => {
                            return this.insurance;
                        },
                        unsavedBenefitPlans: () => {
                            return this.unsavedSelectedBenefitPlans;
                        }
                    }
                }).result.then(this.planAdded);
            } else {
                /** if no plan, popup add insurance plan modal */
                this.openInsuranceModal(this.filteredPolicyHolder);                
            }
        }
    }

    ngOnDestroy() {
        // clean up modal subscription
        if (this.modalSubscription) {
            this.modalSubscription.unsubscribe();
        }
    }
    
    openInsuranceModal(patient) {
        if (patient) {
            // get patient account information for modal 
            this.registrationService.getPersonByPersonId(patient.PatientId).subscribe((person: any) => {
                let personInfo = person.Profile;

                let data = {
                    header: 'Header here',
                    confirm: 'Save',
                    cancel: 'Close',
                    size: 'md',
                    patient: personInfo,
                    nextAvailablePriority: 0 ,
                    plan: null,
                    allowedPlans: null,
                    editing: false,
                    selfonly: true
                };
                let modalDialog = this.addPatientBenefitPlansModalService.open({data});

                this.modalSubscription = modalDialog.events.subscribe((events) => {
                    if (events && events.type) {
                        switch (events.type) {
                            case 'confirm':
                                modalDialog.close();
                                // refresh the page
                                this.policyHolderInsuranceAdded(events.data);
                                break;
                            case 'close':
                                modalDialog.close();
                                break;
                        }
                    }
                });
            });
        }
    };    

    policyHolderInsuranceAdded = (insurance) => {
        this.policies = this.insuranceDetails.controls.Policies as FormArray;
        const item = this.policies.at(this.index);
        if (insurance.length === 1) {
            const policyHolderInsurance = insurance[0];
            if (policyHolderInsurance.PolicyHolderBenefitPlanDto.BenefitPlanDto) {
                const selectedPlan = policyHolderInsurance.PolicyHolderBenefitPlanDto.BenefitPlanDto;
                this.insurance.BenefitPlanId = selectedPlan.BenefitId;
                this.insurance.PolicyHolderStringId = policyHolderInsurance.PolicyHolderStringId;
                if (selectedPlan) {
                    if (!this.policies.invalid) {
                        this.selectedBenefitPlan = selectedPlan;
                        this.showFields(item, null, 'planAdded');
                        this.policies.controls[this.index].patchValue(
                            {
                                PolicyHolderStringId: policyHolderInsurance.PolicyHolderStringId,
                                BenefitPlanId: selectedPlan.BenefitId,
                                PlanName: selectedPlan.Name,
                                PolicyHolderId: policyHolderInsurance.PolicyHolderId
                            }
                        );
                    }
                }
            }
        } else {
            this.showFields(item, null, 'newPlanAdded');
        }
    }
    getPatientBenefitPlanFailure = () => {
        this.toastrFactory.error(
            this.translate.instant('Failed to retrieve the patient Benefit Plan.'),
            this.translate.instant('Server Error'));
    }
    planAdded = (plan) => {
        this.insurance.BenefitPlanId = plan.BenefitId;
        this.insurance.PolicyHolderStringId = plan.PolicyHolderStringId;
        if (plan) {
            this.policies = this.insuranceDetails.controls.Policies as FormArray;
            const item = this.policies.at(this.index);
            this.selectedBenefitPlan = plan;
            this.showFields(item, null, 'planAdded');
            this.policies.controls[this.index].patchValue(
                {
                    PolicyHolderStringId: plan.PolicyHolderStringId,
                    BenefitPlanId: plan.BenefitId,
                    PlanName: plan.Name,
                    PolicyHolderId: this.filteredPolicyHolder.PatientId
                }
            );
            this.unsavedSelectedBenefitPlans.forEach((benefitPlan: any) => {
                if (!benefitPlan.BenefitPlanId) {
                    benefitPlan.BenefitPlanId = plan.BenefitId;
                }
                if (!benefitPlan.PolicyHolderStringId) {
                    benefitPlan.PolicyHolderStringId = plan.PolicyHolderStringId;
                }
                if (benefitPlan.PolicyHolderId) {
                    benefitPlan.planTaken = true;
                }
            });
        }
    }
    showFields = (item: any, policyHolder: any, type: any) => {
        if (type === 'planAdded' && !policyHolder) {
            item.showRelationships = true;
            item.showPlans = true;
            item.showPolicyHolderSearch = false;
            item.showPlanName = true;
            item.showChangeText = false;
            item.showIfPlanSelected = true;
            item.selectPlan = false;
        }
        if (type === 'newPlanAdded' && !policyHolder) {
            item.showRelationships = true;
            item.showPlans = true;
            item.showPolicyHolderSearch = false;
            item.showPlanName = true;
            item.showChangeText = false;
            item.showIfPlanSelected = true;
            item.selectPlan = true;
        }
        if (type === 'policyHolder') {
            if (policyHolder === 'default') {
                this.selectedBenefitPlan = null;
                item.showPlanName = false;
                item.showPlans = false;
                item.showIfPlanSelected = false;
                item.showPolicyHolderSearch = false;
                item.showRelationships = false;
                this.isPolicyHolderId = null;
                item.showPersonSearch = false;
            } else if (policyHolder === 'self') {
                item.showPlans = true;
                item.showPolicyHolderSearch = false;
                item.showRelationships = false;
                this.isPolicyHolderId = null;
                item.showPersonSearch = false;

            } else if (policyHolder === 'other') {
                item.showPolicyHolderSearch = true;
                item.showRelationships = false;
                this.isPolicyHolderId = true;
                item.showPersonSearch = true;

            }
        }
    }
    addPolicy = () => {
        this.policies = this.insuranceDetails.controls.Policies as FormArray;
        if (!this.policies.invalid) {
            this.policies.push(this.newPolicy(this.policies.length));
            this.setPriorityList();
        }
        this.initializeUnsavedBenefitPlans(this.policies.length);
    }
    newPolicy = (policiesLength: any) => {
        return this.fb.group({
            PolicyHolderId: [''],
            PolicyHolderType: [''],
            PlanName: [''],
            PersonName: [''],
            EffectiveDate: [new Date()],
            Priority: [policiesLength],
            RelationshipToPolicyHolder: [''],
            validPolicy: [true],
            PolicyHolderStringId: [''],
            DependentChildOnly: [false],
            BenefitPlanId: [''],
            MemberId: ['']
        });
    }
    deletePolicy = (index: any, insurancePolicy: any) => {
        const policies = this.insuranceDetails.controls.Policies as FormArray;
        if (policies.length > 1) {
            if (index !== policies.length - 1) {
                for (let i = index; i < policies.length - 1; i++) {
                    policies.controls[i].patchValue(
                        {
                            PolicyHolderType: policies.value[i + 1].PolicyHolderType,
                            PolicyHolderId: policies.value[i + 1].PolicyHolderID,
                            EffectiveDate: policies.value[i + 1].EffectiveDate,
                            Priority: policies.value[i + 1].Priority - 1,
                        }
                    );
                }
            }

            policies.removeAt(index);
            this.availablePriorities.pop();
            if (insurancePolicy.value.PolicyHolderId && insurancePolicy.value.PolicyHolderId !== '1'
                && insurancePolicy.value.PolicyHolderId !== '2') {
                insurancePolicy.showRelationships = false;
                insurancePolicy.showChangeText = true;
                insurancePolicy.selectPlan = false;
            } else if (!insurancePolicy.value.PolicyHolderId) {
                insurancePolicy.showPersonSearch = false;
            }  
            // if patient plan is deleted, refilter the available plans list         
            this.filterBenefitPlans();
        } else {
            this.selectedBenefitPlan = null;
            insurancePolicy.showPlanName = false;
            insurancePolicy.showIfPlanSelected = false;
            insurancePolicy.showPlans = false;
            insurancePolicy.showPersonSearch = false;
            insurancePolicy.showRelationships = false;
            this.unsavedSelectedBenefitPlans.forEach((benefitPlan: any) => {
                benefitPlan.BenefitPlanId = '';
                benefitPlan.PolicyHolderStringId = '';
                benefitPlan.planTaken = false;
                benefitPlan.MemberId = '';
            });
            insurancePolicy.patchValue({
                PolicyHolderStringId: '',
                PolicyHolderType: '',
                BenefitPlanId: '',
                PlanName: '',
                PolicyHolderId: '',
                RelationshipToPolicyHolder: '',
                MemberId: ''
            });

        }

    }
    setPriorityList = () => {
        const count = this.policies.length;
        if (this.availablePriorities.length <= 5) {
            this.availablePriorities.push(this.priorityList[count - 1]);
        }        
    }
    onSelectedValueChanged = (selectedValue: any) => {
        if (selectedValue) {
            this.selectedPersonDetail = selectedValue;
            if (selectedValue.PersonAccount) {
                const accountId = selectedValue.PersonAccount.AccountId;
                this.registrationService.getAvailablePolicyHolders(accountId)
                    .subscribe((data: any) => this.getAvailablePolicyHoldersForSelectedPersonOnSuccess(data),
                        error => this.getAvailablePolicyHoldersForSelectedPersonOnFail());
            }
        } else {
            this.policies = this.insuranceDetails.controls.Policies as FormArray;
            const item = this.policies.at(this.index);
            if (item) {

                item.showRelationships = false;
                item.showPlans = false;
                item.showPolicyHolderSearch = false;
                item.showPlanName = false;
                item.showChangeText = false;
                item.showIfPlanSelected = false;
                item.patchValue({
                    PolicyHolderStringId: '',
                    BenefitPlanId: '',
                    PlanName: '',
                    PolicyHolderId: '',
                    RelationshipToPolicyHolder: '',
                    MemberId: ''
                });
            }
        }
    }
    getAvailablePolicyHoldersForSelectedPersonOnSuccess = (res) => {
        if (res) {
            res.forEach((policyHolder: any) => {
                if (policyHolder.PolicyHolder.length > 0 && policyHolder.Person.PatientId == this.selectedPersonDetail.PatientId) {
                    this.getBenefitPlansForPolicyHolder(this.selectedPersonDetail);
                }
            });
        }
    }
    getAvailablePolicyHoldersForSelectedPersonOnFail = () => {
        this.toastrFactory.error(
            this.translate.instant('Failed to load policy holders for selected person'),
            this.translate.instant('Server Error'));
    }
    openBenefitPlanTab = (benefitId) => {
        this.tabLauncher.launchNewTab('#/BusinessCenter/Insurance/Plans/Edit/?guid=' + benefitId);
    }
    onRelationShipSelected = (event: any, policy: any) => {
        policy.patchValue({
            validPolicy: !!event.target.value
        });
    }
    
    // remove plans from the list of available plans when policy holder and plan are already in patients plan list
    // note, this is only done when policy holder is Self  or when plan is deleted
    filterBenefitPlans() {        
        this.filteredBenefitPlans = this.benefitPlans.filter(x => !this.policies.value.map(m => m.PolicyHolderId === '' && m.BenefitPlanId).includes(x.BenefitId));         
    };
}
