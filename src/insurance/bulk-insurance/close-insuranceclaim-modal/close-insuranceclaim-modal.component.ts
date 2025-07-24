import { CurrencyPipe } from '@angular/common';
import { Component, Inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { anyChanged } from '@progress/kendo-angular-common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'close-insuranceclaim-modal',
  templateUrl: './close-insuranceclaim-modal.component.html',
  styleUrls: ['./close-insuranceclaim-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CloseInsuranceclaimModalComponent implements OnInit {
 
  frm: FormGroup;
 
  @Input() closeClaimObject: any;
  @Input() uibModalInstance: any;
  @Input() parentScope: any;
  patientName = '';
  soarAuthAddCreditAdjustmentKey = 'soar-acct-cdtadj-add';
  alreadyApplyingAdjustment = false;
  note = '';
  noInsurancePayment = false;
  allProvidersList = [];
  loadingProviders = false;
  updateAgingDates = false;
  claimActionsValue = '1';
  recreateClaimSelected = false;
  accountOptionsValue = '';
  updateservicetransactions: boolean;
  claimActionsOptions = ['1', '2'];
  claimActionsLabels = [this.localize.getLocalizedString('Apply amount unpaid back to the account'), this.localize.getLocalizedString('Apply a negative adjustment to the account')];
  canReCreateClaim: boolean;
  hideCancel: boolean;
  hideAppliedPaymentWarning: boolean;
  createClaimSelected = false;
  isFromInsurancePayment: boolean;
  totalEstimatedInsurance: number;
  closeClaimButtonName: string;
  patientBenefitPlansDto = [];
  claimEntity: any;
  patientBenefitPlan: any;
  getEstInsurance: any;
  estInsurance: any;
  estInsurancePaid: any
  estInsuranceDtos: any
  totalUnpaidAmount: any
  showEstInsurance = false;
  claimInformationSummary: any
  individualDeductibleRemaining = null;
  familyDeductibleRemaining = null;
  amounts: any = { individualDeductibleRemainingtemp: null, familyDeductibleRemainingtemp: null };
  showCloseClaimErrorMessage: boolean = false;
  showContinueButton: boolean = false;
  estimateInsuranceOption = true;

  constructor(@Inject('toastrFactory') private toastrFactory,
    @Inject('PatientServices') private patientService,
    @Inject('localize') private localize,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('ClaimsService') private claimsService,
    @Inject('ModalDataFactory') private modalDataFactory,
    @Inject('UsersFactory') private usersFactory,
    @Inject('CloseClaimService') private closeClaimService,
    @Inject('ModalFactory') private modalFactory, private fb: FormBuilder,
    

    private translate: TranslateService,
    private readonly currencyPipe: CurrencyPipe
  ) {

  }
 
  ngOnInit() {
    this.frm = this.fb.group({
      radioOptions: ['1']
    });
    this.updateservicetransactions = this.closeClaimObject != null && this.closeClaimObject.isFromInsurancePayment ? true : false;
    this.canReCreateClaim = this.closeClaimObject.hasMultipleTransactions;
    this.hideCancel = this.closeClaimObject.fromPatitentSummary && !this.closeClaimObject.isPaymentApplied;
    this.hideAppliedPaymentWarning = !this.closeClaimObject.isPaymentApplied;
    this.isFromInsurancePayment = this.closeClaimObject.isFromInsurancePayment ? true : false;
    this.hideCancel = this.hideCancel || this.isFromInsurancePayment;
    this.totalEstimatedInsurance = this.closeClaimObject.TotalEstimatedInsurance ? this.closeClaimObject.TotalEstimatedInsurance : 0.00;
    this.closeClaimButtonName = this.closeClaimObject.isFromInsurancePayment ? this.closeClaimObject.closeClaimButtonName : this.localize.getLocalizedString('Close Claim');
    this.getPracticeProviders();
    this.getPatientBenefitPlan();
    this.originalClaimId = this.closeClaimObject.claimId;
  }
  
  userServicesGetSuccess(res) {
    this.loadingProviders = false;
    this.allProvidersList = res.Value;
  };
  
  userServicesGetFailure() {
    this.loadingProviders = false;
    this.allProvidersList = [];

    this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again', ['providers'])
      , this.localize.getLocalizedString('Server Error'));
  };
  getPatientBenefitPlan() {
    this.patientService.PatientBenefitPlan.get({ patientId: this.closeClaimObject.patientId, includeDeleted: true }).$promise.then((res) => {
      this.patientBenefitPlansDto = res.Value;
      this.getClaimEntity();
    },
      () => {
        this.toastrFactory.error(this.localize
          .getLocalizedString('Failed to retrieve list of {0}. Please try again.',
            ['patient benefit plans']),
          'Error');
      });
  };

  getClaimEntity() {
    this.claimsService.getClaimEntityByClaimId({ claimId: this.closeClaimObject.claimId }).$promise.then((res) => {
      this.getClaimEntitySuccess(res)
    }, () => {
      this.getClaimEntityFailure()
    });
  }
  getClaimEntitySuccess(response) {
    this.claimEntity = response.Value;
    if (this.patientBenefitPlansDto && this.patientBenefitPlansDto.length > 0) {
      this.patientBenefitPlan = this.patientBenefitPlansDto.filter((plan) => {
        return plan.PatientBenefitPlanId === this.claimEntity.PatientBenefitPlanId;
      });
    }
    this.getEstInsurance = this.patientService.Claim.getEstimatedInsuranceForClaim({ claimId: this.closeClaimObject.claimId }).$promise.then((res) => {
      this.estInsurance = 0;
      this.estInsurancePaid = 0;
      this.showEstInsurance = false;
      if (this.patientBenefitPlansDto && this.patientBenefitPlansDto.length > 0) {
        this.estInsuranceDtos = res.Value.filter((estInsDto) => {
          return estInsDto.PatientBenefitPlanId === this.patientBenefitPlan[0].PatientBenefitPlanId;
        });
      }
      this.filteredServiceTransactionIds = [];
      this.estInsuranceDtos.forEach(estIns => {
        this.estInsurancePaid += estIns.PaidAmount;
        this.estInsurance += estIns.EstInsurance;
        this.filteredServiceTransactionIds.push(estIns.ServiceTransactionId);
      });
      this.totalUnpaidAmount = this.estInsurance - this.estInsurancePaid;
      this.showEstInsurance = !isNaN(this.estInsurance);
      this.claimInformationSummary = this.closeClaimObject.isFromInsurancePayment
        ? this.localize.getLocalizedString('Patient') + '  ' + this.closeClaimObject.patientName + '  |  ' + this.closeClaimObject.DateOfServices + '  |  '
        + this.currencyPipe.transform(this.totalEstimatedInsurance) : '';
      this.getServiceTransactionsList(this.closeClaimObject.claimId);
    });
  };

  getClaimEntityFailure() {
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve claim entity'),
      this.localize.getLocalizedString('Error'));
  };
  getPracticeProviders() {
    this.loadingProviders = true;
    this.usersFactory.Users().then((res) => { this.userServicesGetSuccess(res) }
      , () => { this.userServicesGetFailure() });
  };
  validateIndvDeductible(data: any) {
    this.amounts.individualDeductibleRemainingtemp = data.NewValue;
    if (data.NewValue <= this.patientBenefitPlan[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.IndividualDeductible) 
        this.individualDeductibleRemaining = data.NewValue;
  };

  validateFamDeductible(data) {
    this.amounts.familyDeductibleRemainingtemp = data.NewValue;
    if (data.NewValue <= this.patientBenefitPlan[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.FamilyDeductible)
        this.familyDeductibleRemaining = data.NewValue;
  };

  originalClaimId: any;
  ClaimId: any;

  claimObject(claimId, reason, insurancepayment, recreateclaim, closeclaimadjustment, updateservicetransactions, isPaid) {
    this.ClaimId = claimId;
    return {
      ClaimId: claimId,
      Note: reason,
      NoInsurancePayment: insurancepayment,
      ReCreateClaim: recreateclaim,
      CloseClaimAdjustment: closeclaimadjustment,
      UpdateServiceTransactions: updateservicetransactions,
      IsPaid: isPaid,
      IndividualDeductibleRemaining: this.individualDeductibleRemaining,
      FamilyDeductibleRemaining: this.familyDeductibleRemaining,
      IsPrintedAndClosed: this.closeClaimObject.isPrintedAndClosed,
      UpdateAgingDates: undefined
    };
  }
  authAddCreditTransactionAccess() {
    return this.patSecurityService.IsAuthorizedByAbbreviation(this.soarAuthAddCreditAdjustmentKey);
  };

  filteredServiceTransactionIds = [];
  ServiceTransactionList: any;

  getInsurancePaymentServices() {
    this.ServiceTransactionList.array.forEach(serviceTransaction => {
      serviceTransaction.isForCloseClaim = true;
    });
    return this.ServiceTransactionList.filter((serviceTransaction) => {
      return this.filteredServiceTransactionIds.indexOf(serviceTransaction.ServiceTransactionId) !== -1;
    });
  };
  dataForModal: any;
  openAdjustmentModal() {
    if (this.authAddCreditTransactionAccess()) {
      var accountId;
      var accountMemberId;
      if (this.closeClaimObject.claimId) {
        if (!this.alreadyApplyingAdjustment) {
          this.alreadyApplyingAdjustment = true;
          this.patientService.Account.getByPersonId({ personId: this.closeClaimObject.patientId }).$promise.then((res) => {
            accountId = res.Value.AccountId;
            accountMemberId = res.Value.PersonAccountMember.AccountMemberId;
            this.dataForModal = {
              PatientAccountDetails: { AccountId: accountId, AccountMemberId: accountMemberId },
              DefaultSelectedIndex: 1,
              AllProviders: this.allProvidersList,
              BenefitPlanId: this.claimEntity.BenefitPlanId,
              claimAmount: this.estInsurance,
              serviceTransactionData: {
                serviceTransactions: this.filteredServiceTransactionIds,
                isForCloseClaim: true,
                unPaidAmout: parseFloat(this.totalUnpaidAmount.toFixed(2))
              },
              patientData: {
                patientId: this.closeClaimObject.patientId,
                patientName: this.closeClaimObject.patientName
              }
            };

            this.modalDataFactory.GetTransactionModalData(this.dataForModal, this.closeClaimObject.patientId).then((res) => { this.openModal(res) });
          });
        }
      }
    } else {
      //this.notifyNotAuthorized(this.soarAuthAddCreditAdjustmentKey);
    }
  };
  alreadyApplyingPayment = false;
  closing: boolean;
  openAdjustmentModalResultOk() {
    if (this.alreadyApplyingAdjustment)
      this.alreadyApplyingAdjustment = false;
    else
      this.alreadyApplyingPayment = false;

    var claimObj = this.claimObject(this.closeClaimObject.claimId, this.note, this.noInsurancePayment, this.recreateClaimSelected, this.claimActionsValue, this.updateservicetransactions, this.updateAgingDates);
    this.closeClaimService.update(claimObj).$promise.then(() => {
      this.closing = false;

      this.toastrFactory.success(this.localize.getLocalizedString('{0} closed successfully.', ['Claim']), 'Success');

      claimObj['recreate'] = this.createClaimSelected;
      this.getPlansAvail(claimObj);
    }, (err) => {
      this.closing = false;
      this.showContinueButton = this.closeClaimObject.hasMultipleTransactions; 
      this.hideCancel =  this.closeClaimObject.hasMultipleTransactions; 
      this.showCloseClaimErrorMessage = true;
      this.toastrFactory.error(this.localize.getLocalizedString('Failed to close {0}. Please try again.', ['Claim']), 'Error');
    });
  };
 
  openAdjustmentModalResultCancel() {
    if (this.alreadyApplyingAdjustment)
      this.alreadyApplyingAdjustment = false;
    else
      this.alreadyApplyingPayment = false;
    // when user selects cancel, apply the unpaid amount back to the patient account.
    this.claimActionsValue = '1';
    // this.recreateClaimSelected = false;
    var claimObj = this.claimObject(this.closeClaimObject.claimId, this.note, this.noInsurancePayment, this.recreateClaimSelected
      , this.claimActionsValue, this.updateservicetransactions, this.updateAgingDates);
    this.closeClaimService.update(claimObj).$promise.then((res) => {
      this.closing = false;

      this.toastrFactory.success(this.localize.getLocalizedString('{0} closed successfully.', ['Claim']), 'Success');

      claimObj['recreate'] = this.createClaimSelected;
      this.getPlansAvail(claimObj);
    }, () => {
        this.closing = false;
        this.showContinueButton = this.closeClaimObject.hasMultipleTransactions; 
        this.hideCancel =  this.closeClaimObject.hasMultipleTransactions; 
        this.showCloseClaimErrorMessage = true;
      this.toastrFactory.error(this.localize.getLocalizedString('Failed to close {0}. Please try again.', ['Claim']), 'Error');
    });
  }

  openModal(transactionModalData) {
    this.dataForModal = transactionModalData;
    this.modalFactory.TransactionModalBeta(this.dataForModal).then(() => { this.openAdjustmentModalResultOk() }, () => { this.openAdjustmentModalResultCancel() });
  };
  creatingClaim: boolean;
  deletingTransaction: boolean;
  closeClaim() {
    this.closing = true;
    if (this.closeClaimObject.claimId) {
      if (this.claimActionsValue === '2') {
        this.openAdjustmentModal();
      }

      else {
        if (this.recreateClaimSelected && this.closeClaimObject.fromPatitentSummary) {
          this.createClaimSelected = true;
          this.claimActionsValue = null;
        }
        var claimObj = this.claimObject(this.closeClaimObject.claimId,
          this.note,
          this.noInsurancePayment,
          this.recreateClaimSelected,
          this.claimActionsValue,
          this.updateservicetransactions,
          this.closeClaimObject.isFromInsurancePayment);

          this.closeClaimService.update({ calculateEstimatedInsurance: this.estimateInsuranceOption }, claimObj).$promise.then(() => {
          this.closing = false;

          this.toastrFactory.success(this.localize.getLocalizedString('{0} closed successfully.', ['Claim']), 'Success');

          if (!claimObj['ReCreateClaim']) {
            this.getPlansAvail(claimObj);
          } else {
            this.uibModalInstance.close(claimObj);
          }
        }, (err) => {
          this.closing = false;
          this.showContinueButton = this.closeClaimObject.hasMultipleTransactions; 
          this.hideCancel =  this.closeClaimObject.hasMultipleTransactions; 
          this.showCloseClaimErrorMessage = true;
          this.toastrFactory.error(this.localize.getLocalizedString('Failed to close {0}. Please try again.', ['Claim']), 'Error');
        });
      }
    }
    else {
      this.closing = false;
    }
  };
  
  getServiceTransactionsList(claimId) {
    {
      this.patientService.Claim.getServiceTransactionsByClaimId({ claimId: claimId }).$promise.then((res) => {
        var serviceTransactions = res.Value;
        // serviceTransactions.forEach((key, val) => {
        //   if (this.serviceToDelete == key.ServiceTransactionId) {
        //     serviceTransactions.splice(val, 1);
        //   }
        // });
        this.ServiceTransactionList = serviceTransactions;
      }, () => {
        this.toastrFactory.error(this.localize.getLocalizedString('An error has occurred while {0}', ['getting claims']), this.localize.getLocalizedString('Server Error'));
      });
    }
  };
   
  hasChanges() {
    return this.ClaimId !== this.originalClaimId;
  };
  cancel() {
    if (this.hasChanges()) {
      this.openDiscardModal();
    }
    else {
      this.cancelModal();
    }
  };
  plansAvail = [];
  cancelModal() {
    this.uibModalInstance.dismiss();
  }
  openDiscardModal() {
    this.modalFactory.CancelModal().then(() => { this.cancelModal() });
  };

  getPlansAvail(claimObj) {
    var listContainingClaimId = [];
    listContainingClaimId.push(this.closeClaimObject.claimId);
    this.patientService.PatientBenefitPlan.getBenefitPlansAvailableByClaimId(listContainingClaimId).$promise.then((res) => {
      this.getPlansAvailSuccess(res, claimObj);
    }, this.getPlansAvailFailure);
  };

  getPlansAvailSuccess(res, claimObj) {
    this.plansAvail = res.Value.PatientBenefitPlans;
    if (this.claimEntity.PatientBenefitPlanPriority === this.patientBenefitPlan[0].Priority && this.plansAvail && this.plansAvail.length > 0
      && this.plansAvail[this.plansAvail.length - 1].Priority > this.claimEntity.PatientBenefitPlanPriority) {
      this.openCloseRecreateModal(res, claimObj);
    } else {
      this.uibModalInstance.close(claimObj);
    }
  };
  getPlansAvailFailure() {
  };
  openCloseRecreateModal(res, claimObj) {
    res.Value.ClaimId = this.closeClaimObject.claimId;
    this.modalFactory.CloseClaimCancelModal(res).then((closed) => {
      this.getCreatedClaim(closed, claimObj);
    }, () => {
      this.uibModalInstance.close(claimObj);
    });
  };

  getCreatedClaim(claim, claimObj) {
    this.claimsService.getClaimById({
      claimId: claim.claims[0].ClaimId
    }).$promise.then((res) => {
      this.getClaimSuccess(claim, claimObj, res)
    }, () => { this.getClaimFailure() });
  };
  getClaimFailure() {
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to get new claim.'), 'Failure');
  };
  getClaimSuccess(oldClaimData, claimObj, response) {
    var newClaim = response.Value;
    var selectedClaimHasAdjustedEstimate = false;

    newClaim.ServiceTransactionToClaimPaymentDtos.forEach(serviceTransaction => {
      if (serviceTransaction.AdjustedEstimate > 0) {
        selectedClaimHasAdjustedEstimate = true;
      }
    });

    var selectedPlanAdjustsOff = oldClaimData.selectedPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.FeesIns === 2;
    var selectedPlanApplyAtCharge = oldClaimData.selectedPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.ApplyAdjustments === 1;

    if (oldClaimData.selectedPlan.Priority === 1 && selectedPlanAdjustsOff && selectedPlanApplyAtCharge && selectedClaimHasAdjustedEstimate) {
      this.handleAdjustmentModal(newClaim, claimObj);
    } else {
      this.uibModalInstance.close(claimObj);
    }
  };
  handleAdjustmentModal(claim, claimObj) {
    var title = this.localize.getLocalizedString('Fee Schedule Present');
    var message = this.localize.getLocalizedString('The patient\'s benefit plan requires a fee schedule adjustment. Would you like to complete the adjustment now?');
    var button1Text = this.localize.getLocalizedString('Yes');
    var button2Text = this.localize.getLocalizedString('No');
    this.modalFactory.ConfirmModal(title, message, button1Text, button2Text).then(this.openAdjustmentModalCustom(claim, claimObj), this.closeModals(claimObj));
  };

  closeModals(claimObj) {
    return () => {
      this.uibModalInstance.close(claimObj);
    };
  };
   
  openAdjustmentModalCustom(claim, claimObj) {
    return () => {
      var ids = claim.ServiceTransactionToClaimPaymentDtos.map((item) => {
        return item.ServiceTransactionId;
      });
      var sum = claim.ServiceTransactionToClaimPaymentDtos.reduce((sum, item) => { return sum + item.AdjustedEstimate; }, 0);

      this.dataForModal = {
        PatientAccountDetails: { AccountId: claim.AccountId },
        DefaultSelectedIndex: 1,
        AllProviders: this.allProvidersList,
        BenefitPlanId: claim.BenefitPlanId,
        claimAmount: 0,
        isFeeScheduleAdjustment: true,
        claimId: claim.ClaimId,
        serviceTransactionData: {
          serviceTransactions: ids,
          isForCloseClaim: true,
          unPaidAmout: sum
        },
        patientData: {
          patientId: claim.PatientId,
          patientName: claim.PatientName
        }
      };
      this.modalDataFactory.GetTransactionModalData(this.dataForModal, claim.PatientId)
        .then((result) => {
          this.modalFactory.TransactionModal(result,
            this.closeModals(claimObj),
            this.closeModals(claimObj));
        });
    };
  };

  toggleAgingDates() {
    this.updateAgingDates = !this.updateAgingDates;
  }
  toggleInsurancePayment() {
    this.noInsurancePayment = !this.noInsurancePayment;
  }
  toggleRecreateClaimSelected() {
    this.recreateClaimSelected = !this.recreateClaimSelected;
    if (this.recreateClaimSelected) {
      this.claimActionsValue = null;
      this.estimateInsuranceOption = true;
    }
    else    
      this.claimActionsValue = '1';
  }

  getEstimateInsuranceOption(value) {
    this.estimateInsuranceOption = value;
  }

  getClaimActionsOption(value) {
    this.claimActionsValue = value;
  }
}
