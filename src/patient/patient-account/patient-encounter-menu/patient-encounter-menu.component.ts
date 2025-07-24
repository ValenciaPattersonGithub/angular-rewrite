import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
 
declare let angular: any;

import { AnimationQueryMetadata } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { TransactionEditDisabledReason } from 'src/patient/common/models/enums/transaction-edit-disabled-reason.enum';


@Component({
  selector: 'patient-encounter-menu',
  templateUrl: './patient-encounter-menu.component.html',
  styleUrls: ['./patient-encounter-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PatientEncounterMenuComponent implements OnInit {
  @Input() encounter: any;
  @Input() depositCreditTransactionId: any;
  @Input() disableEditButton: any;
  @Input() refreshPageDataForGrid: any;
  @Input() showViewDetailButton: any;
  @Input() encounterIndex: any;

  @Output() viewDetailsActionFunction = new EventEmitter<any>();
  @Output() deleteActionFunction = new EventEmitter<any>();
  @Output() applyAdjustmentActionFunction = new EventEmitter<any>();
  @Output() applyPaymentActionFunction = new EventEmitter<any>();
  @Output() editActionFunction = new EventEmitter<any>();
  @Output() viewCompleteEncounterActionFunction = new EventEmitter<any>();
  @Output() viewCarrierResponseFunction = new EventEmitter<any>();
  @Output() changePaymentOrAdjustmentActionFunction = new EventEmitter<any>();
  @Output() createClaimActionFunction = new EventEmitter<any>();
  @Output() printReceiptFunction = new EventEmitter<any>();
  @Output() viewInvoiceFunction = new EventEmitter<any>();
  @Output() viewEobActionFunction = new EventEmitter<any>();
  @Input() showViewEobButton: any;
  @Input() disableMessage: any;
  @Input() disableCreateClaimButton: any;
  @Input() showCreateClaimButton: any;
  @Input() showChangePaymentOrAdjustmentOption: any;
  @Input() showViewCompleteEncounterButton: any;
  @Input() showApplyPaymentButton: any;
  @Input() showApplyAdjustmentButton: any;
  @Input() disableEditEncounterButton: any;
  @Input() showEditEncounterButton: any;
  @Input() showEditButton: any;
  @Input() disableDeleteButton: any;
  @Input() encounterClaimsObj: any;
  @Input() showViewEditClaimNoteButton: any;
  @Input() showViewClaimButton: any;
  @Input() showDeleteButton: any;
  @Input() isPendingEncounterGrid: any;
  @Input() hideCheckoutAllButton: any;
  @Input() disableCheckoutAllButton: any;
  @Output() checkoutActionFunction = new EventEmitter<any>();
  disableEditMessage = '';
  disableDeleteMessage = '';
  distributionMenuText = this.localize.getLocalizedString('Change Distribution');
  noaccessTooltipText = this.translate.instant('You do not have permission to view this information.');
  hasViewDepositAccess = false;
  hasPrintInvoiceAccess = false;
  hasDeleteEncounterAccess = false;
  hasEditClaimAccess = false;
  hasViewClaimAccess = false;
  hasEditEncounterAccess = false;
  hasEditEncounterAccess1 = false;
  hasApplyPaymentAccess = false;
  hasApplyAdjAccess = false;
  hasCdtAdjAccess = false;

  constructor(
    @Inject("AccountNoteFactory") private accountNoteFactory
    , @Inject('toastrFactory') private toastrFactory
    , @Inject('localize') private localize
    , @Inject('tabLauncher') private tabLauncher
    , @Inject('DepositService') private depositService
    , private translate: TranslateService
    , @Inject('patSecurityService') private patSecurityService
    ) { }

  ngOnInit(): void {
    this.authAccess();
    if (this.encounter.IsFeeScheduleWriteOff) {
      this.distributionMenuText = this.localize.getLocalizedString('View Distribution');
    }
    //disable logic area

    switch (this.disableEditButton) {
      case TransactionEditDisabledReason.ClaimInProcess:
        this.disableEditMessage = 'This service is attached to a claim that is InProcess and it cannot be edited or deleted';
        this.disableDeleteMessage = 'This service is attached to a claim that is InProcess and it cannot be edited or deleted';
        break;
      case TransactionEditDisabledReason.CreditOrDebitCardPayment:
        this.disableEditMessage = 'Credit/Debit Card Payments cannot be edited';
        this.disableDeleteMessage = 'Credit/Debit Card Payments cannot be deleted';
        break;
      case TransactionEditDisabledReason.CreditOrDebitCardReturn:
        this.disableEditMessage = 'Credit/Debit card returns cannot be edited or deleted';
        this.disableDeleteMessage = 'Credit/Debit card returns cannot be edited or deleted';
        break;
      case TransactionEditDisabledReason.PaymentDeposited:
        this.disableEditMessage = 'This payment is already deposited and it cannot be edited or deleted.';
        this.disableDeleteMessage = 'This payment is already deposited and it cannot be edited or deleted.';
        break;
      case TransactionEditDisabledReason.IsVendorPayment:
        this.disableEditMessage = 'This payment originated from a third party vendor and it cannot be edited.';
        this.disableDeleteMessage = '';
        break;
      case TransactionEditDisabledReason.CurrentLocationDoesNotMatchAdjustmentLocation:
        this.disableEditMessage = 'Your current location does not match this adjustment\'s location.';
        this.disableDeleteMessage = this.disableEditMessage;
        break;
      case TransactionEditDisabledReason.IsVendorPaymentRefund:
        this.disableEditMessage = 'This debit originated from a third party vendor and it cannot be edited.';
        this.disableDeleteMessage = '';
        break;
    }

  }
  // featureService
  // Event for expanding encounter row in summary screen
  expandEncounter() {
    // Call a callback function for "View Details" action from summary screen
    this.viewDetailsActionFunction.emit(this.encounter);
  };

  // Event for View statement link from transaction history screen on encounterMenu
  viewStatement() {
    this.accountNoteFactory.viewStatement(this.encounter.AccountStatementId ? this.encounter.AccountStatementId : this.encounter.ObjectId);
  };

  // Event for deleting encounter row from summary screen or transaction history screen
  deleteEncounter() {

    // Call a callback function for "Delete" action from summary or transaction history screen.
    this.deleteActionFunction.emit(angular.copy(this.encounter));
  };

  // Event for expanding or collapsing encounter menu
  toggleMenu() {
    if (this.encounter.showDetail === true) {
      this.viewDetailsActionFunction.emit(this.encounter);
    }
  };

  // Apply adjustment on encounter
  applyAdjustment() {
    // Note- second parameter "true" denotes adjustment operation
    // Call a callback function for "Apply adjustment" action from summary screen
    if (this.hasApplyAdjAccess)
      this.applyAdjustmentActionFunction.emit(angular.copy(this.encounter));//, true);
  };

  // Apply a payment on encounter
  applyPayment() {
    // Note- second parameter "false" denotes payment operation
    // Call a callback function for "Apply a payment" action from summary screen
    if (this.hasApplyPaymentAccess)
      this.applyPaymentActionFunction.emit(angular.copy(this.encounter));//, false);
  };

  // Open transaction for view/edit action
  editTransaction() {

    this.editActionFunction.emit(this.encounter);
  };

  // Callback function for opening encounter in summary screen that contains current selected service transaction/ payment transaction/ adjustment transaction
  viewEncounter() {

    this.viewCompleteEncounterActionFunction.emit(this.encounter);
  };

  viewCarrierResponse() {
    if (this.hasViewClaimAccess)
      this.viewCarrierResponseFunction.emit(this.encounter);
  };

  changePaymentOrAdjustment() {
    // Call a callback function for "Change how payment or adjustment is applied" action from transaction-history screen
    if (this.hasCdtAdjAccess)
      this.changePaymentOrAdjustmentActionFunction.emit(angular.copy(this.encounter));
  };

  // Call a callback function for "Create claim"
  createClaimAction() {
    this.createClaimActionFunction.emit(angular.copy(this.encounter));
  };

  // // Watch the isOpen, when set to false hide the DD menu by removing class 
  // // (#Bug) When encounter is expanded from DD menu and closed by double click, encounter gets collapsed but still DD menu is shown as DD hide event is not getting fired.
  // // Removing open class closed the DD menu
  // $watch('encounter.showDetail', function (nv, ov) {
  //     if (nv !== ov && nv === false) {
  //       setTimeout(()=> {
  //             angular.element('#btnGroup' + encounterIndex).removeClass('open');
  //         }, 0);
  //     }
  // });

  printReceipt() {
    this.printReceiptFunction.emit(angular.copy(this.encounter));
  };


  viewInvoice() {
    if (this.hasPrintInvoiceAccess) {
      var enctr = angular.copy(this.encounter);
      this.viewInvoiceFunction.emit(enctr);
    }
  };

  getEditButtonAmfa() {
    var amfa = 'soar-acct-enctr-edit';

    if (this.encounter) {
      switch (this.encounter.TransactionTypeId) {
        case 2:
          amfa = 'soar-acct-aapmt-edit';
          break;
        case 3:
          amfa = 'soar-acct-aipmt-edit';
          break;
        case 4:
          amfa = 'soar-acct-cdtadj-edit';
          break;
        case 5:
          amfa = 'soar-acct-dbttrx-edit';
          break;
      }
    }

    return amfa;
  };

  getDeleteButtonAmfa() {
    var amfa = "soar-acct-enctr-delete";

    if (this.encounter) {
      switch (this.encounter.TransactionTypeId) {
        case 1:
          amfa = "soar-acct-actsrv-delete";
          break;
        case 2:
          amfa = "soar-acct-aapmt-delete";
          break;
        case 3:
          amfa = "soar-acct-aipmt-delete";
          break;
        case 4:
          amfa = "soar-acct-cdtadj-delete";
          break;
        case 5:
          amfa = "soar-acct-dbttrx-delete";
          break;
      }
    }

    return amfa;
  };

  authAccess = () => {
    this.hasViewDepositAccess = this.authAccessByType("soar-biz-dep-view");
    this.hasPrintInvoiceAccess = this.authAccessByType("soar-acct-inv-print");
    this.hasDeleteEncounterAccess = this.authAccessByType(this.getDeleteButtonAmfa());
    this.hasViewClaimAccess = this.authAccessByType("soar-ins-iclaim-view");
    this.hasEditEncounterAccess = this.authAccessByType(this.getEditButtonAmfa());
    this.hasEditEncounterAccess1 = this.authAccessByType("soar-acct-enctr-edit");
    this.hasApplyPaymentAccess = this.authAccessByType("soar-acct-aapmt-add");
    this.hasApplyAdjAccess = this.authAccessByType("soar-acct-cdtadj-add");
    this.hasCdtAdjAccess = this.authAccessByType("soar-acct-cdtadj-edit");
    this.hasEditClaimAccess = this.authAccessByType("soar-ins-iclaim-edit");
  }
  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
}

  viewEob() {
    this.viewEobActionFunction.emit(angular.copy(this.encounter));
  };


  getDepositDetailsFailure() {
    this.toastrFactory.error(this.localize.getLocalizedString("Failed to retrieve deposit details."), this.localize.getLocalizedString("Error"));
  };

  viewDeposit(objEncounter) {
    if (this.hasViewDepositAccess) {
      var urlToOpen = '#/BusinessCenter/Receivables/Deposits/' +
        this.encounter.LocationId +
        '/ViewDeposit/';
      if (objEncounter.DepositId) {
        urlToOpen += objEncounter.DepositId;
        this.tabLauncher.launchNewTab(urlToOpen);
      } else if (this.depositCreditTransactionId) {
        var launcher = this.tabLauncher;
        this.depositService
          .getDepositIdByCreditTransactionId({ 'creditTransactionId': this.depositCreditTransactionId })
          .$promise.then(function (res) {
            urlToOpen += res.Value;
            //$window.$windowScope = $scope;
            launcher.launchNewTab(urlToOpen);
          });
      }
    }
  };

  openClaimNotes() {
    if (this.hasViewClaimAccess && this.encounter && this.encounter.Claims && this.encounter.Claims.length == 1) {
      var claim = this.encounter.Claims[0];
      this.accountNoteFactory.openClaimNoteModal(claim, this.encounter.PersonId, this.encounter.LocationId, this.refreshPageDataForGrid);
    }
  };

}
