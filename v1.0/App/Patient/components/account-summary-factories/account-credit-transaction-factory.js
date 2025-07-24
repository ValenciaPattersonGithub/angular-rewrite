'use strict';

angular.module('Soar.Patient').factory('AccountCreditTransactionFactory', [
  '$q',
  'ClaimsService',
  'tabLauncher',
  'patSecurityService',
  'toastrFactory',
  'PatientServices',
  'localize',
  'FinancialService',
  'userSettingsDataService',
  function (
    $q,
    claimsService,
    tabLauncher,
    patSecurityService,
    toastrFactory,
    patientServices,
    localize,
    financialService,
    userSettingsDataService
  ) {
    var factory = this;
    var soarAuthEraViewKey = 'soar-acct-aipmt-add';
    var soarAuthCreditViewKey = 'soar-acct-crdtrx-view';
    var soarAuthAcctPayViewKey = 'soar-acct-aapmt-view';

    factory.getCreditTransaction = function (accountId, creditTransactionId) {
      if (
        !patSecurityService.IsAuthorizedByAbbreviation(soarAuthCreditViewKey)
      ) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthEraViewKey),
          'Not Authorized'
        );
        return;
      }
      var defer = $q.defer();
      var promise = defer.promise;
      patientServices.CreditTransactions.getCreditTransactionByIdForAccount(
        { accountId: accountId, creditTransactionId: creditTransactionId },
        function (res) {
          promise = $.extend(promise, {
            values: res.Value,
          });
          defer.resolve(res);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('An error has occurred while {0}', [
              'loading transaction',
            ]),
            localize.getLocalizedString('Server Error')
          );
        }
      );
      return promise;
    };

    factory.viewEob = function (eraId, claimId, personId) {
      if (!patSecurityService.IsAuthorizedByAbbreviation(soarAuthEraViewKey)) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthEraViewKey),
          'Not Authorized'
        );
        return;
      }
      var promises = [
        patientServices.Patients.get({ Id: personId }).$promise,
        claimsService.getClaimEntityByClaimId({ claimId: claimId }).$promise,
      ];
      $q.all(promises).then(function (res) {
        var url =
          '#/BusinessCenter/Insurance/ERA/' +
          eraId +
          '/Claim/' +
          res[1].Value.ClaimCommonId +
          '?carrier=' +
          '' +
          '&patient=' +
          res[0].Value.PatientCode;

        tabLauncher.launchNewTab(url);
      });
    };

    factory.printReceipt = function (transactionToPrint, patientData) {
      if (
        !patSecurityService.IsAuthorizedByAbbreviation(soarAuthAcctPayViewKey)
      ) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthAcctPayViewKey),
          'Not Authorized'
        );
        return;
      }
      var promises = [
        patientServices.Patients.getWithoutAccount({
          Id: patientData.ResponsiblePersonId,
        }).$promise,
        patientServices.CreditTransactions.getCreditTransactionByIdForAccount({
          accountId: patientData.PersonAccount.AccountId,
          creditTransactionId: transactionToPrint.CreditTransactionId,
        }).$promise,
        patientServices.Account.getAccountMembersDetailByAccountId({
          accountId: patientData.PersonAccount.AccountId,
        }).$promise,
      ];
      $q.all(promises).then(function (res) {
        if (res) {
          var transaction = {};
          var balances = financialService.calculateAccountAndInsuranceBalances(
            res[2].Value,
            patientData.PatientId
          );
          transaction.AccountId = patientData.PersonAccount.AccountId;
          transaction.CreditTransactionId =
            transactionToPrint.CreditTransactionId;
          transaction.Location = transactionToPrint.Location;
          transaction.ResponsiblePerson = res[0].Value;
          transaction.IsCreditCardPayment = false;
          transaction.IsLocationPaymentGatewayEnabled =
            transactionToPrint.IsLocationPaymentGatewayEnabled;
          transaction.CurrentBalance =
            transactionToPrint.Balance -
            balances.TotalInsurance +
            Math.abs(transactionToPrint.Amount);
          transaction.AdjustmentType = transactionToPrint.TransactionType;
          transaction.Description = transactionToPrint.Description;
          transaction.DateEntered = transactionToPrint.DateEntered;
          transaction.CreditTransactionDetails =
            res[1].Value.CreditTransactionDetails;
          transaction.Amount = transactionToPrint.Amount;
          transaction.PatientName = transactionToPrint.PatientName;

          localStorage.setItem(
            'acctPaymentReceipt_' + transaction.CreditTransactionId,
            JSON.stringify(transaction)
          );
          let patientPath = '#/Patient/';
          tabLauncher.launchNewTab(
            patientPath +
              transaction.CreditTransactionId +
              '/Account/PrintReceipt/'
          );
        }
      });
    };
    return {
      getCreditTransaction: factory.getCreditTransaction,
      viewEob: factory.viewEob,
      printReceipt: factory.printReceipt,
    };
  },
]);
