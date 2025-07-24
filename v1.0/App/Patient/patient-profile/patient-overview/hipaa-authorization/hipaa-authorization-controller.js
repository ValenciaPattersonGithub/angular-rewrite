'use strict';
angular.module('Soar.Patient').controller('HipaaAuthorizationController', [
  '$scope',
  '$location',
  'ListHelper',
  'localize',
  '$timeout',
  '$routeParams',
  'HipaaAuthorizationFactory',
  'tabLauncher',
  'toastrFactory',
  'patSecurityService',
  function (
    $scope,
    $location,
    listHelper,
    localize,
    $timeout,
    $routeParams,
    hipaaAuthorizationFactory,
    tabLauncher,
    toastrFactory,
    patSecurityService
  ) {
    var ctrl = this;
    $scope.mostRecentHistory = {};
    // can update HIPAA Authorization to new form
    $scope.canUpdateForm = false;
    // can view current HIPAA Authorization
    $scope.canViewForm = false;
    $scope.expandForm = false;
    $scope.loadingHipaaAuthorizationMessage = localize.getLocalizedString(
      'No HIPAA Authorization form on file.'
    );

    $scope.title = 'HIPAA Authorization';
    $scope.isNewForm = false;

    //#region access

    ctrl.getAccess = function () {
      $scope.access = hipaaAuthorizationFactory.access();
      if (!$scope.access.View) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-per-perhst-view'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      }
    };
    ctrl.getAccess();

    //#endregion

    ctrl.$onInit = function () {
      $scope.patientId = $location.search().patientId;
      var type = $location.search().type;
      if (type === 'new') {
        $scope.isNewForm = true;
        //$scope.title = 'New HIPAA Authorization Form';
        $scope.getNewHipaaAuthorizationForm();
      } else if (type === 'view') {
        //$scope.title = 'View HIPAA Authorization Form';
        $scope.isNewForm = false;
        $scope.getHipaaAuthorizationForm();
      }
    };

    // gets a pristine version of the HIPAA Authorization form for adding answers
    $scope.getNewHipaaAuthorizationForm = function () {
      $scope.loadingNewHipaaAuthorizationForm = true;
      hipaaAuthorizationFactory.create().then(function (res) {
        var newHipaaAuthorizationForm = res.Value;
        $scope.formSections = newHipaaAuthorizationForm;
        newHipaaAuthorizationForm.DateModified = moment();
        hipaaAuthorizationFactory.SetNewHipaaAuthorizationForm(
          newHipaaAuthorizationForm
        );
        hipaaAuthorizationFactory.SetActiveHipaaAuthorizationForm(false);
        hipaaAuthorizationFactory.SetViewingForm(false);
        $scope.loadingNewHipaaAuthorizationForm = false;
        $scope.canUpdateForm = true;
      });
    };

    // get the current HIPAA Authorization if it exists
    $scope.getHipaaAuthorizationForm = function () {
      $scope.loadingHipaaAuthorizationForm = true;
      hipaaAuthorizationFactory.getById($scope.patientId).then(function (res) {
        if (res.Value === null) {
          // no form on file
          $scope.loadingHipaaAuthorizationForm = false;
          $scope.canViewForm = $scope.hasForm = false;
          $scope.getNewHipaaAuthorizationForm();
        } else {
          // set active hipaa authorization form
          $scope.hipaaAuthorizationForm = res.Value;
          $scope.formSections = $scope.hipaaAuthorizationForm;

          //hipaaAuthorizationFactory.SetActiveHipaaAuthorizationForm($scope.hipaaAuthorizationForm);

          hipaaAuthorizationFactory.SetNewHipaaAuthorizationForm(
            $scope.formSections
          );
          hipaaAuthorizationFactory.SetActiveHipaaAuthorizationForm(false);
          hipaaAuthorizationFactory.SetViewingForm(true);

          $scope.loadingHipaaAuthorizationForm = false;
          $scope.canUpdateForm = $scope.canViewForm = $scope.hasForm = true;
          $scope.canUpdateForm = true;
        }
      });
    };

    //$scope.updateHipaaAuthorization = function () {
    //    if ($scope.canUpdateForm) {
    //        $scope.loadingHipaaAuthorizationForm = true;
    //        $timeout(function () {
    //            $scope.$apply();
    //        });
    //        $scope.viewSettings.expandView = true;
    //        $scope.viewSettings.activeExpand = 5;
    //        hipaaAuthorizationFactory.SetUpdatingForm(true);
    //        hipaaAuthorizationFactory.SetViewingForm(false);

    //    }
    //}
    $scope.viewHipaaAuthorization = function () {
      if ($scope.canViewForm) {
        $scope.loadingHipaaAuthorizationForm = true;
        $timeout(function () {
          $scope.$apply();
        });
        $scope.loadingHipaaAuthorizationForm = true;
        $scope.viewSettings.expandView = true;
        $scope.viewSettings.activeExpand = 5;
        hipaaAuthorizationFactory.SetUpdatingForm(false);
        hipaaAuthorizationFactory.SetViewingForm(true);
      }
    };

    ctrl.$onInit();
  },
]);
