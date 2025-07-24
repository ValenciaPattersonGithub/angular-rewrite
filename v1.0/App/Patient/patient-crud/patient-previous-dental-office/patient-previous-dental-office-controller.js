angular
  .module('Soar.Patient')
  .controller('PatientPreviousDentalOfficeController', [
    '$scope',
    '$routeParams',
    '$filter',
    '$location',
    'localize',
    '$timeout',
    'toastrFactory',
    'PatientServices',
    function (
      $scope,
      $routeParams,
      $filter,
      $location,
      localize,
      $timeout,
      toastrFactory,
      patientServices
    ) {
      // #region Initialization
      $scope.isContactCollapsed = true;
      $scope.isNoteCollapsed = true;
      $scope.editMode = $routeParams.patientId ? true : false;

      // Stub out temp alert
      $scope.patientPreviousDentalOffice = {
        PreviousDentalOfficeId: null,
        PatientId: null,
        Name: null,
        PhoneNumber: null,
        Address: {
          AddressLine1: null,
          AddressLine2: null,
          City: null,
          State: null,
          ZipCode: null,
        },
        Notes: null,
      };

      // #endregion Initialization

      // #region Get Previous Dentist

      if ($scope.editMode) {
        $scope.GetPatientPreviousDentalOffice = function () {
          patientServices.PreviousDentalOffice.get(
            { Id: $routeParams.patientId },

            // success - call success to handle results
            $scope.GetPatientPreviousDentalOfficeSuccess,
            $scope.GetPatientPreviousDentalOfficeFail
          );
        };

        $scope.GetPatientPreviousDentalOfficeSuccess = function (res) {
          $scope.patientPreviousDentalOffice = res.Value;
        };

        $scope.GetPatientPreviousDentalOfficeFail = function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the previous dentist information. Refresh the page to try again.'
            ),
            localize.getLocalizedString('Error')
          );
        };

        $scope.GetPatientPreviousDentalOffice();
      }

      // #endregion Get Previous Dentist
    },
  ]);
