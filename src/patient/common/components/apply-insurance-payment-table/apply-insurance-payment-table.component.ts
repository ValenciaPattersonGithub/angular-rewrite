import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { ClaimEntity, FinalPaymentChange, ServiceTransactionToClaimPaymentDto } from '../../models/patient-apply-insurance-payment.model';

export interface ClaimPaymentAmountBlurEvent {
  amount: number;
  claim: ClaimEntity;
  changeDetectorRef: ChangeDetectorRef;
}
@Component({
  selector: 'apply-insurance-payment-table',
  templateUrl: './apply-insurance-payment-table.component.html',
  styleUrls: ['./apply-insurance-payment-table.component.scss'],
})
export class ApplyInsurancePaymentTableComponent {
  @Input() claims: ClaimEntity[];
  @Output() paymentAmountBlurChange = new EventEmitter<ClaimPaymentAmountBlurEvent>();
  @Output() finalPaymentChange = new EventEmitter<FinalPaymentChange>();
  @Output() serviceAmountBlurChange = new EventEmitter<ClaimEntity>();
  @Output() serviceAllowedAmountBlurChange = new EventEmitter<ClaimEntity>();
  @Output() patientNameClick = new EventEmitter<string>();
  @Output() masterNoteChange = new EventEmitter<string>();
  @Input() masterNote: string;
  @Input() editMode = false;
  @Input() isInsTransactionDeposited: false;
  @Input() canEditAllowedAmount: boolean;

  distributedDetailsLoading: boolean;
  totalForServices = 0;
  unappliedAmount = 0;
  showErrors = false;
  claimsHaveErrors = false;
  editableMasterNote = '';
  editableIndividualNote = '';
  isMasterNoteDrawerOpen = false;
  isIndividualNoteDrawerOpen = false;
  selectedPaymentTransactionEditNote= null;  

  constructor(private changeDetectorRef: ChangeDetectorRef, @Inject('tabLauncher') private tabLauncher) {}

    header = [
        {
            label: 'Date',
            size: 'col-sm-1',
        },
        {
            label: 'Patient',
            size: 'col-sm-2',
        },
        {
            label: 'Provider',
            size: 'col-sm-1',
        },
        {
            label: 'Description',
            size: 'col-sm-2',
        },
        {
            label: 'Tooth',
            size: 'col-sm-1',
        },
        {
            label: 'Area',
            size: 'col-sm-1',
        },
        {
            label: 'Charges',
            size: 'col-sm-1',
        },
        {
            label: 'Allowed Amount',
            size: 'col-sm-1',
        },
        {
            label: 'Estimated Ins.',
            size: 'col-sm-1',
        },
        {
            label: 'Est. Ins. Adj.',
            size: 'col-sm-1',
        },
        {
            label: 'Patient Bal',
            size: 'col-sm-1',
        },
        {
            label: 'Apply Payment',
            size: 'col-sm-1',
        },
        {
            label: 'Final Payment',
            size: 'col-sm-1',
        },
    ];

    serviceAmountBlurEvent($event) {
        const data = $event;
        data.service.PaymentAmount = data.service.PaymentAmount.NewValue;
        this.serviceAmountBlurChange.emit($event);
    }

    finalPaymentChangeEvent(e) {
        e.FinalPayment = !e.FinalPayment;
        this.finalPaymentChange.emit(e);
    }

    paymentAmountBlurEvent($event: ClaimPaymentAmountBlurEvent) {
        const data = $event;
        data.claim.PaymentAmount = $event.amount;
        $event.changeDetectorRef = this.changeDetectorRef;
        this.paymentAmountBlurChange.emit($event);
    }

    patientNameClickEvent(e) {
        this.patientNameClick.emit(e);
    }  

  onAmountChanging($event) {
    const data = $event;
    data.claim.FinalPayment = true;
  }

    openFeeScheduleEvent = (feeScheduleId: string) => {
        this.tabLauncher.launchNewTab('#/BusinessCenter/Insurance/FeeSchedule/FeeScheduleDetails/' + feeScheduleId);
    };

    parseFloat(value) {
        return parseFloat(value);
    }

    masterNoteClickEvent() {

        this.editableMasterNote = this.masterNote;
        this.isMasterNoteDrawerOpen = true;
    }

    individualNoteClickEvent(claimTransaction) {
        this.selectedPaymentTransactionEditNote = claimTransaction;
        this.editableIndividualNote = claimTransaction ? claimTransaction.Note : '';
        this.isIndividualNoteDrawerOpen = true;
    }

    applyMasterNote() {
        const trimmedMasterNote = this.editableMasterNote.trim();
        if (this.masterNote != trimmedMasterNote) {
            this.masterNoteChange.emit(trimmedMasterNote);
        }

        this.closeMasterNoteDrawer();
    }

    applyIndividualNote() {
        this.editableIndividualNote = this.editableIndividualNote.trim();
        if (this.selectedPaymentTransactionEditNote &&
            this.selectedPaymentTransactionEditNote.Note != this.editableIndividualNote) {
            this.selectedPaymentTransactionEditNote.Note = this.editableIndividualNote;
        }

        this.closeIndividualNoteDrawer();
    }


    cancelMasterNote() {
            this.editableMasterNote = this.masterNote;
        this.closeMasterNoteDrawer();
    }

    closeMasterNoteDrawer() {
        this.isMasterNoteDrawerOpen = false;
        this.editableMasterNote = '';
    }
    closeIndividualNoteDrawer() {
          this.isIndividualNoteDrawerOpen = false;
        this.editableIndividualNote = '';
    }

    onAllowedAmountChanging($event) {
        const data = $event;
    }

    onAllowedAmountBlurEvent($event) {
        const data = $event;
        data.service.AllowedAmount = data.service.AllowedAmount.NewValue;
        $event.changeDetectorRef = this.changeDetectorRef;
        this.serviceAllowedAmountBlurChange.emit($event);
    }

    
  shouldAllowEdit(service: ServiceTransactionToClaimPaymentDto): boolean {
    const isEmptyGuid = service.EstimatedInsuranceId === '00000000-0000-0000-0000-000000000000';
    return this.canEditAllowedAmount && 
         service.FeeScheduleId !== null && 
         service.EstimatedInsuranceId !== null && 
         service.EstimatedInsuranceId !== undefined &&
         service.Charges > 0 && 
         !isEmptyGuid;
  }

  getAllowedAmountTooltip(service: ServiceTransactionToClaimPaymentDto): string {
    const isEmptyGuid = service.EstimatedInsuranceId === '00000000-0000-0000-0000-000000000000';    
    if (this.canEditAllowedAmount && (service.EstimatedInsuranceId === null 
            || service.EstimatedInsuranceId === undefined 
            || isEmptyGuid)) {
        return 'Allowed Amount can only be edited for primary and secondary plans.';      
      }
    if (this.canEditAllowedAmount && service.FeeScheduleId === null) {
      return 'Allowed Amount cannot be edited because there is no fee schedule for this benefit plan.';    
    }    
    return '';
  }

  // if canEditAllowedAmount then payment must be more than AllowedAmount - previous payments
  // if allowed amount the total insurance payments can't exceed that amount
  arePaymentsMoreThanAllowedAmount(service: ServiceTransactionToClaimPaymentDto): boolean {
    if (service.PaymentAmount === 0 || this.editMode){
        return false;
    }
    if (this.canEditAllowedAmount === true) {
        // if existing fee schedule item or allowed amount overridden
        if (service.FeeScheduleGroupDetailId || service.AllowedAmount !== service.OriginalAllowedAmount) {
          // Ensure payment and maxAllowedPayment is a fixed decimal value to avoid floating point precision issues
          let maxAllowedPayment = Math.min(service.AllowedAmount, service.Charges) - service.TotalInsurancePayments;          
          maxAllowedPayment = parseFloat(maxAllowedPayment.toFixed(2));
          const paymentAmount = parseFloat((service.PaymentAmount ? service.PaymentAmount : 0).toFixed(2));
          return paymentAmount > maxAllowedPayment;
        }
    }
    return false;
  }

  // if canEditAllowedAmount is false then payment must be more than or Equal Charge - previous payments
  // if no allowed amount the total insurance payments can't exceed the charges
  arePaymentsMoreThanCharge(service : ServiceTransactionToClaimPaymentDto): boolean {
    if (service.PaymentAmount === 0 || this.editMode){
        return false;
    }
    if (this.canEditAllowedAmount === true) {
        // if FF on and existing fee schedule item then payment must be validated against allowed amount or
        // new fee schedule item then payment must be validated against allowed amount
        if (service.FeeScheduleGroupDetailId || service.AllowedAmount !== service.OriginalAllowedAmount) {
            return false; 
        }        
    }   
    // Ensure payment and maxAllowedPayment is a fixed decimal value to avoid floating point precision issues
    let maxAllowedPayment = service.Charges  - service.TotalInsurancePayments;          
    maxAllowedPayment = parseFloat(maxAllowedPayment.toFixed(2));         
    const paymentAmount = parseFloat((service.PaymentAmount ? service.PaymentAmount : 0).toFixed(2));
    return paymentAmount > maxAllowedPayment;
  }
}
