import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ServiceTransactionToClaimPaymentDto } from 'src/@core/models/bulk-payment/bulk-insurance-dtos.model';

export interface ClaimPaymentAmountBlurEvent {
  amount: number;
  claim: any;
  changeDetectorRef: ChangeDetectorRef
}

@Component({
  selector: 'claim-payment-table',
  templateUrl: './claim-payment-table.component.html',
  styleUrls: ['./claim-payment-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimPaymentTableComponent implements OnInit {

    @Input() claims: any;
    @Input() masterNote: string;
    @Input() canEditAllowedAmount: boolean;
    @Input() triggerRefresh: EventEmitter<void>;
    @Output() paymentAmountBlurChange = new EventEmitter<ClaimPaymentAmountBlurEvent>();
    @Output() serviceAmountBlurChange = new EventEmitter<any>();
    @Output() finalPaymentChange = new EventEmitter<any>();
    @Output() patientNameClick = new EventEmitter<any>();
    @Output() masterNoteChange = new EventEmitter<string>();
    @Output() serviceAllowedAmountBlurChange = new EventEmitter<ClaimPaymentAmountBlurEvent>();

    isMasterNoteDrawerOpen: boolean = false;
    isIndividualNoteDrawerOpen: boolean = false;
    selectedClaimTransactionEditNote: any;
    editableMasterNote: string = '';
    editableIndividualNote: string = '';
  header = [
    {
      label: "Date",
      size: 'col-sm-1',
      class: 'text-left'
    },
    {
      label: "Patient",
      size: 'col-sm-1',
      class: 'text-left'
    },
    {
      label: "Provider",
      size: 'col-sm-1',
      class: 'text-left'
    },
    {
      label: "Description",
      size: 'col-sm-2',
      class: 'text-left'
    },
    {
      label: "Tooth",
      size: 'half-col',
      class: 'text-left'
    },
    {
      label: "Area",
      size: 'half-col',
      class: 'text-left'
    },
    {
      label: "Charges",
      size: 'col-sm-1',
      class: 'text-right'
    },
    {
      label: "Allowed Amount",
      size: "col-sm-1",
      class: 'text-right'
    },
    {
      label: "Estimated Ins.",
      size: 'col-sm-1',
      class: 'text-right'
    },
    {
      label: "Est. Ins. Adj.",
      size: 'col-sm-1',
      class: 'text-right'
    },
    {
      label: "Patient Bal",
      size: 'col-sm-1',
      class: 'text-right'
    },
    {
      label: "Apply Payment",
      size: 'col-sm-1',
      class: 'text-right'
    },
    {
      label: "Final Payment",
      size: 'col-sm-1',
      class: 'text-right'
    }];

    constructor(
      private changeDetectorRef: ChangeDetectorRef
  ) { }
  ngOnInit() {
    // update the table when the triggerRefresh event is emitted
    this.triggerRefresh.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });	
  }
  paymentAmountBlurEvent($event: ClaimPaymentAmountBlurEvent) {
    let data = $event;
    data.claim.PaymentAmount = data.amount;

    $event.changeDetectorRef = this.changeDetectorRef;
    this.paymentAmountBlurChange.emit($event);
  }

  serviceAmountBlurEvent($event){
    let data = $event;
    data.service.PaymentAmount = data.service.PaymentAmount.NewValue;
    this.serviceAmountBlurChange.emit($event);
  }

  finalPaymentChangeEvent(e) {
    e.FinalPayment = !e.FinalPayment;
    this.finalPaymentChange.emit(e);
  } 

    masterNoteClickEvent() {
        this.editableMasterNote = this.masterNote;
        this.isMasterNoteDrawerOpen = true;
    }

    individualNoteClickEvent(claimTransaction: any) {
        this.selectedClaimTransactionEditNote = claimTransaction;
        this.editableIndividualNote = claimTransaction ? claimTransaction.Note : '';
        this.isIndividualNoteDrawerOpen = true;
    }

  parseFloat(value) {
    return parseFloat(value);
  }

  onAmountChanging($event) {
    let data = $event;
    data.claim.FinalPayment = true;
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

  shouldAllowEdit(service: any): boolean {
    const isEmptyGuid = service.EstimatedInsuranceId === '00000000-0000-0000-0000-000000000000';
    return this.canEditAllowedAmount && 
         service.FeeScheduleId !== null && 
         service.EstimatedInsuranceId !== null && 
         service.EstimatedInsuranceId !== undefined && 
         service.Charges > 0 &&
         !isEmptyGuid;
  }

  getAllowedAmountTooltip(service: any): string {
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


  patientNameClickEvent(e) {
    this.patientNameClick.emit(e);
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
        if (this.selectedClaimTransactionEditNote &&
            this.selectedClaimTransactionEditNote.Note != this.editableIndividualNote) {
            this.selectedClaimTransactionEditNote.Note = this.editableIndividualNote;
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
  
    // if canEditAllowedAmount then payment must be more than AllowedAmount - previous payments
    // if allowed amount the total insurance payments can't exceed that amount
    arePaymentsMoreThanAllowedAmount(service: ServiceTransactionToClaimPaymentDto): boolean {
      if (service.PaymentAmount === 0 || service.PaymentAmount == null) {
        return false;
      }
      if (this.canEditAllowedAmount === true) {
        // if existing fee schedule item or allowed amount overridden
        if (service.FeeScheduleGroupDetailId|| service.AllowedAmount !== service.OriginalAllowedAmount) {          
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
      if (service.PaymentAmount === 0 || service.PaymentAmount == null) {
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
