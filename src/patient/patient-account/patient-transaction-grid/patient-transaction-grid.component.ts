import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Inject,
} from "@angular/core";

import { TransactionEditDisabledReason } from 'src/patient/common/models/enums/transaction-edit-disabled-reason.enum';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from "@angular/platform-browser";
declare let _: any;

@Component({
  selector: "patient-transaction-grid",
  templateUrl: "./patient-transaction-grid.component.html",
  styleUrls: ["./patient-transaction-grid.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientTransactionGridComponent implements OnInit {
  @Input() rows: any;
  @Input() isCreateCustomInvoice: any;
  @Input() showCreateClaimView: any;
  @Input() sortingApplied: any;
  @Input() hideRunningBalance: boolean;
  @Input() isSelectionView: boolean;
  @Input() currentPatientId: any;
  @Input() refreshTransactionHistoryPageData: any;
  @Input() removeShowMoreButton: boolean;
  @Input() resetPaging: boolean;
  @Input() patientDet: "";
  @Input() keepCreateClaimViewOpen: boolean;
  @Input() sortObject: any;
  @Input() selectedPlanId: any;

  @Output() refreshDataTx = new EventEmitter<any>();

  @Output() showMoreGrid = new EventEmitter<any>();
  @Output() viewDetailsActionFunction = new EventEmitter<any>();
  @Output() deleteActionFunction = new EventEmitter<any>();
  @Output() editActionFunction = new EventEmitter<any>();
  @Output() viewCompleteEncounterActionFunction = new EventEmitter<any>();
  @Output() changePaymentOrAdjustmentActionFunction = new EventEmitter<any>();
  @Output() viewCarrierResponseFunction = new EventEmitter<any>();
  @Output() viewInvoiceFunction = new EventEmitter<any>();
  @Output() printReceiptFunction = new EventEmitter<any>();
  @Output() viewEobActionFunction = new EventEmitter<any>();

  @Output() sortColumnField = new EventEmitter<any>();
  @Output() selectedCountChange = new EventEmitter<any>();

  header = [
    {
      label: "Date",
      size: "col-sm-1",
      class: "text-left txhDate",
      id: "trxhDateHeader",
      click: "Date",
      span: true,
    },
    {
      label: "Patient",
      size: "col-sm-1",
      class: "text-left txhPatientName",
      id: "trxhpatientHeader",
      click: "PatientName",
      span: true,
    },
    {
      label: "Provider",
      size: "col-sm-1",
      class: "text-left txhProvider",
      id: "trxhProviderHeader",
      click: "ProviderName",
      span: true,
    },
    {
      label: "Location",
      size: "col-sm-2",
      class: "text-left txhLocation",
      id: "trxhLocationHeader",
      click: "Location",
      span: true,
    },
    {
      label: "Type",
      size: "half-col",
      class: "text-left txhType",
      id: "trxhTypeHeader",
      click: "Type",
      span: true,
    },
    {
      label: "Description",
      size: "half-col",
      class: "text-left txhDescription nonSortHeader",
      id: "trxhDescriptionHeader",
      span: false,
    },
    {
      label: "Tooth",
      size: "col-sm-1",
      class: "text-right txhTooth",
      id: "trxhToothHeader",
      click: "Tooth",
      span: true,
    },
    {
      label: "Area",
      size: "col-sm-1",
      class: "text-right txhArea nonSortHeader",
      id: "trxhAreaHeader",
      span: false,
    },
    {
      label: "Amount",
      size: "col-sm-1",
      class: "text-right txhAmount nonSortHeader",
      id: "trxhAmountHeader",
      span: false,
    },
    {
      label: "Allowed Amt",
      size: "col-sm-1",
      class: "text-right txhAllowedAmount nonSortHeader",
      id: "trxhAllowedAmtHeader",
      span: false,
    },
    {
      label: "Ins Adj",
      size: "col-sm-1",
      class: "text-right txhInsAdjAmount nonSortHeader",
      id: "trxhInsAdjHeader",
      span: false,
    },
    {
      label: "Est Ins",
      size: "col-sm-1",
      class: "text-right txhEstIns nonSortHeader",
      id: "trxhEstInsHeader",
      span: false,
    },
    {
      label: "Balance",
      size: "col-sm-1",
      class: "text-right txhBalance nonSortHeader",
      id: "trxhBalanceHeader",
      span: false,
    },
    {
      label: "",
      size: "col-sm-1",
      class: "text-right",
      id: "trxhEllipsisMenuHeader",
      span: false,
    },
  ];

  constructor(@Inject('PatientDocumentsFactory') private patientDocumentsFactory,private matIconRegistry: MatIconRegistry,
      private domSanitizer: DomSanitizer) {
        this.matIconRegistry.addSvgIcon(
          'assignment',
          this.domSanitizer.bypassSecurityTrustResourceUrl(
            '../v1.0/images/assignment.svg'
          )
        );
      }

  ngOnInit() {}

  showMoreResults() {
    this.showMoreGrid.emit();
  }

  refreshData() {
    this.refreshDataTx.emit();
  }

  sortColumn(field) {
    let listOfField;

    listOfField = _.filter(this.header, (filteredList) => {
      if (filteredList.click === field && filteredList.span === true) {
        this.sortColumnField.emit(field);
      }
    });
  }

  sortcss(event) {
    if (this.sortObject) {
      if (this.sortObject[event] === 1) {
        return "fa-sort-up";
      } else if (this.sortObject[event] === 2) {
        return "fa-sort-down";
      } else if (!this.sortObject[event]) {
        return "fa-sort";
      }
    } else return "fa-sort";
  }

  selectedCountChangeEvent(event) {
    event.ServiceManuallySelected = !event.ServiceManuallySelected;
    event.selected = !event.selected;
    this.selectedCountChange.emit(event);
  }

  // Detect changes from bound variables
  ngOnChanges(changes: any) {
    if (
      changes.removeShowMoreButton &&
      changes.removeShowMoreButton.currentValue
    ) {
    }
  }
  displayDocument(row) {
    row.Name = row.Description;
		this.patientDocumentsFactory.DisplayDocument(row);
  }

  viewRowItem(encounter) {
    this.viewDetailsActionFunction.emit(encounter);
  }
  showEditAndDeleteCondition(row) {
    return (
      row.TransactionTypeId === 1 ||
      row.TransactionTypeId === 2 ||
      row.TransactionTypeId === 3 ||
      row.TransactionTypeId === 4 ||
      row.TransactionTypeId === 5 ||
      row.TransactionTypeId === 6 ||
      row.ObjectType === "Document"
    );
  }
  disableEditForMenu(row) {
    if (row.InProcess) {
      return TransactionEditDisabledReason.ClaimInProcess;
    } else if (row.IsAuthorized) {
      if (row.TransactionTypeId === 5) {
        return TransactionEditDisabledReason.CreditOrDebitCardReturn;
      }
      return TransactionEditDisabledReason.CreditOrDebitCardPayment;
    } else if (row.IsDeposited) {
      return TransactionEditDisabledReason.PaymentDeposited;
    } else if (row.TransactionTypeId === 5 && !row.IsServiceLocationMatch) {
        return TransactionEditDisabledReason.CurrentLocationDoesNotMatchAdjustmentLocation;
    } else if (row.Description.toLowerCase().indexOf('vendor payment refund') !== -1){
        return TransactionEditDisabledReason.IsVendorPaymentRefund;
    } else if (row.Description.toLowerCase().indexOf('vendor payment') !== -1){
        return TransactionEditDisabledReason.IsVendorPayment;
    }
  }

  deleteRowItem(itemToBeDeleted) {
    this.deleteActionFunction.emit(itemToBeDeleted);
  }
  editRowItem($event) {
    this.editActionFunction.emit($event);
  }
  viewCompleteEncounter($event) {
    this.viewCompleteEncounterActionFunction.emit($event);
  }
  changePaymentOrAdjustment($event) {
    this.changePaymentOrAdjustmentActionFunction.emit($event);
  }
  viewCarrierResponse($event) {
    this.viewCarrierResponseFunction.emit($event);
  }
  viewInvoice($event) {
    this.viewInvoiceFunction.emit($event);
  }
  printReceipt($event) {
    this.printReceiptFunction.emit($event);
  }
  viewEra($event) {
    this.viewEobActionFunction.emit($event);
  }
}
