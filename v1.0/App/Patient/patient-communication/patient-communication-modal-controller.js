'use strict';
angular
  .module('Soar.Patient')
  .controller('patientCommunicationModalController', [
    '$scope',
    '$uibModal',
    '$rootScope',
    '$q',
    'PatientServices',
    'toastrFactory',
    'localize',
    'ListHelper',
    '$filter',
    'UserServices',
    'ShareData',
    'referenceDataService',
    'PatientBenefitPlansFactory',
    'locationService',
    'TimeZoneFactory',
    PatientCommunicationModalController,
  ]);
function PatientCommunicationModalController(
  $scope,
  $uibModal,
  $rootScope,
  $q,
  patientServices,
  toastrFactory,
  localize,
  listHelper,
  $filter,
  userServices,
  shareData,
  referenceDataService,
  patientBenefitPlansFactory,
  locationService,
  timeZoneFactory
) {
  BaseCtrl.call(this, $scope, 'PatientCommunicationModalController');
  var $ctrl = this;
  $ctrl.uibModal = $uibModal;
  //$ctrl.items = items;
  //$ctrl.selected = {
  //    item: $ctrl.items[0]
  //};
  $scope.initialize = function () {};

  $scope.closeModal = function () {
    $rootScope.$broadcast('closeCommunicationModal', null);
    $rootScope.$broadcast('refreshCommunicationCount', $scope.patientId);
  };

  $scope.patientId = $scope.selectedPatientId;
  $scope.activeFltrTab = $scope.activeFltrTab;
  $scope.appointmentId = $scope.selectedAppointmentId;
  $scope.tabIdentifier = $scope.selectedTabIdentifier;
  $scope.fromUnreadCommunicationType = $scope.withUnread
    ? $scope.selectedIcon
    : null;

  var ctrl = this;
  var patientId = $scope.selectedPatientId;
  var appointmentId = $scope.selectedAppointmentId;
  // Flag to represent if any filter is applied
  ctrl.buttonFiltersApplied = false;
  ctrl.selectedLocationTimezone = locationService.getCurrentLocation().timezone;

  $scope.appliedFilters = [];
  $scope.communicationsAll = [];

  // filtered timeline records collection
  ctrl.filteredCommunicationRecordsCollection = [];

  //TODO: get the scope from comm directive
  $scope.dataReason = [
    { id: 2, tab: '1', name: 'General' },
    { id: 1, tab: '3', name: 'Preventive Care' },
    { id: 3, tab: '4', name: 'Treatment Plans' },
    { id: 4, tab: '2', name: 'Appointments' },
    { id: 5, tab: '5', name: 'Other To Do' },
    { id: 6, tab: '6', name: 'Account' },
  ];

  $scope.dataReasonUSMail = [
    { id: 7, groupId: 1, name: 'Account' },
    { id: 4, groupId: 2, name: 'Appointments' },
    { id: 8, groupId: 3, name: 'Miscellaneous' },
    { id: 1, groupId: 4, name: 'Preventive Care' },
    { id: 3, groupId: 5, name: 'Treatment Plans' },
  ];

  $scope.dataComType = [
    //{ id: 2, name: 'Text' },
    { id: 7, name: 'Email' },
    { id: 3, name: 'Phone' },
    //{ id: 4, name: 'Mail' },
    { id: 5, name: 'US Mail' },
    { id: 6, name: 'Text' },
  ];

  // Filter button collection
  $scope.filterButtons = [
    {
      ID: '7',
      Description: localize.getLocalizedString('Account'),
      Active: false,
      IconName: 'usd',
      Category: 'Reason',
    },
    {
      ID: '4',
      Description: localize.getLocalizedString('Appts'),
      Active: false,
      IconName: 'calendar',
      Category: 'Reason',
    },
    {
      ID: '8',
      Description: localize.getLocalizedString('General'),
      Active: false,
      IconName: 'users',
      Category: 'Reason',
    },
    {
      ID: '5',
      Description: localize.getLocalizedString('To Do'),
      Active: false,
      IconName: 'calendar-check-o',
      Category: 'Reason',
    },
    {
      ID: '1',
      Description: localize.getLocalizedString('Prevent'),
      Active: false,
      IconName: 'user-md',
      Category: 'Reason',
    },
    {
      ID: '3',
      Description: localize.getLocalizedString('Tx Plan'),
      Active: false,
      IconName: 'txplans',
      Category: 'Reason',
    },

    {
      ID: '7',
      Description: localize.getLocalizedString('Email'),
      Active: false,
      IconName: 'envelope-o',
      Category: 'Type',
    },
    {
      ID: '6',
      Description: localize.getLocalizedString('Text'),
      Active: false,
      IconName: 'comment-o',
      Category: 'Type',
    },
    {
      ID: '3',
      Description: localize.getLocalizedString('Phone'),
      Active: false,
      IconName: 'phone',
      Category: 'Type',
    },
    {
      ID: '5',
      Description: localize.getLocalizedString('US Mail'),
      Active: false,
      IconName: 'stampicon',
      Category: 'Type',
    },
  ];

  $scope.communicationDetailHeaderText = 'Prior Communication Detail';

  ctrl.getNextAppointment = function () {
    patientServices.PatientAppointment.NextAppointment(
      { PersonId: $scope.patientId },
      ctrl.getNextAppointmentSuccess,
      ctrl.getNextAppointmentFailure
    );
  };

  ctrl.getNextAppointmentSuccess = function (result) {
    $scope.nextAppointment = result.Value;

    if ($scope.nextAppointment && $scope.nextAppointment.StartTime) {
      $scope.nextAppointment.$$StartTimeLocal = $scope.nextAppointment.StartTime
        ? new Date($scope.nextAppointment.StartTime + 'Z')
        : $scope.nextAppointment.StartTime;
      $scope.nextAppointmentIsToday = ctrl.appointmentIsForToday(
        $scope.nextAppointment
      );
    }
  };

  ctrl.getNextAppointmentFailure = function (error) {
    toastrFactory.error(
      localize.getLocalizedString('Failed to retrieve {0}.', [
        'Next Scheduled Appointment',
      ]),
      'Error'
    );
  };

  ctrl.appointmentIsForToday = function (appointment) {
    var today = new Date();
    var appointmentStart =
      appointment && appointment.$$StartTimeLocal > ''
        ? new Date(appointment.$$StartTimeLocal)
        : null;

    return (
      appointmentStart &&
      appointmentStart.getFullYear() == today.getFullYear() &&
      appointmentStart.getMonth() == today.getMonth() &&
      appointmentStart.getDate() == today.getDate()
    );
  };

  //#region Patient Communication
  ctrl.patientCommunication = function (patientId) {
    return patientServices.Communication.get({
      Id: patientId,
    }).$promise.then(
      GetPatientCommunicationSuccess,
      GetPatientCommunicationFailed
    );
  };

  /**
   * Get preferred dentist.
   *
   * @returns {angular.IPromise}
   */
  ctrl.getPreferredDentist = function () {
    var deferred = $q.defer();

    if ($scope.patient.PreferredDentist) {
      referenceDataService
        .getData(referenceDataService.entityNames.users)
        .then(function (users) {
          var user = _.find(users, { UserId: $scope.patient.PreferredDentist });
          if (!_.isNil(user)) {
            var value = user;
            var pd = value.ProfessionalDesignation
              ? ' ' + value.ProfessionalDesignation
              : '';

            var name =
              value.FirstName.substring(0, 1) +
              '. ' +
              value.LastName +
              (value.SuffixName != null && value.SuffixName != ''
                ? ' ' + value.SuffixName
                : '') +
              pd;
            $scope.preferredDentist = name;
          }
          deferred.resolve();
        });
    } else {
      $scope.preferredDentist = 'No Preference';
      deferred.resolve();
    }

    return deferred.promise;
  };

  ctrl.patientData = function (patientId) {
    return patientServices.Patients.overview({
      patientId: patientId,
    }).$promise.then(ctrl.GetPatientByIdSuccess, ctrl.GetPatientByIdFailed);
  };

  ctrl.GetPatientByIdFailed = function () {
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve the {0}. Please try again.',
        ['patient']
      ),
      'Error'
    );
  };

  ctrl.isOtherToDoReason = function (data) {
    if (data.Reason == 5) {
      $scope.communicationDetailHeaderText = 'Other To Do Detail';
      $scope.isOtherTodo = true;
    } else {
      $scope.communicationDetailHeaderText = 'Prior Communication Detail';
      $scope.isOtherTodo = false;
    }
  };

  /**
   * Get patient by Id success callback.
   *
   * @param {*} result
   * @returns {angular.IPromise}
   */
  ctrl.GetPatientByIdSuccess = function (result) {
    result.Value.appointmentCount = 0;

    ctrl.patientProfile = result.Value.Profile;

    if (result.Value.PatientGroups) {
      ctrl.patientData.Groups = result.Value.PatientGroups;
    }

    return referenceDataService
      .getData(referenceDataService.entityNames.locations)
      .then(function (locations) {
        if (result.Value.PatientLocations) {
          //we may not need below code there, may already be loaded;
          _.forEach(result.Value.PatientLocations, function (location) {
            if (location.IsPrimary) {
              var primaryLocation = _.find(locations, {
                LocationId: location.LocationId,
              });
              ctrl.patientProfile.PrimaryLocation = primaryLocation;
            }
          });
        }

        if (result.Value.Profile && result.Value.Profile.PersonAccount) {
          patientBenefitPlansFactory
            .PatientBenefitPlansForAccount(
              result.Value.Profile.PersonAccount.AccountId
            )
            .then(function (res) {
              var patientBenefitPlans = res.Value;
              _.forEach(patientBenefitPlans, function (patientBenefitPlan) {
                if (patientBenefitPlan.PatientBenefitPlanDto.Priority === 0) {
                  ctrl.patientProfile.PrimaryInsurance =
                    patientBenefitPlan.CarrierDto.Name;
                }
                if (patientBenefitPlan.PatientBenefitPlanDto.Priority === 1) {
                  ctrl.patientProfile.SecondaryInsurance =
                    patientBenefitPlan.CarrierDto.Name;
                }
              });
              //if we dont do this the header doesnt update its data and the values dont show
              $rootScope.$broadcast(
                'update_patient_data_for_communication_header',
                ctrl.patientProfile
              );
            });
        }

        if (result.Value.PreventiveServicesDue) {
          _.forEach(result.Value.PreventiveServicesDue, function (exam) {
            if (exam.IsTrumpService) {
              ctrl.patientProfile.prevCareDue = exam.DateServiceDue;
              ctrl.patientProfile.nextPrev = exam.AppointmentStartTime;
              ctrl.patientProfile.PrevCare = exam;
            }
          });
        }

        if (result.Value.Phones) {
          _.forEach(result.Value.Phones, function (phoneItem) {
            if (phoneItem.PhoneNumber == null && phoneItem.PhoneReferrer) {
              phoneItem.PhoneNumber = phoneItem.PhoneReferrer.PhoneNumber;
              phoneItem.Type = phoneItem.PhoneReferrer.Type;
            }
            if (phoneItem.IsPrimary) {
              ctrl.patientProfile.primaryPhone = phoneItem;
            }
          });
          ctrl.patientProfile.Phones = result.Value.Phones;
        }

        if (result.Value.PatientGroups) {
          ctrl.patientProfile.Groups = result.Value.PatientGroups;
        }

        $scope.patient = ctrl.patientProfile;
        $scope.patient.appointmentCount = 0;

        if ($scope.patient) {
          return ctrl.getPreferredDentist().then(function () {
            ctrl.getNextAppointment();
            if ($scope.patient.IsActive === true) {
              $scope.DisplayStatus =
                $scope.patient.IsPatient === true
                  ? localize.getLocalizedString('Active Patient')
                  : localize.getLocalizedString('Active Non-Patient');
            } else {
              $scope.DisplayStatus =
                $scope.patient.IsPatient === true
                  ? localize.getLocalizedString('Inactive Patient')
                  : localize.getLocalizedString('Inactive Non-Patient');
            }

            if ($scope.patient.ResponsiblePersonName != '') {
              $scope.patient.ResponsibleParty = true;
            }
          });
        }
        return $q.resolve();
      });
  };

  ctrl.patientCommunicationTemplate = function (patientCommunicationId) {};
  $scope.previewLetter = function (data, data2) {
    $scope.getTemplateByNameSuccess(data, data2);
  };
  $scope.getTemplateByNameSuccess = function (data, data2) {
    $scope.letterTemplate = data;
    $scope.templateTitle = data2;
    $scope.previewOnly = true;
    $scope.previewModal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl:
        'App/Patient/patient-communication/letter-template-preview/letter-template-preview.html',
      controller: 'letterTemplatePreviewController',
      bindtoController: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      scope: $scope,
      resolve: {
        param: function () {
          return $scope.templateName;
        },
      },
    });
  };
  var GetPatientCommunicationSuccess = function (result) {
    $scope.communicationsAll = result.Value;

    var typeButtons = listHelper.findItemsByFieldValue(
      $scope.filterButtons,
      'Category',
      'Type'
    );
    var reasonButtons = listHelper.findItemsByFieldValue(
      $scope.filterButtons,
      'Category',
      'Reason'
    );
    var intCnt = 0;

    angular.forEach(result.Value, function (val) {
      // Bug 425570 - Converting communication date from UTC to location time to ensure the date is correct - D1
      if (
        val.CommunicationDate !== null &&
        val.CommunicationDate !== undefined
      ) {
        val.CommunicationDate = timeZoneFactory
          .ConvertDateToMomentTZ(
            val.CommunicationDate,
            ctrl.selectedLocationTimezone
          )
          .format('MM/DD/YYYY');
      }
      if (
        listHelper.findItemByFieldValue(
          typeButtons,
          'ID',
          val.CommunicationType
        ) != null
      )
        $scope.communicationsAll[
          intCnt
        ].CommunicationTypeDesc = listHelper.findItemByFieldValue(
          typeButtons,
          'ID',
          val.CommunicationType
        ).Description;

      if (
        listHelper.findItemByFieldValue(reasonButtons, 'ID', val.Reason) != null
      )
        $scope.communicationsAll[
          intCnt
        ].ReasonDesc = listHelper.findItemByFieldValue(
          reasonButtons,
          'ID',
          val.Reason
        ).Description;

      intCnt++;
    });

    $scope.communications = [];

    $scope.tempComm = [];

    if (result.Value.length > 0) {
      ctrl.groupCommunications(result.Value);
      $scope.communications = $scope.tempComm;
      $scope.firstCommunicationDate = $scope.formatDate(
        $scope.communications[0].CommunicationDate
      );
    }
    return result.Value;
  };
  $scope.$on('closePreviewModal', function (events, args) {
    if (
      typeof $scope.previewModal != 'undefined' &&
      $scope.previewModal != null
    ) {
      $scope.previewModal.close();
    }
  });

  ctrl.groupCommunications = function (result) {
    var d = new Date(1);
    angular.forEach(result, function (val) {
      if (
        moment($filter('date')(d, 'MM/dd/yyyy')).isSame(
          $filter('date')(new Date(val.CommunicationDate), 'MM/dd/yyyy')
        )
      ) {
        var ci = {
          CommunicationType: val.CommunicationType,
          PatientCommunicationId: val.PatientCommunicationId,
          Notes: val.Notes,
          Reason: val.Reason,
          DueDate: val.DueDate,
          IsComplete: val.IsComplete,
          LetterTemplate: val.LetterTemplate == null ? '' : val.LetterTemplate,
          TemplateTitle: val.LetterTemplateTitle,
          Status:
            val.Status == 1
              ? val.CommunicationType == 3
                ? 'Called'
                : 'Sent'
              : 'Received',
          IsRead: val.IsRead,
          CommunicationDate: val.CommunicationDate,
        };
        $scope.commRowStyle(ci);
        $scope.tempComm[$scope.tempComm.length - 1].ComItems.push(ci);
      } else {
        var com = {
          CommunicationDate: val.CommunicationDate,
          PatientId: val.PatientId,
          DueDate: val.DueDate,
          IsComplete: val.IsComplete,
          ObjectIndex: $scope.tempComm.length,
        };
        com.ComItems = [];
        com.ComItems.push({
          CommunicationType: val.CommunicationType,
          PatientCommunicationId: val.PatientCommunicationId,
          Notes: val.Notes,
          Reason: val.Reason,
          DueDate: val.DueDate,
          IsComplete: val.IsComplete,
          LetterTemplate: val.LetterTemplate == null ? '' : val.LetterTemplate,
          TemplateTitle: val.LetterTemplateTitle,
          Status:
            val.Status == 1
              ? val.CommunicationType == 3
                ? 'Called'
                : 'Sent'
              : 'Received',
          IsRead: val.IsRead,
          CommunicationDate: val.CommunicationDate,
        });
        $scope.commRowStyle(com.ComItems);
        $scope.tempComm.push(com);
      }
      d = new Date(val.CommunicationDate);
    });
  };

  $scope.FormatDay = function (d) {
    if (d > 3 && d < 21) return d + 'th';
    switch (d % 10) {
      case 1:
        return d + 'st';
      case 2:
        return d + 'nd';
      case 3:
        return d + 'rd';
      default:
        return d + 'th';
    }
  };

  $scope.commRowStyle = function (data) {
    //if (!data.Read)
    //    $scope.rowStyle = 'comm-unread-sms';
  };
  var GetPatientCommunicationFailed = function () {
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve the {0}. Please try again.',
        ['Patient communication']
      ),
      'Error'
    );
  };

  if (patientId != null) {
    ctrl.patientCommunication(patientId);
    ctrl.patientData(patientId);
  }

  ctrl.newStatus = false;
  ctrl.patCommId = 0;
  ctrl.commIndex = 0;
  var updateSuccess = function () {
    $scope.selectedIsComplete = ctrl.newStatus;

    for (var i = 0; i < $scope.tempComm[ctrl.commIndex].ComItems.length; i++) {
      if (
        $scope.tempComm[ctrl.commIndex].ComItems[i].PatientCommunicationId ==
        ctrl.patCommId
      ) {
        $scope.tempComm[ctrl.commIndex].ComItems[i].IsComplete = ctrl.newStatus;
        break;
      }
    }

    toastrFactory.success(
      localize.getLocalizedString('{0} saved.', [
        'Patient communication status',
      ])
    );
  };

  var updateFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString('{0} failed to save.', [
        'Patient communication status',
      ])
    );
    //$rootScope.$broadcast('closeCommunicationModal', false);
  };

  $scope.updateCommunicationStatus = function (
    patientId,
    communicationId,
    isComplete,
    objIndex
  ) {
    var params = {};
    params.Id = patientId;
    params.PatientCommunicationId = communicationId;
    ctrl.patCommId = communicationId;
    ctrl.newStatus = isComplete ? false : true;
    ctrl.commIndex = objIndex;
    patientServices.Communication.updateStatus(
      params,
      ctrl.newStatus
    ).$promise.then(function () {
      $scope.selectedIsComplete = ctrl.newStatus;
      var currentComm = $filter('filter')(
        $scope.communications,
        { ComItems: { PatientCommunicationId: ctrl.patCommId } },
        true
      )[0];
      var currentItem = $filter('filter')(
        currentComm.ComItems,
        { PatientCommunicationId: ctrl.patCommId },
        true
      )[0];
      currentItem.IsComplete = ctrl.newStatus;
    });
  };

  // Activate or inactivate timeline filter
  $scope.addOrRemoveFilter = function (event, filterButton) {
    if (filterButton.Active) {
      filterButton.Active = false;
      angular.element(event.currentTarget).find('img').css('filter', '');
      // Update filtersApplied flag based on if any other filter button is active or not
      var activeFilterButtons = listHelper.findItemsByFieldValue(
        $scope.filterButtons,
        'Active',
        true
      );
      ctrl.buttonFiltersApplied =
        activeFilterButtons && activeFilterButtons.length !== 0;
    } else {
      angular
        .element(event.currentTarget)
        .find('img')
        .css('filter', 'brightness(10000%)');
      filterButton.Active = true;
      $scope.appliedFilters.push(filterButton);
      ctrl.buttonFiltersApplied = true;
    }

    ctrl.filterRecords();
  };

  $scope.selectCommunication = function () {
    angular.element(angular.element('.hoverme')[0]).trigger('click');
  };

  ctrl.filterRecords = function () {
    // If filters are applied, process records, otherwise display all timeline records
    if (ctrl.buttonFiltersApplied) {
      var activeButtons = $scope.filterButtons.filter(function (a) {
        return a.Active;
      });

      ctrl.filteredCommunicationRecordsCollection = $scope.communicationsAll.filter(
        function (timelineRecord) {
          var itemType = listHelper.findItemByFieldValue(
            activeButtons,
            'Description',
            timelineRecord.CommunicationTypeDesc
          );
          var itemReason = listHelper.findItemByFieldValue(
            activeButtons,
            'Description',
            timelineRecord.ReasonDesc
          );

          if (itemType || itemReason) {
            if (itemType) {
              return itemType && itemType.Active;
            }
            if (itemReason) {
              return itemReason && itemReason.Active;
            }
          }
          return false;
        }
      );

      $scope.tempComm = [];
      ctrl.groupCommunications(ctrl.filteredCommunicationRecordsCollection);

      $scope.communications = $scope.tempComm;
      var dtCommunication =
        $scope.communications.length > 0
          ? $scope.formatDate($scope.communications[0].CommunicationDate)
          : '';
      $scope.firstCommunicationDate = dtCommunication;
    } else {
      $scope.tempComm = [];
      ctrl.groupCommunications($scope.communicationsAll);
      $scope.communications = $scope.tempComm;
      if ($scope.communications.length > 0) {
        $scope.firstCommunicationDate = $scope.formatDate(
          $scope.communications[0].CommunicationDate
        );
      }
    }

    if ($scope.tempComm.length > 0) {
      $scope.displayCommunicationDetails(
        $scope.tempComm[0],
        $scope.tempComm[0].ComItems[0]
      );
    }
  };

  ctrl.lookupCommunication = function (array, communicationType) {
    return listHelper.findItemByFieldValue(array, 'id', communicationType);
  };

  $scope.rowClicked = null;
  $scope.previousComm = null;

  $scope.displayDetails = function (item) {
    var firstRecordDetail = null;
    if (item != null) firstRecordDetail = item;
    else firstRecordDetail = $scope.communications[0];

    $scope.rowClicked = firstRecordDetail;
    $scope.Type = ctrl.lookupCommunication(
      $scope.dataComType,
      firstRecordDetail.CommunicationType
    );
    $scope.Reason = ctrl.lookupCommunication(
      $scope.dataReason,
      firstRecordDetail.Reason
    );
    $scope.CommunicationDate = firstRecordDetail.CommunicationDate;
    $scope.Notes = firstRecordDetail.Notes;
    $scope.DueDate = firstRecordDetail.DueDate;

    $scope.IsRead = item.IsRead;
  };

  $scope.displayCommunicationDetails = function (item, ci, id) {
    var comIndex = 0;
    if (!$scope.rowClicked && $scope.fromUnreadCommunicationType) {
      var comms = $filter('orderBy')(
        $scope.communications,
        'CommunicationDate'
      );
      var unread = null;
      while (!unread) {
        if (
          comms[comIndex] !== null &&
          comms[comIndex] !== undefined &&
          comms[comIndex].ComItems !== null &&
          comms[comIndex].ComItems !== undefined
        ) {
          var filteredComms = $filter('filter')(comms[comIndex].ComItems, {
            CommunicationType: $scope.fromUnreadCommunicationType,
            IsRead: false,
          });
          if (filteredComms.length > 0) {
            var last = filteredComms.length - 1;
            unread = filteredComms[last];
          }
        } else {
          unread = ci;
        }
        comIndex++;
      }
      $scope.rowClicked = unread;
    } else {
      $scope.rowClicked = ci;
      comIndex = item.ObjectIndex;
    }

    $scope.Type = $scope.displayType($scope.rowClicked.CommunicationType);
    $scope.Reason = $scope.displayDetailReason($scope.rowClicked.Reason);
    $scope.CommunicationDate = item.CommunicationDate;
    $scope.Notes = $scope.rowClicked.Notes;
    $scope.DueDate = $scope.rowClicked.DueDate;

    $scope.PatientId = item.PatientId;
    $scope.selectedPatientCommunicationId =
      $scope.rowClicked.PatientCommunicationId;
    $scope.selectedIsComplete = $scope.rowClicked.IsComplete;
    $scope.objectIndex = comIndex;

    ctrl.isOtherToDoReason($scope.rowClicked);

    if (angular.element('.hoverme')[0]) {
      //change colors of the rest to dark
      var comms = $scope.communicationsAll;
      angular.forEach(comms, function (val) {
        angular
          .element('#' + val.PatientCommunicationId + ' img')
          .css('filter', 'brightness(100%)');
      });

      //change current selected
      angular.element('#' + id + ' img').css('filter', 'brightness(10000%)');

      //change first item on first load
      if (id == undefined) {
        var icon = angular.element('#' + ci.PatientCommunicationId + ' img');
        setTimeout(function waitIconLoad() {
          if (icon) {
            angular
              .element('#' + ci.PatientCommunicationId + ' img')
              .css('filter', 'brightness(10000%)');
          } else {
            setTimeout(waitIconLoad, 10);
          }
        }, 10);
      }
    }

    if ($scope.previousComm != $scope.rowClicked && $scope.previousComm != null)
      ctrl.tagRead($scope.previousComm);

    $scope.previousComm = $scope.rowClicked;
  };

  $scope.onBlur = function (ci) {
    ctrl.tagRead(ci);
  };

  $scope.displayReason = function (item) {
    var strReturn;
    if (item < 7) {
      strReturn =
        item == 5
          ? 'Reason Other'
          : ctrl.lookupCommunication($scope.dataReason, item).name;
    } else {
      strReturn =
        item == 5
          ? 'Reason Other'
          : ctrl.lookupCommunication($scope.dataReasonUSMail, item).name;
    }
    return strReturn;
  };

  $scope.displayDetailReason = function (item) {
    if (item < 7) {
      return ctrl.lookupCommunication($scope.dataReason, item).name;
    } else {
      return ctrl.lookupCommunication($scope.dataReasonUSMail, item).name;
    }
  };

  $scope.displayType = function (item) {
    return ctrl.lookupCommunication($scope.dataComType, item).name;
  };

  $scope.formatDate = function (d) {
    return (
      $filter('date')(new Date(d), 'EEEE') +
      ', ' +
      $filter('date')(new Date(d), 'MMMM') +
      ' ' +
      $scope.FormatDay($filter('date')(new Date(d), 'd')) +
      ' ' +
      $filter('date')(new Date(d), 'yyyy')
    );
  };

  ctrl.flag = true;

  ctrl.tagRead = function (ci) {
    if (!ci.IsRead && ci.IsRead != null) {
      ci.IsRead = true;
      var params = {};
      params.PatientCommunicationId = ci.PatientCommunicationId;
      patientServices.Communication.tagRead(params);
      $rootScope.$broadcast('refreshCommunicationCount', $scope.patientId);
    }
  };
  $scope.isFirstLoad = function () {
    if (ctrl.flag) {
      ctrl.flag = false;
      return true;
    } else {
      return ctrl.flag;
    }
  };

  $scope.setupStickyHeader = function () {
    angular
      .element(angular.element('.relativeHeader')[0])
      .addClass('fix-to-top');
  };

  $scope.isStatusActive = function (isComplete) {
    var activeClass = isComplete ? ' comm-item-to-do-active' : '';
    return activeClass;
  };

  $scope.isStatusInDetailActive = function (isComplete) {
    var activeClass = isComplete
      ? ' fa-check-square comm-item-to-do-active'
      : ' fa-square';
    return activeClass;
  };
}
PatientCommunicationModalController.prototype = Object.create(
  BaseCtrl.prototype
);
