import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { SoarPatientBenefitPlanHttpService } from 'src/@core/http-services/soar-patient-benefit-plan-http.service';
import { PatientBenefitPlanDto } from 'src/@core/models/patient-benefit-plan-dtos.model';
import { BestPracticePatientNamePipe } from 'src/@shared/pipes/best-practice/best-practice-patient-name.pipe';
import { AddBenefitPlanModalRef } from '../add-benefit-plan-modal-ref';
import { ADD_BENEFIT_PLAN_MODAL_DATA, AddBenefitPlanModalData } from '../add-benefit-plan-modal.data';
import * as cloneDeep from 'lodash/cloneDeep';
import { BenefitPlanForAddInsuranceDto } from 'src/patient/common/models/benefit-plan-for-add-insurance-dto.model';

@Component({
    selector: 'add-patient-benefit-plans-modal',
    templateUrl: './add-patient-benefit-plans-modal.component.html',
    styleUrls: ['./add-patient-benefit-plans-modal.component.scss']
})
export class AddPatientBenefitPlansModalComponent implements OnInit {
    patient: any = null;
    nextAvailablePriority: number = 0;
    plansAllowed: number = 0;
    backupPatientBenefitPlan: any = null;
    newPatientBenefitPlans: PatientBenefitPlanDto[] = [];
    newPolicyHolderBenefitPlan: PatientBenefitPlanDto;
    currentPatientBenefitPlans: PatientBenefitPlanDto[] = [];
    header: string = this.translate.instant('Add an Insurance Policy for ');
    patientName: string = null;
    validPolicyHolder: boolean = false;
    hasErrors: boolean = false;
    modalSize: string = 'md';
    policyHolders: any[] = [];
    policyHolderList: any[] = [];
    relationships: any[] = [];
    activeBenefitPlans: BenefitPlanForAddInsuranceDto[] = [];
    filteredBenefitPlans: BenefitPlanForAddInsuranceDto[] = [];
    maxDate = moment().add(100, 'years').startOf('day').toDate();
    saving: boolean = false;
    validateForms: boolean = false;
    onSaveCreateNew: boolean = false;
    confirmOnClose: boolean = false;

    policyHolder: any = null;
    constructor(
        public dialogRef: AddBenefitPlanModalRef,
        private translate: TranslateService,
        @Inject(ADD_BENEFIT_PLAN_MODAL_DATA) public data: AddBenefitPlanModalData,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('patSecurityService') private patSecurityService: any,
        private patientBenefitPlanService: SoarPatientBenefitPlanHttpService,
        private bestPracticePatientNamePipe: BestPracticePatientNamePipe,
        private cd: ChangeDetectorRef,
    ) { }

    
    ngOnInit(): void {        
        if (!this.patSecurityService.IsAuthorizedByAbbreviation('soar-ins-ibcomp-add')) {
            this.toastrFactory.error(this.patSecurityService.generateMessage('soar-ins-ibcomp-add'), 'Not Authorized');
            this.closeModal();
        }
        this.modalSize = this.data.size;
        this.patient = this.data.patient;
        this.nextAvailablePriority = this.data.nextAvailablePriority;
        this.patientName = this.bestPracticePatientNamePipe.transform(this.patient);
        this.header += this.patientName;
        this.plansAllowed = this.data.allowedPlans;
        this.getAvailablePolicyHolders(this.patient);
        this.getBenefitPlans();
        this.addPolicy();        
    }

    getBenefitPlans() {
        this.getCurrentPlans();       
        this.patientBenefitPlanService.requestBenefitPlansForAddInsurance().subscribe(benefitPlans => {           
            this.activeBenefitPlans = benefitPlans.Value;
            this.filteredBenefitPlans = this.filterActiveBenefitPlans();            
            if (!this.cd['destroyed']) {
                this.cd.detectChanges();
            }
        }, (err) => {
            this.toastrFactory.error(this.translate.instant('Failed to get active benefit plans. '), 
            this.translate.instant('Server Error'));
        });    
    }

    getCurrentPlans() {        
        this.patientBenefitPlanService.requestPatientBenefitPlans({patientId: this.patient.PatientId}).subscribe(benefitPlans => {
            this.currentPatientBenefitPlans = benefitPlans.Value;
            if (this.currentPatientBenefitPlans.length > 0){
                this.currentPatientBenefitPlans.sort((a, b) => (a.Priority < b.Priority ? -1 : 1));
            }
            this.plansAllowed = 6 - this.currentPatientBenefitPlans.length ;
            // need this in case modal closed before detection cycle  
            if (!this.cd['destroyed']) {
                this.cd.detectChanges();
            }                  
        }, (err) => {
            this.toastrFactory.error(this.translate.instant('Failed to get patient benefit plans. '), 
            this.translate.instant('Server Error'));
        });        
    }

    // set filter benefit plans to active plans and sort
    filterActiveBenefitPlans() {        
        let filteredBenefitPlans = cloneDeep(this.activeBenefitPlans);
        return filteredBenefitPlans.sort((a, b) => (a?.Name < b?.Name ? -1 : 1));;        
    }

    addPolicy () {               
        let patientBenefitPlan: PatientBenefitPlanDto = {
            PatientBenefitPlanId: null,
            PolicyHolderId: null,
            PatientId: this.patient.PatientId,
            BenefitPlanId: null,  
            PolicyHolderBenefitPlanId: null,
            PolicyHolderStringId: null,
            RelationshipToPolicyHolder: null,            
            DependentChildOnly: false,
            EffectiveDate: new Date(),
            IndividualDeductibleUsed: 0,
            IndividualMaxUsed: 0,
            Priority: this.nextAvailablePriority,
            EligibleEPSDTTitleXIX: false,
            ObjectState: 'Add',
            FailedMessage: null,
            IsDeleted: false,
            AdditionalBenefits: 0.00,
            MemberId: null
        }        
        this.newPatientBenefitPlans.push(patientBenefitPlan)       
    }

    addPolicyHolderPolicy(eventData: { policyHolderId: string, priority: number }) {              
        this.newPolicyHolderBenefitPlan = {
            PatientBenefitPlanId: null,
            PolicyHolderId: eventData.policyHolderId,
            PatientId: eventData.policyHolderId,
            BenefitPlanId: null,  
            PolicyHolderBenefitPlanId: null,
            PolicyHolderStringId: null,
            RelationshipToPolicyHolder: null,            
            DependentChildOnly: false,
            EffectiveDate: new Date(),
            IndividualDeductibleUsed: 0,
            IndividualMaxUsed: 0,
            Priority: eventData.priority,
            EligibleEPSDTTitleXIX: false,
            ObjectState: 'Add',
            FailedMessage: null,
            IsDeleted: false,
            AdditionalBenefits: 0.00,
            MemberId: null
        }        
    }

    addAdditionalPolicy() {
        this.policyHolderList=[];        
        this.confirmOnClose = true;
        this.onSaveCreateNew = false;
        this.newPatientBenefitPlans = [];
        this.nextAvailablePriority += 1;
        this.getAvailablePolicyHolders(this.patient);
        this.getBenefitPlans();
        this.addPolicy(); 
    }

    removePolicyHolderPolicy() {
        this.newPolicyHolderBenefitPlan = undefined;
    }

    cancel($event) {
        // if changes use discard modal?
        // if onSaveCreateNew, confirm or close this modal
        if (this.confirmOnClose === true){
            // notify parent that plans have been added            
            this.confirmModal();
        } else {
            this.closeModal();
        }
    }    
    
    closeModal() {        
        this.dialogRef.events.next({
            type: 'close',                
        });        
    }

    public confirmModal() {
        this.dialogRef.events.next({
            data: this.currentPatientBenefitPlans,
            type: 'confirm',            
        });
    }

    //#endregion

    //#region Validate / Persist patientBenefitPlans

    validateForm() {        
        // notify child controls to validate forms
        this.validateForms=true;
        if (!this.cd['destroyed']) {
            this.cd.detectChanges();
        }
    }

    notifyValidState(hasErrors) {
        this.hasErrors = hasErrors;
        this.validateForms = false;   
    }

    // modal events
    async save($event) {
        // need this in case modal closed before detection cycle         
        if (!this.cd['destroyed']) {
            this.cd.detectChanges();
        }      
        this.validateForm();
        if (this.hasErrors === false) { 
            this.saving = true;
            if (this.newPolicyHolderBenefitPlan){
                this.createPolicyHolderBenefitPlans()
            } else {
                this.createPatientBenefitPlans();  
            }       
        } 
    }

    saveAndAddPolicy($event) {
        this.onSaveCreateNew = true;
        this.save($event);
    }

    // creates one or multiple plans
    createPatientBenefitPlans() { 
        this.patientBenefitPlanService.createPatientBenefitPlans({patientId: this.patient.PatientId}, this.newPatientBenefitPlans).subscribe(benefitPlans => {
            this.toastrFactory.success(this.translate.instant("Insurance saved successfully."),
            this.translate.instant('Success'));
            // add to current plans and filter from list of available to add
            benefitPlans.Value.forEach(x => {
                this.currentPatientBenefitPlans.push(x);
            }) 
            this.filterActiveBenefitPlans();           
            if (this.onSaveCreateNew === true){
                this.addAdditionalPolicy();
            } else {
                this.confirmModal();
            }
            this.saving = false;
            
        }, (err) => {
            this.saving = false;            
            if (this.confirmFailedValidation(err)) {
               // suppress toastr
            } else {
                this.toastrFactory.error(this.translate.instant('Failed to create patient benefit plans.'), 
                this.translate.instant('Server Error'));
            }
        });
    }
    
    createPolicyHolderBenefitPlans() {
        this.patientBenefitPlanService.createPatientBenefitPlans({patientId: this.newPolicyHolderBenefitPlan.PatientId}, [this.newPolicyHolderBenefitPlan]).subscribe(benefitPlans => {
            let policyHolderBenefitPlan = benefitPlans.Value;
            this.createPatientBenefitPlans();
        }, (err) => {            
            this.saving = false;            
            if (this.confirmFailedValidation(err)) {
                // suppress toastr
            } else {
                this.toastrFactory.error(this.translate.instant('Failed to create policy holder benefit plans.'), 
                this.translate.instant('Server Error'));
            }
        });
    }
    
    // capture specific ValidationMessages and display modal with localized message
    confirmFailedValidation = function(err) {
        if (err.data && err.data.InvalidProperties.length) {
            var validationMessage = err.data.InvalidProperties[0].ValidationMessage;
            if (err && err.status === 400 && validationMessage === 'Same benefit plan cannot be repeated with same policyholder'){
                this.toastrFactory.error(this.translate.instant('Another user has made changes, refresh the page to see the latest information.'), 
                this.translate.instant('Server Error'));
                return true;
            }
            if (err && err.status === 400 && validationMessage === 'Same priority cannot be set to more than one plan'){
                this.toastrFactory.error(this.translate.instant('Another user has made changes, refresh the page to see the latest information.'), 
                this.translate.instant('Server Error'));
                return true;
            }
        }        
        return false;    
    };


    //#endregion

    //#region PolicyHolders
    
    getAvailablePolicyHolders(patient) {
        this.patientBenefitPlanService.requestAvailablePolicyHolders({accountId: patient.PersonAccount.AccountId}).subscribe(policyHolders => {
            this.policyHolders = policyHolders.Value;
            this.setPolicyHolders(policyHolders.Value)
        }, (err) => {
            this.toastrFactory.error(this.translate.instant('Failed to get available policy holders. '), 
            this.translate.instant('Server Error'));
        });
    }

    setPolicyHolders(policyHolders) {
        this.policyHolderList = [];        
        this.policyHolderList.push({text: this.translate.instant('Self'), value: this.patient.PatientId});
        if (!this.data.selfonly) {
            policyHolders.forEach(policyHolder => {                
                if (policyHolder.PolicyHolder.length > 0 && policyHolder.Person.PatientId !== this.patient.PatientId){
                    let patientName = this.bestPracticePatientNamePipe.transform(policyHolder.Person);
                    this.policyHolderList.push({text: patientName, value: policyHolder.Person.PatientId});
                }            
            });
            this.policyHolderList.push({ text: this.translate.instant('Other...'), value: -1 });
        }
    };    

    //#endregion

    //#region supporting methods
    
    //#endregion

    ngOnDestroy() {        
        // todo
    }

}
