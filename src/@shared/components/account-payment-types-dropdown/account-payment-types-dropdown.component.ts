import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'account-payment-types-dropdown',
  templateUrl: './account-payment-types-dropdown.component.html',
  styleUrls: ['./account-payment-types-dropdown.component.scss']
})
export class AccountPaymentTypesDropdownComponent implements OnInit {

    constructor() { }

    @Input() paymentTypes: any[];
    @Input() isDisabled?: boolean=false;
    @Input() selectedPaymentTypeId: any;
    @Output() selectedPaymentTypeChange = new EventEmitter<any>();

    accountPaymentTypes: Array<any>;
    selectOption: any;    

    ngOnInit(): void {
        this.filterPaymentTypes();
    }

    filterPaymentTypes() {
        this.selectOption = 'Select Option';
        let accountPaymentTypes = this.paymentTypes.filter(function (paymentType) {
			return paymentType.PaymentTypeCategory === 1 && (paymentType.Description.toLowerCase().indexOf('vendor payment') === -1);
		});        
        accountPaymentTypes.sort((a, b) => (a.Description < b.Description ? -1 : 1));
        this.accountPaymentTypes = accountPaymentTypes;        		
    }

    onPaymentTypeChange(event) {
        if (this.accountPaymentTypes){
                this.selectedPaymentTypeChange.emit(this.selectedPaymentTypeId);
        }         
    }    
}
