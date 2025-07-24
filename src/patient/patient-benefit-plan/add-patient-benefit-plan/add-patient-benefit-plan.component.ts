import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { SoarPatientBenefitPlanHttpService } from 'src/@core/http-services/soar-patient-benefit-plan-http.service';
import { PatientBenefitPlanDto } from 'src/@core/models/patient-benefit-plan-dtos.model';
import { BestPracticePatientNamePipe } from 'src/@shared/pipes/best-practice/best-practice-patient-name.pipe';
import { BenefitPlanDto } from 'src/patient/common/models/benefit-plan-dto.model';
import * as cloneDeep from 'lodash/cloneDeep';
import { BenefitPlanForAddInsuranceDto } from 'src/patient/common/models/benefit-plan-for-add-insurance-dto.model';

@Component({
    selector: 'add-patient-benefit-plan',
    templateUrl: './add-patient-benefit-plan.component.html',
    styleUrls: ['./add-patient-benefit-plan.component.scss']
})
export class AddPatientBenefitPlanComponent implements OnInit {
    @Input() patientBenefitPlan: PatientBenefitPlanDto;
    @Input() policyHolderBenefitPlan: PatientBenefitPlanDto;
    @Input() filteredBenefitPlans: BenefitPlanForAddInsuranceDto[] = [];
    @Input() activeBenefitPlans: BenefitPlanForAddInsuranceDto[] = [];
    @Input() currentPatientBenefitPlans:PatientBenefitPlanDto[] = [];
    @Input() policyHolders: any[] = [];
    @Input() policyHolderList: any[] = [];
    
    @Input() patient: any;
    @Output() removePolicyHolderPolicy:EventEmitter<any> = new EventEmitter<any>();
    @Output() addPolicyHolderPolicy:EventEmitter<{ policyHolderId: string, priority: number }> = new EventEmitter<{ policyHolderId: string, priority: number }>();
    @Output() notifyValidState: EventEmitter<boolean> = new EventEmitter<boolean>(); 
    private _checkValidation:boolean = false;
    @Input() 
    set checkValidation(value:boolean) {
        this._checkValidation = value;
        if (value === true) {
            this.validateForm();
        }
    }

    validPolicyHolder: boolean = false;
    policyHolder: any;
    relationships:any[] = [];
    maxDate = moment().add(100, 'years').startOf('day').toDate();
    showRelationshipToPolicyHolder: boolean = false;
    hasErrors:boolean = false;
    filteredPolicyHolder: any= null;
    modalSubscription: any=null;
    selfOnly: boolean=false;
    searchText: string='';
    autoActiveFirstOption: boolean = true;
    placeholderText: string = '';
    selectedPlan:BenefitPlanForAddInsuranceDto;
    selectedPerson: any = null;
    policyIsValid: boolean = false;
    planName: string='';    
    showPlanSearch:boolean = false;
    showPolicyHolderPlans:boolean = false;
    showPatientSearch:boolean = false;    
    responsiblePersonName: any;
    policyHolderPlans: PatientBenefitPlanDto[] = [];
    disablePolicyHolderStringId:boolean = false;
    disablePolicyHolderIdMessage:string = '';
    labelDirection: string='';
    showPolicyOptions:boolean = false;
    policyHolderOptions: any[] = [];
    showPolicyHolderMessage: boolean = false;
    addPolicyHolderPlanMessage: string = '';
    policyHolderName: string = '';
    validEffectiveDate: boolean = true;
    selectedPolicyHolderId: string = null;
       

    constructor(             
        private translate: TranslateService,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('PatientValidationFactory') private patientValidationFactory,
        @Inject('PatientServices') private patientServices,
        private patientBenefitPlanService: SoarPatientBenefitPlanHttpService,
        private cd: ChangeDetectorRef,
        private bestPracticePatientNamePipe: BestPracticePatientNamePipe,
        @Inject('tabLauncher') private tabLauncher
    ) { }

    ngOnInit(): void {
        this.searchText=this.translate.instant('Search for a Benefit Plan'); 
        this.buildRelationships();
        this.setPlanName(this.patientBenefitPlan.Priority);
        this.policyHolderOptions.push({option: 'None'}); 
        this.policyHolderOptions.push({option: 'Add'});    
    }

    setPlanName(priority) {        
        this.planName = priority === 0 ? 'Primary': priority === 1 ? 'Secondary' : priority === 2 ? '3rd': priority === 3 ? '4th' : priority === 4 ? '5th' : priority === 5 ? '6th': ''; 
    }

    validateForm() {             
        this.hasErrors = false;
        this.validEffectiveDate = true;
        this.cd.detectChanges();
        // all plans must contain the following
        if (!this.patientBenefitPlan.PolicyHolderId ||
            !this.patientBenefitPlan.BenefitPlanId ||
            !this.patientBenefitPlan.PatientId ) {
                this.hasErrors = true;
        }
        // if policy holder is self, RelationshipToPolicyholder should be null otherwise must contain a value
        if (this.patientBenefitPlan.PolicyHolderId === this.patient.PatientId) {
            if (this.patientBenefitPlan.RelationshipToPolicyHolder !== null) {
                this.hasErrors = true;
            } 
        } else if (this.patientBenefitPlan.RelationshipToPolicyHolder === null) {
            this.hasErrors = true;       
        }
        // validate that this plan doesn't duplicate existing plans
        if (this.searchForDuplicates(this.patientBenefitPlan)===true){            
            this.hasErrors = true;
        } 
        this.notifyValidState.emit(this.hasErrors)
        this._checkValidation = false;
    }
    searchForDuplicates = (insurance) => { 
        let duplicates = this.currentPatientBenefitPlans.filter(x =>  x.BenefitPlanId === insurance.BenefitPlanId && x.PolicyHolderId === insurance.PolicyHolderId );
        let isDuplicatePlan = (duplicates.length > 0) ? true : false;        
        return isDuplicatePlan;             
    }

    addPolicyHolderBenefitPlan(policyHolderId, priority) {
        this.addPolicyHolderPolicy.emit({ policyHolderId: policyHolderId, priority: priority })
    }

    removePolicyHolderBenefitPlan() {
        this.removePolicyHolderPolicy.emit()
    }

    //#region PolicyHolder

    // called when policy holder is other than 'self'
    getBenefitPlansForPolicyHolder(policyHolderId) {        
        if (policyHolderId) {
            this.policyHolderPlans = [];
            this.patientBenefitPlanService.requestPatientBenefitPlans({patientId: policyHolderId}).subscribe(res => {
                // calculate the priority of the new plan based on the max priority of the existing plans for this policy holder
                const maxPriority = res.Value.reduce((max, plan) => (plan.Priority > max) ? plan.Priority : max, -1);
                // only show plans where policy holder is 'self'
                let policyHolderPlans = res.Value.filter(plan => plan.PolicyHolderId === policyHolderId);
                this.policyHolderPlans = policyHolderPlans;
                this.markPlansDisabled(this.policyHolderPlans);
                if (this.policyHolderPlans.length === 0) {
                    this.addPolicyHolderBenefitPlan(policyHolderId, maxPriority + 1);
                }
            }, (err) => {
                this.toastrFactory.error(this.translate.instant('Failed to get patient benefit plans. '), 
                this.translate.instant('Server Error'));
            });            
            
        }
    }

    // mark plans the patient already has
    markPlansDisabled(policyHolderPlans) {        
        this.currentPatientBenefitPlans.forEach(x=>{            
            let ndx = policyHolderPlans.findIndex(plan=> plan.BenefitPlanId === x.BenefitPlanId && plan.PolicyHolderId === x.PolicyHolderId);
            if (ndx >= 0){
                policyHolderPlans[ndx].PolicyHolderBenefitPlanDto.PatientHasPlan = true;
            }
        })
    }

    policyHolderStringIdChanged(event, patientBenefitPlan){
        patientBenefitPlan.PolicyHolderStringId = event;
        if (this.policyHolderBenefitPlan) {
            this.policyHolderBenefitPlan.PolicyHolderStringId = event;
        }        
    }

    policyHolderChanged(event, patientBenefitPlan) {
        this.selectedPolicyHolderId = event.target.value;
        this.showPolicyOptions = false;        
        this.showPatientSearch = false;
        this.showPlanSearch = false;
        this.showPolicyHolderPlans = false;
        this.selectedPerson = null;
        this.policyHolderPlans = [];
        this.clearSelectedPlan(this.patientBenefitPlan);
        this.showRelationshipToPolicyHolder=false;
        this.validPolicyHolder = false;
        this.selectedPolicyHolderId = event.target.value;
        // handle 'other' selection
        if (this.selectedPolicyHolderId === '-1'){ 
            this.showPatientSearch = true;
            return;
        }
        const policyHolder = this.policyHolders.find(x => x.Person && x.Person.PatientId === this.selectedPolicyHolderId);
        if (!policyHolder){
            patientBenefitPlan.PolicyHolderId = null;
            return;
        }
        this.policyHolderName = this.bestPracticePatientNamePipe.transform(policyHolder.Person);
        // if the policy holder id is the same as the patient id
        if (this.selectedPolicyHolderId === this.patient.PatientId){
            this.setPolicyHolder(this.selectedPolicyHolderId, patientBenefitPlan);
        } else {
            // if policy holder is not 'self' then find that policy holder in list
            // and make sure they are a valid for this location
            this.patientValidationFactory.PatientSearchValidation(policyHolder.Person).then((res) => {
                if (!res.authorization.UserIsAuthorizedToAtLeastOnePatientLocation) {
                    this.patientValidationFactory.LaunchPatientLocationErrorModal(res);
                    patientBenefitPlan.PolicyHolderId = null;
                } else {
                    this.setPolicyHolder(this.selectedPolicyHolderId, patientBenefitPlan);
                }
            })            
        }
    }

    setPolicyHolder(selectedPolicyHolderId, patientBenefitPlan) {
        this.validPolicyHolder = true;        
        this.clearSelectedPlan(patientBenefitPlan);
        patientBenefitPlan.PolicyHolderId = selectedPolicyHolderId;
        this.showPlanSearch = (selectedPolicyHolderId === this.patient.PatientId) ? true: false;
        this.filterForAvailablePlans(patientBenefitPlan.PolicyHolderId); 
        this.showRelationshipToPolicyHolder = (selectedPolicyHolderId === this.patient.PatientId) ? false: true;

        if (selectedPolicyHolderId !== this.patient.PatientId){            
            this.getBenefitPlansForPolicyHolder(selectedPolicyHolderId);            
        }
    }      

    relationshipToPolicyHolderChanged(event, patientBenefitPlan) {
        patientBenefitPlan.RelationshipToPolicyHolder = event.target.value;
        // if policyHolder has plans, show those otherwise show their options
        this.showPolicyHolderPlans = (this.policyHolderPlans.length > 0);        
        this.showPolicyOptions = (this.policyHolderPlans.length === 0);
    }

    //#endregion

    //#region Select Benefit Plan

    filterForAvailablePlans(policyHolderId) {
        this.filteredBenefitPlans = cloneDeep(this.activeBenefitPlans);        
        this.currentPatientBenefitPlans.forEach(x => {            
            let ndx = this.filteredBenefitPlans.findIndex(plan => plan.BenefitPlanId === x.BenefitPlanId &&  x.PolicyHolderId === policyHolderId);
            if (ndx >= 0) {
                this.filteredBenefitPlans[ndx].PatientHasPlan = true;
            }
        })
        this.filteredBenefitPlans.sort((a, b) => (a?.BenefitPlanName < b?.BenefitPlanName ? -1 : 1));
    }

    selectBenefitPlan(item: BenefitPlanForAddInsuranceDto) {
        if (item && !item.PatientHasPlan) {
            this.selectedPlan = item;
            this.patientBenefitPlan.BenefitPlanId = item.BenefitPlanId;
            this.patientBenefitPlan.EffectiveDate = new Date();
            if (this.policyHolderBenefitPlan) {
                this.policyHolderBenefitPlan.BenefitPlanId = item.BenefitPlanId;
                this.policyHolderBenefitPlan.EffectiveDate = new Date();
            }            
        }        
    }

    noOptionsFilter(items: any[], value: string): any[] {
        return items;
    }

    selectPolicyOption(item: any) {
        this.showPolicyOptions = false;
        this.showPlanSearch = true;
        this.showPolicyHolderMessage = true;        
        this.addPolicyHolderPlanMessage=`This policy will also save to ${this.policyHolderName} record`;           
    }

    selectPolicyHolderBenefitPlan(item) {
        if (item && !item.PolicyHolderBenefitPlanDto.PatientHasPlan) {
            this.selectedPlan = item.PolicyHolderBenefitPlanDto.BenefitPlanDto;
            this.patientBenefitPlan.BenefitPlanId = item.BenefitPlanId;
            this.patientBenefitPlan.PolicyHolderStringId = item.PolicyHolderStringId;
            this.patientBenefitPlan.MemberId = item.MemberId;
            this.disablePolicyHolderStringId = true;
            this.disablePolicyHolderIdMessage = this.translate.instant('Policy Holder ID can only be edited from the Policy Holder');
            this.patientBenefitPlan.EffectiveDate = new Date();
        }
    }

    onSelectPlan(item: BenefitPlanForAddInsuranceDto) {        
    }

    onSelectPolicyHolderPlan (item: any) {
    }
    
    // search on all plans
    planSearch( items: BenefitPlanForAddInsuranceDto[], value: string): BenefitPlanForAddInsuranceDto[] {
        const filterValue = value.toLowerCase();
        return items.filter((plan) =>
            plan.BenefitPlanName && plan.BenefitPlanName.toLowerCase().includes(filterValue)
            || plan.CarrierName && plan.CarrierName.toLowerCase().includes(filterValue)            
            || plan.BenefitPlanGroupNumber && plan.BenefitPlanGroupNumber.toLowerCase().includes(filterValue)
            || plan.BenefitPlanGroupName && plan.BenefitPlanGroupName.toLowerCase().includes(filterValue)
            || plan.CarrierAddressLine1 && plan.CarrierAddressLine1.toLowerCase().includes(filterValue)
            || plan.CarrierAddressLine2 && plan.CarrierAddressLine2.toLowerCase().includes(filterValue)
            || plan.CarrierCity && plan.CarrierCity.toLowerCase().includes(filterValue)
            || plan.CarrierState && plan.CarrierState.toLowerCase().includes(filterValue)
            || plan.CarrierZipCode && plan.CarrierZipCode.toLowerCase().includes(filterValue)
        );
    };

    // search policyHolders existing plans
    policyHolderPlanSearch( items: any[], value: string): any[] {
        const filterValue = value.toLowerCase();
        return items.filter((plan) =>
            plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Name && plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Name.toLowerCase().includes(filterValue)
            || plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.CarrierName && plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.CarrierName.toLowerCase().includes(filterValue)
            || plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.PlanGroupName && plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.PlanGroupName.toLowerCase().includes(filterValue)
            || plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.AddressLine1 && plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.AddressLine1.toLowerCase().includes(filterValue)
            || plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.AddressLine2 && plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.AddressLine2.toLowerCase().includes(filterValue)
            || plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.City && plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.City.toLowerCase().includes(filterValue)
            || plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.State && plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.State.toLowerCase().includes(filterValue)
            || plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.ZipCode && plan.PolicyHolderBenefitPlanDto.BenefitPlanDto.Carrier.ZipCode.toLowerCase().includes(filterValue)
            || plan.PolicyHolderDetails.FirstName && plan.PolicyHolderDetails.FirstName.toLowerCase().includes(filterValue)        
            || plan.PolicyHolderDetails.LastName && plan.PolicyHolderDetails.LastName.toLowerCase().includes(filterValue)        
            || plan.PolicyHolderDetails.DateOfBirth && plan.PolicyHolderDetails.DateOfBirth.toLowerCase().includes(filterValue)
            || plan.PolicyHolderStringId && plan.PolicyHolderStringId.toLowerCase().includes(filterValue)
        
        );
    };

    openBenefitPlanTab(benefitPlanId:string) {
        this.tabLauncher.launchNewTab('#/BusinessCenter/Insurance/Plans/Edit/?guid=' + benefitPlanId);
    }

    //#endregion

    //#region When 'Other' is selected as policy holder
    onPersonSearch = (selectedValue: any) => {
        if (selectedValue){
            this.selectedPerson = selectedValue;
            this.showPolicyOptions = false; 
            this.showRelationshipToPolicyHolder = true;
            this.policyHolderName = this.bestPracticePatientNamePipe.transform(this.selectedPerson);            
            this.onOtherPolicyHolderSelected(this.selectedPerson, this.patientBenefitPlan); 
        }        
    }

    onOtherPolicyHolderSelected(selectedPerson, patientBenefitPlan) {        
        this.patientValidationFactory.PatientSearchValidation(selectedPerson).then((res) => {
            // if 'Other' person is selected make sure they are a valid for this location
            if (!res.authorization.UserIsAuthorizedToAtLeastOnePatientLocation) {
                this.patientValidationFactory.LaunchPatientLocationErrorModal(res);
                patientBenefitPlan.PolicyHolderId = null;
            } else {
                // if person is valid for location then check if they are valid to be a policy holder 
                this.patientBenefitPlanService.requestAvailablePolicyHolders({accountId: selectedPerson.PersonAccount.AccountId}).subscribe(policyHolders => {
                    let availablePolicyHolders = policyHolders.Value;
                    availablePolicyHolders.forEach(policyHolder => {
                        if (policyHolder.Person.PatientId === selectedPerson.PatientId && policyHolder.PolicyHolder.length > 0) {
                            // this is a valid policy holder
                            this.setPolicyHolder(selectedPerson.PatientId, patientBenefitPlan);
                        } else if (policyHolder.Person.PatientId === selectedPerson.PatientId && policyHolder.PolicyHolder.length === 0) {
                            // member is a dependant and cannot be policy holder... display error
                            this.validPolicyHolder = false;
                        }
                    })                    
                }, (err) => {
                    this.toastrFactory.error(this.translate.instant('Failed to get available policy holders. '), 
                    this.translate.instant('Server Error'));
                });                
            }
        })
    }
   
    clearSelectedPerson() {
        this.selectedPerson = null;
        this.policyHolderPlans = [];
        this.clearSelectedPlan(this.patientBenefitPlan);
        this.showRelationshipToPolicyHolder=false;
        this.showPatientSearch = true;
        this.hasErrors = false;
        this.validEffectiveDate = true;
        this.showPolicyHolderMessage = false;
        this.showPolicyOptions = false; 
    }

    clearSelectedPlan(patientBenefitPlan: PatientBenefitPlanDto) { 
        this.selectedPlan = null;
        this.showPlanSearch = ( patientBenefitPlan.PolicyHolderId === this.patient.PatientId) ? true: false;
        this.showPolicyHolderPlans = (this.policyHolderPlans.length > 0)? true: false;
        patientBenefitPlan.BenefitPlanId = null;
        patientBenefitPlan.PolicyHolderStringId = null;
        patientBenefitPlan.MemberId = null;
        this.disablePolicyHolderStringId = false;
        this.disablePolicyHolderIdMessage = '';
        patientBenefitPlan.RelationshipToPolicyHolder = null;
        patientBenefitPlan.EffectiveDate = null;
        if (this.policyHolderBenefitPlan) {
            this.removePolicyHolderBenefitPlan();
        }
        this.hasErrors = false;
        this.validEffectiveDate = true;
        this.showPolicyHolderMessage = false;        
    };

    //#endregion

    


    //#region Supporting methods

    effectiveDateChanged(event, patientBenefitPlan) {
        patientBenefitPlan.EffectiveDate = event;
        if (this.policyHolderBenefitPlan) {
            this.policyHolderBenefitPlan.EffectiveDate = event;
            this.validEffectiveDate = true;
        }       
    }

    buildRelationships() {
        this.relationships = [
            { text: this.translate.instant('Dependent'), value: 'Dependent' },
            { text: this.translate.instant('Spouse'), value: 'Spouse' },
            { text: this.translate.instant('Other'), value: 'Other' },
        ];
    }

    //#endregion

}
