'use strict';

var patientModule = angular.module('Soar.Patient');

patientModule.controller('PatientAppointmentsTabController', [
  '$scope',
  '$routeParams',
  '$filter',
  'PatientAppointmentTextService',
  'PatientServices',
  'toastrFactory',
  'localize',
  'PatientPreventiveCareFactory',
  'ListHelper',
  'PatientValidationFactory',
  'PatientAppointmentsFactory',
  'patSecurityService',
  '$location',
  PatientAppointmentsTabController,
]);
function PatientAppointmentsTabController(
  $scope,
  $routeParams,
  $filter,
  patientAppointmentTextService,
  patientServices,
  toastrFactory,
  localize,
  patientPreventiveCareFactory,
  listHelper,
  patientValidationFactory,
  patientAppointmentsFactory,
  patSecurityService,
  $location
) {
  BaseCtrl.call(this, $scope, 'PatientAppointmentsTabController');
  var ctrl = this;
  $scope.showAllAccountMembers = false;
  $scope.appointmentHistory = [];

  // load text for the view
  $scope.patientAppointmentText = patientAppointmentTextService.getPatientAppointmentText();

  //#region access

  ctrl.getAccess = function () {
    $scope.access = patientAppointmentsFactory.access();
    if (!$scope.access.View) {
      toastrFactory.error(
        patSecurityService.generateMessage('soar-sch-sptapt-view'),
        'Not Authorized'
      );
      event.preventDefault();
      $location.path('/');
    }
  };
  ctrl.getAccess();

  //#endregion

  ctrl.$onInit = function () {
    if ($scope.patient.Data) {
      document.title =
        $scope.patient.Data.PatientCode +
        ' - ' +
        localize.getLocalizedString('Appointments');
    }
    $scope.appointments = null;
    $scope.allAccountMembersText =
      $scope.patientAppointmentText.allAccountMembers;
    // making a copy to keep changes here from the affecting the header, etc.
    $scope.patientCopy = angular.copy($scope.patient);
    $scope.patientId =
      $scope.patientCopy.Data != null
        ? $scope.patientCopy.Data.PatientId
        : null;
    $scope.accountId =
      $scope.patientCopy.Data != null &&
      $scope.patientCopy.Data.PersonAccount != null
        ? $scope.patientCopy.Data.PersonAccount.AccountId
        : null;
    ctrl.getAllAccountMembers();
    ctrl.retrieveData();
  };

  // need to fall back on emit here, updating isolate scope object would not work
  // emitted by patient appt controller to keep other panels in sync when there are changes made there
  $scope.$on(
    'soar:appt-updated-via-pat-appt-ctrl',
    function (event, appointment, isDelete) {
      var index;
      angular.forEach($scope.appointments, function (appt, $index) {
        if (appt.Appointment.AppointmentId === appointment.AppointmentId) {
          if (isDelete) {
            index = $index;
          } else {
            // may not need this...
            // this update is needed for the history panel
            appt.Appointment.DeletedReason = appointment.DeletedReason;
          }
        }
      });
      if (index >= 0) {
        // this update is needed for the history panel
        $scope.appointments.splice(index, 1);
      }
      // check factory property to notify that the missed and cancelled appointments counts should be reloaded
      if (patientAppointmentsFactory.LoadHistory === true) {
        ctrl.getAppointmentsHistory();
        // reset property
        patientAppointmentsFactory.setLoadHistory(false);
      }
      $scope.$broadcast(
        'soar:appt-updated-via-pat-appt-tab',
        appointment,
        isDelete
      );
    }
  );

  // passed to the profile section directive via actions, used to toggle edit mode
  ctrl.editClickedFunction = function () {
    $scope.$broadcast('soar:edit-rotation-clicked');
  };

  ctrl.showErrorMessage = function (message) {
    toastrFactory.error(message, $scope.patientAppointmentText.error);
  };

  // making the api call to get all the patients on the account
  ctrl.getAllAccountMembers = function () {
    if ($scope.patientCopy.Data.PersonAccount) {
      patientServices.Account.getAllAccountMembersByAccountId(
        { accountId: $scope.patientCopy.Data.PersonAccount.AccountId },
        ctrl.getAccountMembersSuccess,
        ctrl.getAccountMembersFailure
      );
    }
  };

  // tacking on all the custom properties needed for the panels/display
  ctrl.createCustomProperties = function () {
    angular.forEach($scope.allAccountMembers, function (item) {
      item.$$DisplayName = item.FirstName + ' ' + item.LastName;
      if (!_.isNil($scope.patientAppointmentText)) {
        item.$$HealthPanelTitle =
          item.FirstName + "'s " + $scope.patientAppointmentText.history;
        item.$$PrevCarePanelTitle =
          item.FirstName + "'s " + $scope.patientAppointmentText.preventiveCare;
        item.$$PreventiveCareActions = [
          {
            Function: function () {
              $scope.$broadcast('soar:edit-rotation-clicked', item.PatientId);
            },
            amfa: 'soar-per-perps-view',
            Text: $scope.patientAppointmentText.edit,
          },
        ];
      }
      item.$$PatientSince = '';
      item.$$HistoryActions = [{ Function: function () {}, Text: '' }];
      item.$$ServicesDue = [];
    });
  };

  // success handler for get all account members api call, setting custom properties, visible flag, creating all account members option
  ctrl.getAccountMembersSuccess = function (res) {
    if (res && res.Value && !_.isNil($scope.patientCopy)) {
      $scope.allAccountMembers = res.Value;
      ctrl.createCustomProperties();
      $scope.allAccountMembers.unshift({
        $$DisplayName: $scope.allAccountMembersText,
        FirstName: '',
      });
      ctrl.setVisibleFlags($scope.patientCopy.Data.PatientId);
      ctrl.setMemberTitles();
      var selected = null;
      if (
        !angular.isUndefined($routeParams.selected) &&
        $routeParams.selected == 'All'
      ) {
        angular.forEach($scope.allAccountMembers, function (account) {
          if (account.$$DisplayName == $scope.allAccountMembersText) {
            selected = account;
            return;
          }
        });
        selected = selected ? selected : $scope.patientCopy.Data;
      } else {
        selected = $scope.patientCopy.Data;
      }
      $scope.validateAccountMember(selected);
      ctrl.getServicesDue();
    }
  };

  // failure handler for get all account members api call
  ctrl.getAccountMembersFailure = function () {
    toastrFactory.error(
      $scope.patientAppointmentText.errorGettingAllAccountMembers,
      $scope.patientAppointmentText.error
    );
  };

  // helping method for setting $$Visible flag, used to hide and show panels based on dropdown selection
  ctrl.setVisibleFlags = function (patientId) {
    angular.forEach($scope.allAccountMembers, function (member) {
      if (!patientId) {
        member.$$Visible = true;
      } else {
        if (member.PatientId === patientId) {
          member.$$Visible = true;
        } else {
          member.$$Visible = false;
        }
      }
    });
  };

  // click handler used by the dropdown, setting patient id to zero tells the appt directive to show all account members
  $scope.accountMemberSelected = function (member) {
    if (member.$$DisplayName === $scope.allAccountMembersText) {
      $scope.patientCopy.Data = {};
      $scope.patientCopy.Data.PatientId = 0;
      $scope.patientCopy.Data.$$DisplayName = $scope.allAccountMembersText;
      ctrl.setVisibleFlags();
      $scope.showAllAccountMembers = true;
    } else {
      $scope.patientCopy.Data = member;
      $scope.patientCopy.Data.$$DisplayName =
        member.FirstName + ' ' + member.LastName;
      ctrl.setVisibleFlags($scope.patientCopy.Data.PatientId);
      $scope.showAllAccountMembers = false;
    }
    ctrl.getAppointmentsHistory();
  };

  // passed in to the appt history directive to allow dynamic updating of panel title 'Patient since *'
  $scope.titleUpdated = function (patientId, patientSince) {
    angular.forEach($scope.allAccountMembers, function (item) {
      if (item.PatientId === patientId) {
        item.$$PatientSince = patientSince;
        if (item.$$PatientSince) {
          var historyPanelTitleText = localize.getLocalizedString(
            'Patient since {0}',
            [item.$$PatientSince]
          );
          item.$$HistoryActions = [
            { Function: function () {}, Text: historyPanelTitleText },
          ];
        }
      }
    });
  };

  ctrl.appointmentRetrievalSuccess = function (result) {
    $scope.appointments = result.Value;
    ctrl.setMemberTitles();
  };

  ctrl.appointmentRetrievalFailed = function (error) {
    ctrl.showErrorMessage(
      $scope.patientAppointmentText.failedToRetrieveListOfAppointmentsForAccount
    );
  };

  ctrl.retrieveData = function () {
    if ($scope.accountId != null) {
      patientServices.PatientAppointment.AppointmentsForAccountRefactor(
        { AccountId: $scope.accountId },
        ctrl.appointmentRetrievalSuccess,
        ctrl.appointmentRetrievalFailed
      );
    } else {
      patientServices.PatientAppointment.AppointmentsForAccountRefactor(
        { PersonId: $scope.patientCopy.Data.PatientId },
        ctrl.appointmentRetrievalSuccess,
        ctrl.appointmentRetrievalFailed
      );
    }
  };

  // getting services due for all account members
  ctrl.getServicesDue = function () {
    patientPreventiveCareFactory
      .GetAllServicesDueForAccount($scope.patientId)
      .then(function (res) {
        if (res && res.Value) {
          angular.forEach(res.Value, function (service) {
            var member = listHelper.findItemByFieldValue(
              $scope.allAccountMembers,
              'PatientId',
              service.PatientId
            );
            if (member) {
              member.$$ServicesDue.push(service);
            }
          });
        }
      });
  };

  $scope.modifyPreventiveCareViewAccess = {
    Value: 'soar-per-perps-vovr',
  };

  $scope.modifyPreventiveCareEditAccess = {
    Value: 'soar-per-perps-aovr',
  };

  $scope.preventiveCareTitle = $scope.patientAppointmentText.preventiveCare;

  $scope.validateAccountMember = function (member) {
    if (member && member.PatientId) {
      patientValidationFactory
        .PatientSearchValidation(member)
        .then(function (res) {
          var patientInfo = res;
          if (
            !patientInfo.authorization
              .UserIsAuthorizedToAtLeastOnePatientLocation
          ) {
            patientValidationFactory.LaunchPatientLocationErrorModal(
              patientInfo
            );
            return;
          } else {
            if ($routeParams.summary === 'All') {
              $scope.accountMemberSelected({
                $$DisplayName: $scope.allAccountMembersText,
              });
            } else {
              $scope.accountMemberSelected(member);
            }
          }
        });
    }
  };

  ctrl.setMemberTitles = function () {
    angular.forEach($scope.allAccountMembers, function (accountMember) {
      // get first appointment for that member and grab the PatientSince column from that
      if (accountMember.PatientId) {
        var appointment = $filter('filter')(
          $scope.appointments,
          function (appt) {
            return appt.Person.PatientId === accountMember.PatientId;
          }
        );
        if (appointment && appointment.length > 0 && appointment[0].Person) {
          var patientSince = appointment[0].Person.PatientSince;
          accountMember.$$PatientSince = new Date(patientSince).getFullYear();
        }
      }
    });
  };

  // method loads appointment history for a single patient or for all account members based on
  ctrl.getAppointmentsHistory = function () {
    if ($scope.access.View) {
      // reinitialize to keep data fresh
      $scope.appointmentHistory.length = 0;
      if ($scope.showAllAccountMembers) {
        // load appointment history for all account members
        patientAppointmentsFactory
          .AccountHistory($scope.accountId)
          .then(function (res) {
            if (res && res.Value) {
              $scope.appointmentHistory = res.Value;
            }
          });
      } else {
        // load appointment history for single patient

        patientAppointmentsFactory
          .PatientHistory($scope.patientCopy.Data.PatientId)
          .then(function (res) {
            if (res && res.Value && !_.isNil($scope.appointmentHistory)) {
              $scope.appointmentHistory.push(res.Value);
            }
          });
      }
    }
  };

  $scope.setPatientAppointmentsTitle = function (member) {
    return `${member.$$HealthPanelTitle} - Patient since ${member.$$PatientSince}`;
  };
}

PatientAppointmentsTabController.prototype = Object.create(BaseCtrl.prototype);
