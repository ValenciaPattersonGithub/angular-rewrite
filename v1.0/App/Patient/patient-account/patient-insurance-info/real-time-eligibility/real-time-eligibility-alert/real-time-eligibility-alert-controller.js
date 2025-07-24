angular
  .module('Soar.Patient')
  .controller('RealTimeEligibilityAlertController', [
    '$scope',
    '$uibModalInstance',
    'localize',
    'data',
    function ($scope, $uibModalInstance, localize, data) {
      var ctrl = this;

      $scope.close = function () {
        $uibModalInstance.close();
      };

      $scope.init = function () {
        var invalidProperties = data.data.InvalidProperties;
        $scope.data = _.uniqBy(invalidProperties, function (item) {
          return item.PropertyName;
        });
        angular.forEach($scope.data, function (error) {
          if (data.status === 500) {
            error.Message =
              'Call to RTE endpoint could not be completed successfully. Please close this window and try again.';
          } else {
            var message = _.find(messages, function (msg) {
              return msg.PropertyName === error.PropertyName;
            });
            if (message) {
              error.Message = message.Message;
              error.Message = error.Message.replace(', {0},', '');
            } else {
              // catch all for unpredictable exceptions
              error.Message =
                "Server Error: There is invalid data with the patient's insurance information. Please check the policy holder ID, carrier and benefit plan information to ensure you have valid data.";
            }
          }
        });
      };

      var messages = [
        {
          PropertyName: 'PayerIdentifier',
          Message: localize.getLocalizedString(
            'The Carrier does not have a valid Payer ID.  Please update within the Carrier Page.'
          ),
        },
        {
          PropertyName: 'PayerIdentifierInvalid',
          Message: localize.getLocalizedString(
            'The Carrier has a Payer ID of 06126 (Print to paper).  Please update within the Carrier Page.'
          ),
        },
        {
          PropertyName: 'MissingPreferredProvider',
          Message: localize.getLocalizedString(
            "The patient does not have a Preferred Dentist assigned.  Please update the patient's profile."
          ),
        },
        {
          PropertyName: 'BillingProviderNpi',
          Message: localize.getLocalizedString(
            "The Billing Dentist or dental entity's NPI is missing and must be updated from the Location Page."
          ),
        },
        {
          PropertyName: 'BillingProviderTaxId',
          Message: localize.getLocalizedString(
            "The Billing Dentist or dental entity's Tax ID is missing and must be updated from the Location Page."
          ),
        },
        {
          PropertyName: 'RenderingProviderNpi',
          Message: localize.getLocalizedString(
            "The Treating Dentist's NPI is missing and must be updated from their Team Member page."
          ),
        },
        {
          PropertyName: 'PolicyHolderDateOfBirth',
          Message: localize.getLocalizedString(
            "The policy holder/subscriber does not have a valid Date of Birth.  Please update the policy holder's profile Insurance Information."
          ),
        },
        {
          PropertyName: 'PatientDateOfBirth',
          Message: localize.getLocalizedString(
            "The patient does not have a valid Date of Birth.  Please update the patient's profile."
          ),
        },
        {
          PropertyName: 'InsuranceMemberId',
          Message: localize.getLocalizedString(
            "The policy holder/subscriber does not have a valid Policy Holder ID.  Please update the policy holder's profile Insurance Information."
          ),
        },
        {
          PropertyName: 'DentiCalPin',
          Message: localize.getLocalizedString(
            "A Denti-Cal PIN is required when checking eligibility with Carrier using Payer ID 94146. Please update the Preferred Dentist's Team Member Page."
          ),
        },
      ];

      $scope.init();
    },
  ]);
