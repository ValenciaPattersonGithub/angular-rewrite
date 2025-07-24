'use strict';
angular
  .module('Soar.Patient')
  .controller('newCommunicationController', [
    '$scope',
    '$rootScope',
    '$filter',
    'PatientServices',
    'toastrFactory',
    'localize',
    '$uibModal',
    '$timeout',
    'ListHelper',
    'PatientDetailService',
    NewCommunicationController,
  ]);
function NewCommunicationController(
  $scope,
  $rootScope,
  $filter,
  patientServices,
  toastrFactory,
  localize,
  $uibModal,
  $timeout,
  listHelper,
  patientDetailService
) {
  BaseCtrl.call(this, $scope, 'NewCommunicationController');
  var ctrl = this;

  //groupId = 0 means reason has no Template
  $scope.dataReasonUSMail = [
    { id: 7, tab: '2', groupId: 1, name: 'Account' },
    { id: 4, tab: '1', groupId: 2, name: 'Appointments' },
    { id: 8, tab: '', groupId: 3, name: 'Miscellaneous' },
    { id: 5, tab: '5', groupId: 0, name: 'Other To Do' },
    { id: 1, tab: '7', groupId: 4, name: 'Preventive Care' },
    { id: 3, tab: '6', groupId: 5, name: 'Treatment Plans' },
  ];

  $scope.dataComType = [
    { id: 7, name: 'Email' },
    { id: 3, name: 'Phone' },
    { id: 6, name: 'Text' },
    { id: 5, name: 'US Mail' },
  ];

  $scope.communicationTemplates = [
    {
      CommunicationTemplateId: 0,
      TemplateName: 'Select a Template',
    },
  ];

  $scope.selectedCommunicationTemplate = angular.copy(
    $scope.communicationTemplates[0]
  );

  $scope.title = 'New Communication';
  $scope.emptyNote = true;
  $scope.isLetterTemplate = true;
  $scope.hasTemplate = true;
  $scope.selectedMediaTypeId = 3;
  $scope.isPhone = false;
  $scope.lblButton = 'Preview';
  $scope.isNotUsMail = true;

  $scope.minDate = new Date();
  $scope.valid = true;
  $scope.isOtherToDo = false;
  $scope.TemplateUSMail = '';
  $scope.CommunicationTypeId = 0;
  var selectedIcon = 5;

  if (angular.isDefined($scope.$parent.selectedIcon)) {
    selectedIcon = $scope.$parent.selectedIcon;
    if (selectedIcon === '3') {
      $scope.isPhone = true;
      $scope.hasTemplate = !$scope.isPhone;
    }
  }
  var getActiveFltr = function () {
    if ($scope.activeFltrTab && $scope.activeFltrTab !== '2') {
      return $filter('filter')(
        $scope.dataReasonUSMail,
        { tab: $scope.activeFltrTab.toString() },
        true
      )[0].id;
    } else {
      return 8;
    }
  };

  $scope.dto = {
    PatientId: $scope.patientId,
    CommunicationType: selectedIcon,
    Reason: angular.isDefined($scope.$parent.selectedIcon)
      ? 8
      : getActiveFltr(),
    Notes: '',
    DueDate: null,
    LetterTemplate: '',
    AppointmentId: $scope.appointmentId,
    CommunicationTemplateId: $scope.selectedTemplateId,
    Status: 1, //Set default to Sent
  };

  var saveSuccess = function () {
    toastrFactory.success(
      localize.getLocalizedString('{0} saved.', ['Patient communication'])
    );
    $rootScope.$broadcast('closeCommunicationModal', $scope.patientId);
    $rootScope.$broadcast('refreshCommunicationCount', $scope.patientId);
  };

  var saveFailure = function () {
    toastrFactory.error(
      localize.getLocalizedString('{0} failed to save.', [
        'Patient communication',
      ])
    );
    $rootScope.$broadcast('closeCommunicationModal', null);
  };

  $scope.saveCommunication = function () {
    if ($scope.dto.DueDate != null)
      $scope.dto.DueDate = $scope.dto.DueDate.toDateString();

    patientServices.Communication.create(
      { Id: $scope.patientId },
      $scope.dto
    ).$promise.then(saveSuccess, saveFailure);
  };

  var sendEmailFailure = function (res) {
    $scope.test = res;
    toastrFactory.error(
      localize.getLocalizedString('{0} failed to send email.', [
        'Patient communication',
      ])
    );
    $rootScope.$broadcast('closeCommunicationModal', null);
  };

  var sendTextFailure = function (res) {
    toastrFactory.error(
      localize.getLocalizedString('{0} failed to send text message.', [
        'Patient communication',
      ])
    );
    $rootScope.$broadcast('closeCommunicationModal', null);
  };

  $scope.checkNote = function () {
    $scope.emptyNote = $scope.dto.Notes.trim() === '';
    if ($scope.isOtherToDo || $scope.isPhone) {
      $scope.hasTemplate = false;
    } else {
      if (!$scope.previewDisabled) {
        $scope.hasTemplate = true;
      } else {
        $scope.hasTemplate = $scope.emptyNote;
      }
    }
  };

  //Letter Template
  $scope.checkForTemplate = function () {};

  $scope.phones = {};
  $scope.$on('setPatientPhoneNumber', function (events, args) {
    $scope.phones = {};
    if (args) {
      $scope.phones = args;
    }
  });

  $scope.previewDisabled = true;
  $scope.onCommunicationTypeChange = function (nv) {
    var type =
      nv === undefined ? parseInt($scope.dto.CommunicationType) : parseInt(nv);

    $scope.title = 'New Communication';
    $scope.isOtherToDo = false;

    $scope.previewDisabled = true;
    $scope.dto.Status = 1;

    $scope.CommunicationTypeId = type.toString();
    $scope.isLetterTemplate = true;
    $scope.isPhone = type === 3;
    $scope.hasTemplate = !$scope.isPhone;

    //only USMail will display Template dropdown
    $scope.isNotUsMail = !(type === 5);
    $scope.isLetterTemplate = !$scope.isNotUsMail;

    $scope.lblButton = type === 6 ? 'Create' : 'Preview';
    $scope.selectedMediaTypeId = type - 4;
    $scope.getTemplatesByGroup();
  };

  $scope.templateComboOptions = {
    dataSource: new kendo.data.DataSource({
      data: [],
    }),
    placeholder: 'Select a Template',
    dataTextField: 'TemplateName',
    dataValueField: 'TemplateName',
  };

  var getTemplatesByGroupSuccess = function (res) {
    $scope.communicationTemplates = [];

    if (res.Value.length > 0) {
      _.each(res.Value, function (v) {
        var item = {
          CommunicationTemplateId: v.CommunicationTemplateId,
          TemplateName: v.TemplateName,
        };
        $scope.communicationTemplates.push(item);
      });
    }
    $scope.templateComboOptions.dataSource.data($scope.communicationTemplates);
    $scope.TemplateUSMail = '';

    if ($('#cbTemplateUSMail').length) {
      $('#cbTemplateUSMail').data('kendoComboBox').value('');
      $('#cbTemplateUSMail').data().kendoComboBox.select(null);
    }
  };

  var getTemplatesByGroupFailure = function () {
    //toastrFactory.error(localize.getLocalizedString('{0} failed to get templates.', ['New patient communication']));
  };

  $scope.getTemplatesByGroup = function (nv) {
    var reason = nv === undefined ? parseInt($scope.dto.Reason) : parseInt(nv);
    $scope.hasTemplate = false;
    var item = listHelper.findItemByFieldValue(
      $scope.dataReasonUSMail,
      'id',
      reason
    );

    if (item.name === 'Other To Do') {
      $scope.title = 'New Other To Do';
      $scope.isOtherToDo = true;
    } else {
      $scope.title = 'New Communication';
      $scope.isOtherToDo = false;
      if (!$scope.isPhone) {
        $scope.hasTemplate = $scope.emptyNote;
      }
    }

    $scope.previewDisabled = true;
    $scope.TemplateUSMail = '';
    if ($('#cbTemplateUSMail').length) {
      $('#cbTemplateUSMail').data('kendoComboBox').value('');
    }

    var params = {};
    params.Id = $scope.$parent.patientId;

    if ($scope.selectedMediaTypeId > 0 && params.Id && item !== null) {
      params.mediaTypeId = $scope.selectedMediaTypeId;

      params.GroupId = item.groupId;
      patientServices.Communication.getTemplatesByGroupId(params).$promise.then(
        getTemplatesByGroupSuccess,
        getTemplatesByGroupFailure
      );
    }
  };

  $scope.onSelectedTemplateChanged = function () {
    var selectedindex =
      $('#cbTemplateUSMail').data('kendoComboBox').selectedIndex;
    if (selectedindex > -1) {
      $scope.hasTemplate = true;
      $scope.selectedTemplateId =
        $scope.communicationTemplates[selectedindex].CommunicationTemplateId;
      if ($('#cbTemplateUSMail').data('kendoComboBox').value() != '') {
        $scope.previewDisabled = false;
        $scope.dto.Status = 1;
      }
    }
  };

  var getTemplateByIdSuccess = function (res) {
    $scope.letterTemplate = res.Value.StringOutput[0];
    $scope.previewModal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl:
        'App/Patient/patient-communication/letter-template-preview/letter-template-preview.html',
      controller: 'letterTemplatePreviewController',
      bindtoController: true,
      size: 'xl',
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

  $scope.$on('closePreviewModal', function (events, args) {
    if (
      typeof $scope.previewModal != 'undefined' &&
      $scope.previewModal != null
    ) {
      $scope.previewModal.close();
    }
  });

  $scope.$on('saveUSMailCommunication', function (events, args) {
    $scope.previewModal.close();
    $scope.dto.LetterTemplate = $scope.letterTemplate;
    $scope.dto.CommunicationTemplateId = $scope.selectedTemplateId;
    $scope.dto.Status = $('input[name="communicationStatus"]:checked').val();
    if ($scope.dto.Notes === '') {
      $scope.dto.Notes = '&nbsp;';
    }

    if ($scope.selectedMediaTypeId === 2) {
      var phoneNum = $filter('filter')(
        $scope.phones,
        { Type: 'Mobile' },
        true
      )[0].PhoneNumber;
      patientServices.Communication.sendTextMessage(
        { phoneNumber: phoneNum },
        $scope.dto
      ).$promise.then(saveSuccess, sendTextFailure);
    } else if ($scope.selectedMediaTypeId === 3) {
      $scope.dto.EmailAddresses = [];
      _.each(args, function (emailObj) {
        $scope.dto.EmailAddresses.push(emailObj.Email);
      });
      $scope.dto.FromName =
        JSON.parse(sessionStorage.getItem('patAuthContext')).userInfo
          .firstname +
        ' ' +
        JSON.parse(sessionStorage.getItem('patAuthContext')).userInfo.lastname;
      patientServices.Communication.sendEmail({}, $scope.dto).$promise.then(
        saveSuccess,
        sendEmailFailure
      );
    } else {
      patientServices.Communication.create(
        { Id: $scope.patientId },
        $scope.dto
      ).$promise.then(saveSuccess, saveFailure);
    }
  });

  $scope.isActivePatient = false;
  var getTemplateByIdFailure = function (res) {
    toastrFactory.error(
      localize.getLocalizedString('{0} failed to get letter template.', [
        'New patient communication',
      ])
    );
  };

  ctrl.getPatientData = function (patientId) {
    return patientServices.Patients.get({
      Id: patientId,
    }).$promise.then(ctrl.GetPatientByIdSuccess, ctrl.GetPatientByIdFailed);
  };

  ctrl.GetPatientByIdFailed = function () {
    //toastrFactory.error(localize.getLocalizedString('Failed to retrieve the {0}. Please try again.', ['patient']), 'Error');
  };

  ctrl.GetPatientByIdSuccess = function (result) {
    $scope.isActivePatient = result.Value.IsActive;
    $scope.patientEmailAddresses = result.Value.EmailAddresses;
    $scope.patientName = result.Value.FirstName + ' ' + result.Value.LastName;

    var params = {};
    params.Id = $scope.$parent.patientId;
    params.templateId = $scope.selectedTemplateId;
    params.TemplateName = $('#cbTemplateUSMail').data('kendoComboBox').value();
    params.Status = $('input[name="communicationStatus"]:checked').val();

    if ($scope.$parent.appointmentId == undefined)
      params.appointmentId = '00000000-0000-0000-0000-000000000000';
    else params.appointmentId = $scope.$parent.appointmentId;

    $scope.templateName = params.TemplateName;
    patientServices.Communication.getTemplateById(params).$promise.then(
      getTemplateByIdSuccess,
      getTemplateByIdFailure
    );
  };
  $scope.previewLetterTemplate = function () {
    if ($scope.selectedMediaTypeId === 3) {
      ctrl.getPatientData($scope.patientId);
    } else {
      patientDetailService
        .getPatientDashboardOverviewByPatientId($scope.$parent.patientId)
        .then(patientOverview => {
          var params = {};
          params.Id = $scope.$parent.patientId;
          params.templateId = $scope.selectedTemplateId;
          params.TemplateName = $('#cbTemplateUSMail')
            .data('kendoComboBox')
            .value();
          params.Status = $('input[name="communicationStatus"]:checked').val();

          if (
            $scope.$parent.appointmentId == undefined &&
            !patientOverview.Profile.NextAppointment
          )
            params.appointmentId = '00000000-0000-0000-0000-000000000000';
          else
            params.appointmentId =
              patientOverview.Profile.NextAppointment.AppointmentId;

          $scope.templateName = params.TemplateName;
          patientServices.Communication.getTemplateById(params).$promise.then(
            getTemplateByIdSuccess,
            getTemplateByIdFailure
          );
        });
    }
  };

  $timeout(function () {
    $scope.onCommunicationTypeChange();
  }, 800);
}

NewCommunicationController.prototype = Object.create(BaseCtrl.prototype);
