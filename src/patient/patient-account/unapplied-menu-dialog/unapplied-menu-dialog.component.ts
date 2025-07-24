import {
  Component,
  Input,
  OnInit,
  Inject,
  ViewEncapsulation,
  Output,
  EventEmitter,
} from "@angular/core";


import * as moment from 'moment';

declare let _: any;


@Component({
  selector: "unapplied-menu-dialog",
  templateUrl: "./unapplied-menu-dialog.component.html",
  styleUrls: ["./unapplied-menu-dialog.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class UnappliedMenuDialogComponent implements OnInit {
  constructor(
    @Inject("patSecurityService") private patSecurityService,
    @Inject('toastrFactory') private toastrFactory,

    @Inject("ListHelper") private listHelper,
    @Inject("AccountCreditTransactionFactory")
    private accountCreditTransactionFactory,
    @Inject("referenceDataService") private referenceDataService,
    @Inject("ModalDataFactory") private modalDataFactory,
    @Inject("ModalFactory") private modalFactory
  ) {}

  @Input() currentPatientId: any;
  @Input() refreshData1: any;
  @Input() unappliedTransactions: any;
  @Input() dataForBalanceDetailRow: any;
  showUnappliedDetail = false;
  providers: any;
  alreadyApplyingAdjustment = false;
  paymentApplied: any;
  dataForModal: any;

  soarAuthAddAccountPaymentKey = "soar-acct-aapmt-add";
  soarAuthAddCreditAdjustmentKey = "soar-acct-cdtadj-add";
  unappliedCreditTransactionDetailId: any;
  patientAccountDetails: any;

  @Output() refreshData = new EventEmitter();


  // Check if logged in user has view access to this page
  authAddAccountPaymentAccess() {
    return this.patSecurityService.IsAuthorizedByAbbreviation(
      this.soarAuthAddAccountPaymentKey
    );
  };

  authAddCreditTransactionAccess () {
    return this.patSecurityService.IsAuthorizedByAbbreviation(
      this.soarAuthAddCreditAdjustmentKey
    );
  };

  //Notify user, he is not authorized to access current area
  notifyNotAuthorized(authMessageKey) {
    let x = 
    this.toastrFactory.error(
      this.patSecurityService.generateMessage(authMessageKey),
      "Not Authorized"
    );

    return x;
  };

  ngOnInit() {
    if (this.dataForBalanceDetailRow) {
      this.patientAccountDetails = {
        AccountId: this.dataForBalanceDetailRow.PersonAccountMember.AccountId
          ? this.dataForBalanceDetailRow.PersonAccountMember.AccountId
          : "",
        AccountMemberId: this.dataForBalanceDetailRow.PersonAccountMember.AccountMemberId
          ? this.dataForBalanceDetailRow.PersonAccountMember.AccountMemberId
          : "",
      };
    }
    this.providers = this.referenceDataService.get(
      this.referenceDataService.entityNames.users
    );

    
  }
  // Function to open patient adjustment modal
  openAdjustmentModal(creditTransactionDto) {
    console.log("clcikec ");
    // Get the full credit transaction dto before applying if for only one row item. Do not load all necessary data on new transaction history page.
    if (
      this.unappliedTransactions &&
      this.unappliedTransactions.length === 1 &&
      !_.isUndefined(this.unappliedTransactions[0].ObjectId)
    ) {
      this.accountCreditTransactionFactory.getCreditTransaction(
        this.patientAccountDetails.AccountId,
        this.unappliedTransactions[0].ObjectId
      ).then((res) =>  {
        var creditTransaction = res.Value;

        // ****** need to create filter for getUnassignedCreditTransactionDetailAmountFilter */
        creditTransaction.UnassignedAmount = this.getUnAssignedAmount(creditTransaction.CreditTransactionDetails);
        this.setupModalData([creditTransaction]);
      });
    } else {
      // If passing multiple transactions or has old data structure then continue (Apply All on account summary or old tx history page)
      this.setupModalData(this.unappliedTransactions);
    }
  }
  setupModalData(creditTransactions) {
    var dataForModal = {
      PatientAccountDetails: this.patientAccountDetails,
      DefaultSelectedIndex: -1,
      AllProviders: this.providers,
      UnappliedTransactions: creditTransactions,
      unappliedCreditTransactionDetailId: this
        .unappliedCreditTransactionDetailId,
    };
    var hasAdjustment = this.listHelper.findItemByFieldValue(
      this.unappliedTransactions,
      "TransactionTypeId",
      4
    );
    var hasPayments = this.listHelper.findItemByFieldValue(
      this.unappliedTransactions,
      "TransactionTypeId",
      2
    );
    var hasInsurancePayment = this.listHelper.findItemByFieldValue(
      this.unappliedTransactions,
      "TransactionTypeId",
      3
    );
    if (hasAdjustment && !this.authAddCreditTransactionAccess()) {
      this.notifyNotAuthorized(this.soarAuthAddCreditAdjustmentKey);
    } else if (hasPayments && !this.authAddAccountPaymentAccess()) {
      this.notifyNotAuthorized(this.soarAuthAddAccountPaymentKey);
    } else if (hasInsurancePayment && !this.authAddAccountPaymentAccess()) {
      this.notifyNotAuthorized(this.soarAuthAddAccountPaymentKey);
    } else if (
      (hasAdjustment || hasPayments || hasInsurancePayment) &&
      !this.alreadyApplyingAdjustment
    ) {
      this.alreadyApplyingAdjustment = true;
     
      this.modalDataFactory
        .GetTransactionModalData(
          dataForModal, this.currentPatientId, true
        )
        .then((res) => {
          this.openModal(res);
        });
    }
  }

  //Function to open adjustment modal
  openModal(transactionModalData) {
    this.dataForModal = transactionModalData;
    this.dataForModal.AllProviders = transactionModalData.providersList.Value;
    this.modalFactory.TransactionModalBeta(this.dataForModal).then(() => { this.openAdjustmentModalResultOk() }, () => { this.openAdjustmentModalResultCancel() });

  }
  
  getUnAssignedAmount(creditTransactionDetails) {
    let unassignedAmount = 0;
    _.forEach(creditTransactionDetails, creditTransactionDetail => {
        if (!creditTransactionDetail.IsDeleted && _.isEmpty(creditTransactionDetail.AppliedToServiceTransationId) && _.isEmpty(creditTransactionDetail.AppliedToDebitTransactionId))
            unassignedAmount += creditTransactionDetail.Amount;
    });
    return parseFloat(unassignedAmount.toFixed(2));
  }
  //Handle Ok callback from adjustment dialog
  openAdjustmentModalResultOk() {
    // $rootScope.paymentApplied = false;
    this.paymentApplied = false;
    this.refreshData.emit();
    // $scope.refreshData();
    this.alreadyApplyingAdjustment = false;
  }

  openAdjustmentModalResultCancel() {
    this.alreadyApplyingAdjustment = false;
    if (this.paymentApplied) {
      this.paymentApplied = false;
      this.refreshData.emit();
      // $scope.refreshData();
    }
  }

  getTotalUnappliedAmount() {
    return _.sumBy(this.unappliedTransactions, (t) => t.UnassignedAmount);
  };
}
