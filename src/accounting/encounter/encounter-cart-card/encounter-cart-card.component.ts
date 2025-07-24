import { Component, OnInit, Input, EventEmitter, Output, Inject, ViewChildren, QueryList, LOCALE_ID, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyInputComponent } from '../../../@shared/components/currency-input/currency-input.component';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import cloneDeep from 'lodash/cloneDeep';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, filter, take } from 'rxjs/operators';
import { PatientEncounterService } from '../providers/patient-encounter.service';
import { TaxAssignment } from '../../../treatment-plans/models/treatment-plan-coverage';
import { PolicyHolderBenefitPlanDto } from '../../../patient/common/models/policy-holder-benefit-plan.model';
import { BenefitPlanDto } from '../../../patient/common/models/benefit-plan-dto.model';
declare let _: any;

@Component({
    selector: 'encounter-cart-card',
    templateUrl: './encounter-cart-card.component.html',
    styleUrls: ['./encounter-cart-card.component.scss'],    
})
export class EncounterCartCardComponent implements OnInit, OnDestroy {

    @ViewChildren(CurrencyInputComponent) currencyInputs!: QueryList<CurrencyInputComponent>;

    @Input() service: any;
    @Input() benefitPlans: any;
    @Output() serviceChange = new EventEmitter();    
    @Output() serviceClosed = new EventEmitter();
    @Output() transactionRecalculated = new EventEmitter();
    @Output() changesInProgress = new EventEmitter();

    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;    
    serviceChangesSubscription: Subscription;    

    public serviceDate: Date;
    public serviceCode: any;
    public maxServiceDate: Date;
    public minServiceDate: Date;
    public showEstInsError: Boolean = false;
    estInsErrorSubject = new Subject();

    triggerInsuranceUpdate: Boolean = false;
    showInsuranceEstimates: Boolean;
    isValidDateRange: Boolean = true;    
    patientData: any;    
    invaliDate = this.localize.getLocalizedString('Invalid Date');
    deleteConfirmationData = {
        data: {
            header: this.translate.instant('Remove Services from Encounter?'),
            message: '',
            message2: this.translate.instant('If this service was on a related appointment, it will be removed from that appointment but remain on the patient\'s clinical ledger as proposed.'),
            confirm: this.translate.instant('Yes, remove'),
            cancel: this.translate.instant('No, keep'),
            height: 240.00,
            width: 900
        }        
    };    

    constructor(
        private translate: TranslateService,        
        @Inject(LOCALE_ID) private locale: string,
        @Inject('localize') private localize,
        @Inject('$routeParams') private route,        
        @Inject('toastrFactory') private toastrFactory,
        @Inject('PatientServices') private patientServices,
        @Inject('referenceDataService') private referenceDataService,
        private confirmationModalService: ConfirmationModalService,
        private encounterService: PatientEncounterService,                                    
    ) { }
    ngOnDestroy(): void {
        this.serviceChangesSubscription.unsubscribe();
    }

    ngOnInit() {

        this.isValidDateRange = true;
        this.showInsuranceEstimates = false;
        const currentDate = new Date();
        this.maxServiceDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 0);
        this.minServiceDate = new Date(1900, 0, 1);

        this.estInsErrorSubject.pipe(debounceTime(5000)).subscribe(() => {
            this.service.InsuranceEstimates.forEach((estimate) => {
                estimate.$showEstInsError = false;
                this.showEstInsError = false;
            })
        });

        this.serviceChangesSubscription = this.encounterService.serviceHasChanged$.subscribe(response => {
            if(response){
                this.forceTotalInsuranceUpdate()
            }
        }, error => {
            // error handling?    
        });

        if (this.service) {            
            if (this.service.DateEntered) {
                if (!this.service.DateEntered.toString().toLowerCase().endsWith('z')) {
                    this.service.DateEntered += 'Z';
                }
                this.serviceDate = new Date(this.service.DateEntered);
            }

            this.serviceCode = {};
            Promise.resolve(this.referenceDataService.getData(this.referenceDataService.entityNames.serviceCodes)).then(allServiceCodes => {
                this.serviceCode = allServiceCodes.find(sc => sc.ServiceCodeId === this.service.ServiceCodeId);

                if (this.serviceCode != null) {
                    this.service.TaxableServiceTypeId = this.serviceCode.$$locationTaxableServiceTypeId;
                    this.service.DiscountableServiceTypeId = this.serviceCode.DiscountableServiceTypeId;
                    this.service.ServiceTypeId = this.serviceCode.ServiceTypeId;
                    this.service.IsEligibleForDiscount = this.serviceCode.IsEligibleForDiscount;
                }

                if (this.service.IsEligibleForDiscount) {
                    this.service.applyDiscount = true;
                } else {
                    this.service.applyDiscount = false;
                }
            });
        
            const promises = [];
            promises.push(Promise.resolve(this.patientServices.Patients.get({ Id: this.route.patientId }).$promise));

            Promise.all(promises).then(([patientData]) => {
                if (patientData !== undefined) {
                    this.patientData = patientData.Value;
                }
            });                    
        }
    }
  

    toggleInsuranceMenu() {
        this.showInsuranceEstimates = !this.showInsuranceEstimates;
    }

    onServiceClosed() {
        if (this.service) {
            this.serviceClosed.emit(this.service);            
        }
    }

    openRemoveServiceModal() {
        //Open the remove service modal

        this.deleteConfirmationData.data.message = this.translate.instant('Are you sure you want to remove {{0}} from this encounter?', { 0: this.serviceCode.DisplayAs ? this.serviceCode.DisplayAs : this.serviceCode.Code });
        this.confirmationRef = this.confirmationModalService.open(this.deleteConfirmationData);
        this.confirmationModalSubscription = this.confirmationRef.events.pipe(
            filter((event) => !!event),
            filter((event) => {
                return event.type === 'confirm' || event.type === 'close';
            }),
            take(1)
        ).subscribe((events) => {
            switch (events.type) {
                case 'confirm':
                    this.confirmationRef.close();
                    this.onServiceClosed();
                    break;
                case 'close':
                    this.confirmationRef.close();
                    break;
            }
        });
    }

    async onFeeChanged(newFee: any) {
        this.service.InsuranceEstimates.forEach(x => {
            x.IsUserOverRidden = false;

            x.IsMostRecentOverride = false;
        });
        this.service.Fee = newFee.NewValue;
        await this.recalculateServiceTransaction();

        this.serviceChange.emit(this.service);
    }

    onAmountChanging() {
        this.changesInProgress.emit(true);
    }

    getTaxAssignment(estimate) {
        var patientBenefitPlan =  _.find(this.benefitPlans, { PatientBenefitPlanId: estimate.PatientBenefitPlanId });
        if (estimate && patientBenefitPlan && patientBenefitPlan.PolicyHolderBenefitPlanDto && patientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto){
            return patientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.TaxAssignment;
        }
        return null;
    }

    async onEstimateChanged(newEstimate: any, priority: any) {
        // get tax assignment for this benefit plan, taxOnCharge will be 0 if taxAssignment is Charge or AfterCoverage 
        // only include tax in minOfChargeAndFsf or charge if taxAssignment is Charge or AfterCoverage
        var taxAssignment = this.getTaxAssignment(this.service.InsuranceEstimates[priority]);
        var taxOnCharge = 0;
        if (taxAssignment && (taxAssignment === TaxAssignment.Charge || taxAssignment === TaxAssignment.AfterCoverage)) {
            taxOnCharge = this.service.Tax ? this.service.Tax : 0;
        } 
        var discount = this.service.Discount ? this.service.Discount : 0;
        var charge = parseFloat((this.service.Fee - discount + taxOnCharge).toFixed(2));
        
        // if fee schedule AllowedAmount, use this to calculate minOfChargeAndFsf
        var feeScheduleFee = parseFloat((this.service.AllowedAmount ? this.service.AllowedAmount + taxOnCharge : charge).toFixed(2));
        var minOfChargeAndFsf = Math.min(charge, feeScheduleFee);

        //If the new estimate is larger than what is allowed for this single estimated insurance....
        //The lesser of the Charges and Allowed Amount
        if (newEstimate.NewValue > minOfChargeAndFsf) {
            //Reset the estimated insurance to the old values, leave the insurance estimate as it is
            this.service.InsuranceEstimates[priority].EstInsurance = newEstimate.OldValue;

            //Make the error tooltip display, letting the user know that the value they entered was too high and we reset it for them.            
            this.showEstInsError = true;
            this.service.InsuranceEstimates[priority].$showEstInsError = true;
            this.estInsErrorSubject.next(this.service.InsuranceEstimates[priority]);
        } else {
            //Else, set the estimate to the newEstimate and mark the service as overridden
            this.service.InsuranceEstimates.forEach(x => x.IsMostRecentOverride = false);

            this.service.InsuranceEstimates[priority].IsUserOverRidden = true;
            this.service.InsuranceEstimates[priority].IsMostRecentOverride = true;
            this.service.InsuranceEstimates[priority].EstInsurance = newEstimate.NewValue;

            await this.recalculateServiceTransaction();

        }
        this.service.InsuranceEstimates = cloneDeep(this.service.InsuranceEstimates);
        this.serviceChange.emit(this.service);
    }

    async recalculateServiceTransaction() {
        if (this.service) {            
            await Promise.all([this.calculateDiscount(), this.calculateTaxAfterDiscount()])

            this.service.Amount = parseFloat((this.service.Fee - this.service.Discount + this.service.Tax).toFixed(2));

            this.transactionRecalculated.emit(this.service);
        }
    }

    calculateDiscount() {
        return this.patientServices.Discount.get({ isDiscounted: this.service.applyDiscount }, this.service
        ).$promise.then((res) => this.calculateDiscountOnSuccess(res), this.calculateDiscountOnError);
    };

    calculateDiscountOnSuccess(successResponse) {
        if (this.service.applyDiscount) {
            this.service.Discount = successResponse.Value;
        } else {
            this.service.Discount = 0;
        }
    };

    calculateDiscountOnError() {
        this.toastrFactory.error(this.translate.instant('Failed to calculate discount'), 'Server Error');
    };

    calculateTaxAfterDiscount() {
        return this.patientServices.TaxAfterDiscount.get({
            isDiscounted: this.service.applyDiscount
        }, this.service
        ).$promise.then((res) => this.calculateTaxOnSuccess(res), this.calculateTaxOnError);
    };

    calculateTaxOnSuccess = function (successResponse) {
        this.service.Tax = successResponse.Value;
    };

    calculateTaxOnError = function () {
        this.toastrFactory.error(this.translate.instant('Failed to calculate tax'), 'Server Error');
    };

    onProviderOnServicesChanged(newProvider: any) {
        if (newProvider) {
            this.service.ProviderOnClaimsId = (newProvider.UserLocationSetup.ProviderOnClaimsRelationship === 2 && newProvider.UserLocationSetup.ProviderOnClaimsId) ?
                newProvider.UserLocationSetup.ProviderOnClaimsId :
                newProvider.ProviderId;
        }
        this.serviceChange.emit(this.service);
    }

    onProviderOnClaimsChanged(newProvider: any) {
        this.serviceChange.emit(this.service);
    }

    onServiceDateChanged(dateValue: Date) {
        if (dateValue) {
            const dateToCompare = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
            this.isValidDateRange =
              dateToCompare != null &&
              dateToCompare <= this.maxServiceDate &&
              dateToCompare >= this.minServiceDate;     
            this.service.DateEntered = dateValue;
            this.serviceDate = dateValue;
            this.serviceChange.emit(this.service);
        } else {
            this.isValidDateRange = false;
        }
    }

    forceTotalInsuranceUpdate() {
        this.triggerInsuranceUpdate = !this.triggerInsuranceUpdate;
    }

    getPlanNameString(estimate: any, priority: any) {
        let pbp = _.find(this.benefitPlans, { PatientBenefitPlanId: estimate.PatientBenefitPlanId });
        var planOrder = '';
        if (priority == 0) {
            planOrder = 'Primary'
        }
        else if (priority == 1) {
            planOrder = 'Secondary'
        }
        else if (priority == 2) {
            planOrder = 'Tertiary'
        }
        else if (priority == 3) {
            planOrder = '4th'
        }
        else if (priority == 4) {
            planOrder = '5th'
        }
        else if (priority == 5) {
            planOrder = '6th'
        }
        let benefitPlanDtoName = pbp ? pbp.PolicyHolderBenefitPlanDto.BenefitPlanDto.Name : '';
        return '(' + planOrder + ') ' + benefitPlanDtoName;
    }

    async areaChanged(inputModel) {

        //When the area changes, it could cause a smart code change
        //Check if a smart code change occurred
        if (this.service.ServiceCodeId != this.serviceCode.ServiceCodeId) {

            //Reset the serviceCode that we use here
            //This should update the Code and Description in the card
            this.serviceCode = this.referenceDataService.get(this.referenceDataService.entityNames.serviceCodes)
                .find(sc => sc.ServiceCodeId === this.service.ServiceCodeId);
            
            //If this is a smart code change, send back to the encounter cart to recalculate fees/insurance            
            await this.recalculateServiceTransaction();
        }                        
        this.serviceChange.emit(this.service);
    }

    async toothChanged(tooth) {
        this.service.Tooth = tooth;

        if (this.service.ServiceCodeId != this.serviceCode.ServiceCodeId) {

            ////Reset the serviceCode that we use here
            ////This should update the Code and Description in the card
            this.serviceCode = this.referenceDataService.get(this.referenceDataService.entityNames.serviceCodes)
                .find(sc => sc.ServiceCodeId === this.service.ServiceCodeId);


            //If this is a smart code change, send back to the encounter cart to recalculate fees/insurance
            await this.recalculateServiceTransaction();
        }        
        this.serviceChange.emit(this.service);
    }
    
    async onAllowedAmountChanged(newAllowedAmount: any, priority: any){ 
        this.service.AllowedAmount = newAllowedAmount.NewValue;     
        this.service.InsuranceEstimates[priority].AllowedAmountDisplay = newAllowedAmount.NewValue;
        this.service.InsuranceEstimates[priority].AllowedAmountOverride = newAllowedAmount.NewValue;
        await this.recalculateServiceTransaction();
        this.serviceChange.emit(this.service);
    }
}
