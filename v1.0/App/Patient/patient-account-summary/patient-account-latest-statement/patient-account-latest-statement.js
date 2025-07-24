'use strict';
angular
  .module('Soar.Patient')
  .controller('PatientAccountLatestStatementController', [
    '$scope',
    '$sce',
    'PatientServices',
    'toastrFactory',
    'localize',
    function ($scope, $sce, patientServices, toastrFactory, localize) {
      var ctrl = this;
      $scope.isAtLeastOneStatement = true;

      ctrl.getStatementData = function () {
        var accountId = $scope.person.PersonAccount.AccountId;
        patientServices.AccountStatements.GetAccountStatementByAccountId(
          { accountId: accountId },
          ctrl.getAccountStatementSuccess,
          ctrl.getAccountStatementFailure
        );
      };

      ctrl.getAccountStatementSuccess = function (data) {
        if (data.Value.length > 0) {
          var stmts = _(data.Value)
            .chain()
            .filter(function (stmt) {
              return (
                (stmt.SubmissionMethod === 1 || stmt.SubmissionMethod === 2) &&
                stmt.IsSelectedOnBatch
              );
            })
            .sortBy('CreatedDate')
            .value();
          if (stmts.length > 0) {
            $scope.accountStatementDto = stmts[stmts.length - 1];
            $scope.statementDate = $scope.accountStatementDto.CreatedDate;
            var accountStmtData = JSON.parse(
              $scope.accountStatementDto.AccountStatementData
            );
            $scope.accountStatementDto.TotalCharges =
              accountStmtData.DisplayPatientBalance;
            ctrl.accountStatementDtoForPdf = $scope.accountStatementDto;
          }
        }
      };

      ctrl.getAccountStatementPdf = function () {
        patientServices.AccountStatementSettings.GetAccountStatementPdf(
          '_soarapi_/accounts/accountstatement/' +
            ctrl.accountStatementDtoForPdf.AccountStatementId +
            '/GetAccountStatementPdf'
        ).then(
          ctrl.accountStatementPdfSuccess,
          ctrl.accountStatementPdfFailure
        );
      };

      ctrl.accountStatementPdfSuccess = function (res) {
        var file = new Blob([res.data], {
          type: 'application/pdf',
        });

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(
            file,
            ctrl.accountStatementDtoForPdf.AccountStatementId + '.pdf'
          );
        } else {
          var fileUrl = URL.createObjectURL(file);
          $scope.pdfContent = $sce.trustAsResourceUrl(fileUrl);
          var theURL = $scope.pdfContent.toString();
          var myWindow = window.open(theURL);
        }
      };

      ctrl.accountStatementPdfFailure = function (error) {
        if (error) {
          toastrFactory.error(
            localize.getLocalizedString(
              error.status == 400
                ? 'Pdf template form is not available for generating PDF form'
                : error.data.InvalidProperties[0].ValidationMessage
            ),
            localize.getLocalizedString('Error')
          );
        }
      };

      ctrl.getAccountStatementFailure = function (error) {
        //if (!(error && error.status === 409)) {
        //    toastrFactory.error(localize
        //        .getLocalizedString(error.data.InvalidProperties[0].ValidationMessage),
        //        localize.getLocalizedString("Error"));
        //}
        $scope.isAtLeastOneStatement = false;
      };

      $scope.loading = false;

      ctrl.getStatementData();

      $scope.viewLatestStatement = function () {
        if ($scope.isAtLeastOneStatement) {
          ctrl.getAccountStatementPdf();
        }
      };
    },
  ]);
