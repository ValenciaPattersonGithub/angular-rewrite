'use strict';
angular
  .module('Soar.BusinessCenter')
  .controller('InvalidClaimsModalController', [
    '$scope',
    '$location',
    '$uibModalInstance',
    'toastrFactory',
    'localize',
    'claimSubmissionResultsDto',
    'claimStatusDtos',
    'PatientServices',
    'tabLauncher',
    'ValidateClaimMessagesFactory',
    'FeatureFlagService',
    'FuseFlag',
    'ModalFactory',
    function (
      $scope,
      $location,
      $uibModalInstance,
      toastrFactory,
      localize,
      claimSubmissionResultsDto,
      claimStatusDtos,
      patientServices,
      tabLauncher,
      validateClaimMessagesFactory,
      featureFlagService,
      fuseFlag,
      modalFactory
    ) {
      var ctrl = this;
      ctrl.init = function () {
        $scope.isSubmissionMode = claimSubmissionResultsDto.IsSubmissionMode;
        $scope.claimSubmissionResultsDto = claimSubmissionResultsDto;
        if (!$scope.isSubmissionMode) {
          $scope.showValidationErrors = true;
        }
        $scope.missingClaims =
          claimSubmissionResultsDto.InvalidClaims.length +
          '/' +
          (claimSubmissionResultsDto.InvalidClaims.length +
            claimSubmissionResultsDto.ValidClaims.length);
        validateClaimMessagesFactory.SetupMessages(
          $scope.claimSubmissionResultsDto
        );
        featureFlagService.getOnce$(fuseFlag.EClaimSubmissionDisabledMessage).subscribe((value) => {
          ctrl.eclaimSubmissionDisabledMessage = value;
        });
      };

      $scope.getPatientName = function (first, middle, last, suffix) {
        var name = [];
        if (first) {
          name.push(first);
        }
        if (middle) {
          name.push(middle + '.');
        }
        if (last && !suffix) {
          name.push(last);
        }
        if (last && suffix) {
          name.push(last + ',');
        }
        if (suffix) {
          name.push(suffix);
        }
        return name.join(' ');
      };

      $scope.getDate = function (start, end) {
        var date = '';
        if (start && end) {
          var startDate = new Date(start);
          var endDate = new Date(end);
          if (
            moment(startDate).format('MM/DD/YYYY') ===
            moment(endDate).format('MM/DD/YYYY')
          ) {
            date = moment(startDate).format('MM/DD/YYYY');
          } else {
            date =
              moment(startDate).format('MM/DD/YYYY') +
              ' - ' +
              moment(endDate).format('MM/DD/YYYY');
          }
        }
        return date;
      };

      $scope.cancel = function () {
        $('body').removeClass('modal-open');
        $uibModalInstance.dismiss();
      };

      $scope.viewClaimAlerts = function () {
        tabLauncher.launchNewTab('#/BusinessCenter/Insurance/ClaimAlerts');
      };

      $scope.submitValidClaims = function () {
        patientServices.ClaimsAndPredeterminations.submit(
          claimSubmissionResultsDto.ValidClaims,
          function (response) {
            if (
              (response.Value && response.Value.ClaimStatusDtos === 0) ||
              response.Value.InvalidClaims.length > 0
            ) {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Submission Failed.  Validation Failed'
                ),
                'Failure'
              );
              $uibModalInstance.close();
            } else {
              angular.forEach(
                response.Value.ClaimStatusDtos,
                function (claimStatusDto) {
                  claimStatusDtos.push(claimStatusDto);
                }
              );
              $uibModalInstance.close(claimStatusDtos);
            }
          },
          function (response) {
            var failedProperty =
              response &&
              response.status === 400 &&
              response.data.InvalidProperties &&
              response.data.InvalidProperties[0];

            if (
              failedProperty &&
              failedProperty.PropertyName === 'Status' &&
              failedProperty.ValidationMessage.startsWith(
                'There are no eligible claims to submit'
              )
            ) {
              toastrFactory.error(
                localize.getLocalizedString(
                  'One or more claim(s) have already been submitted - please refresh the page to see the latest information.'
                ),
                localize.getLocalizedString('Server Error')
              );
            } else if (
                ctrl.eclaimSubmissionDisabledMessage &&
                failedProperty.ValidationMessage &&
                failedProperty.ValidationMessage.startsWith(
                  'Electronic Claim Submission is currently disabled'
                ) == true )
            {
              var title = 'Electronic Claim Submission';
              var message = ctrl.eclaimSubmissionDisabledMessage;
              var button1Text = 'OK';
              modalFactory.ConfirmModal(title, message, button1Text);
            } else {
              toastrFactory.error(
                localize.getLocalizedString('Submission Failed'),
                'Failure'
              );
            }

            $uibModalInstance.close();
          }
        );
      };
      ctrl.init();
    },
  ]);
