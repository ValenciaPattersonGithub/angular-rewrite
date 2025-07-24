import {
  Component,
  OnInit,
  Inject,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { OrderByPipe } from 'src/@shared/pipes';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import { isNullOrUndefined, isNull } from 'util';
import { CurrencyType } from 'src/@core/models/currency/currency-type.model';

@Component({
  selector: 'insurance-payment-types-dropdown',
  templateUrl: './insurance-payment-types-dropdown.component.html',
  styleUrls: ['./insurance-payment-types-dropdown.component.scss'],
})
export class InsurancePaymentTypesDropdownComponent implements OnInit {
  @Input() initialSelectedPaymentType: any;
  @Output() selectedPaymentTypeChange = new EventEmitter<any[]>();
  @Input() disabled: boolean = false;
  @Input() isPatientInsMultiClaim: boolean;
  allInsurancePaymentTypes: any[];
  insurancePaymentTypes: any[];
  insurancePaymentTypeCategory = 2;
  selectedPaymentTypeId: any;

  constructor(
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize,
    private paymentTypesService: PaymentTypesService
  ) {}

  ngOnInit() {
    // Call service to get all insurance payment types
    this.paymentTypesService
      .getAllPaymentTypesMinimal(true, this.insurancePaymentTypeCategory)
      .then(
        res => {
          this.getInsurancePaymentTypesSuccess(res);
        },
        () => {
          this.getInsurancePaymentTypesFailure();
        }
      );
    }
    
  ngOnChanges(changes: any) {
    if (this.isPatientInsMultiClaim === true) {
      this.filterInsurancePaymentTypes(this.allInsurancePaymentTypes);
    }
    if (changes.initialSelectedPaymentType) {
      this.initialPaymentTypeSelectionChange(
        changes.initialSelectedPaymentType
      );
    }
  }

  initialPaymentTypeSelectionChange(paymentTypeInputChange) {
    if (
      !isNullOrUndefined(paymentTypeInputChange.currentValue) &&
      paymentTypeInputChange.currentValue !==
        paymentTypeInputChange.previousValue
    ) {
      this.initialSelectedPaymentType = paymentTypeInputChange.currentValue;
      this.addInactivePaymentTypeToDropDown();
      this.paymentTypesChanged(this.initialSelectedPaymentType);
    }
  }

  // Don't allow user selection of the "Payment Type" default item/header
  itemDisabled(itemArgs: { dataItem: any; index: number }) {
    return itemArgs.dataItem.PaymentTypeId == null;
  }

  // Get insurance payment types success method
  getInsurancePaymentTypesSuccess = (res: any) => {
    if (res && res.Value) {
      this.allInsurancePaymentTypes = res.Value;
      this.insurancePaymentTypes = res.Value;
      this.filterInsurancePaymentTypes(this.insurancePaymentTypes);
    }
  };

  // Get insurance payment types failure method
  getInsurancePaymentTypesFailure = () => {
    this.toastrFactory.error(
      this.localize.getLocalizedString('Failed to load payment types')
    );
  };

  // Filter payment types for only active and sort by description
  filterInsurancePaymentTypes(insPaymentTypes) {
    var filteredInsPaymentTypes = insPaymentTypes.filter(paymentType => {
      if (this.isPatientInsMultiClaim === true) {
        return paymentType.IsActive === true && paymentType.CurrencyTypeId !== CurrencyType.CreditCard;
      }
      return paymentType.IsActive === true;
    });

    const orderPipe = new OrderByPipe();
    this.insurancePaymentTypes = orderPipe.transform(filteredInsPaymentTypes, {
      sortColumnName: 'Description',
      sortDirection: 1,
    });
  }

  addInactivePaymentTypeToDropDown() {
    if (
      this.insurancePaymentTypes &&
      !isNullOrUndefined(this.initialSelectedPaymentType) &&
      !this.insurancePaymentTypes.some(
        x => x.PaymentTypeId === this.initialSelectedPaymentType
      )
    ) {
      var inactivePaymentType = this.allInsurancePaymentTypes.find(
        x => x.PaymentTypeId === this.initialSelectedPaymentType
      );
      if (!isNullOrUndefined(inactivePaymentType)) {
        this.insurancePaymentTypes.push(inactivePaymentType);
        const orderPipe = new OrderByPipe();
        this.insurancePaymentTypes = orderPipe.transform(
          this.insurancePaymentTypes,
          { sortColumnName: 'Description', sortDirection: 1 }
        );
      }
    }
  }

  // Change the selected payment type and emit new value on change
  paymentTypesChanged(paymentTypeId) {
    if (this.insurancePaymentTypes) {
      if (paymentTypeId === 0) {
        paymentTypeId = null;
      }

      var selectedPaymentType = !isNullOrUndefined(paymentTypeId)
        ? this.insurancePaymentTypes.find(
            x => x.PaymentTypeId === paymentTypeId
          )
        : null;
      this.selectedPaymentTypeId = !isNull(selectedPaymentType)
        ? selectedPaymentType.PaymentTypeId
        : null;
      this.selectedPaymentTypeChange.emit(selectedPaymentType);
    }
  }
}
