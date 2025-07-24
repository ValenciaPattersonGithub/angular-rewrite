'use strict';

angular.module('Soar.Patient').controller('MedicalHistoryPrintController', [
  '$scope',
  '$timeout',
  '$routeParams',
  'PatientServices',
  'MedicalHistoryFactory',
  'localize',
  function controllerConstructor(
    $scope,
    $timeout,
    $routeParams,
    PatientServices,
    MedicalHistoryFactory,
    localize
  ) {
    /*
                $routeParams = {
                    formType: ''
                    patientId: ''
                };
            */

    var ctrl = this;
    $scope.isBlank = false;
    $scope.today = moment(new Date());

    this.initialize = function initialize() {
      angular.element('body').addClass('medHistPrint');

      this.setPatient();
      this.resolveForm();
    };

    this.setPatient = function setPatient() {
      if (!$scope.patient) {
        $scope.patient = {
          FirstName: '',
          LastName: '',
          Sex: '',
          DateOfBirth: '',
        };
      };

      $scope.loadingPatient = true;
      PatientServices.Patients.get(
        { Id: $routeParams.patientId },
        function success(res) {
          $scope.patient.FirstName = res.Value.FirstName;
          $scope.patient.LastName = res.Value.LastName;
          $scope.patient.Sex = res.Value.Sex;
          $scope.patient.DateOfBirth = res.Value.DateOfBirth;
          $scope.loadingPatient = false;
        }
      );
    };

    this.formHandlers = {
      blank: function getBlankForm() {
        MedicalHistoryFactory.create().then(this.parseForm);
        $scope.isBlank = true;
      },
      current: function getFormById() {
        MedicalHistoryFactory.getById($routeParams.patientId).then(
          this.parseForm
        );
      },
      past: function getPastFormById() {
        MedicalHistoryFactory.getByFormAnswersId(
          $routeParams.patientId,
          $routeParams.formAnswersId
        ).then(this.parseForm);
      },
    };

    this.resolveForm = function resolveForm() {
      $scope.formSections = [];
      $scope.loadingForm = true;

      (function () {
        try {
          this.formHandlers[$routeParams.formType].call(this);
        } catch (error) {}
      }).bind(this)();
    };

    this.parseForm = function parseForm(res) {
      // Emergency Contact Section has been moved to the top section with a different format, so we save this info and remove it from sections.
      if (!$scope.isBlank) {
        const allFormSectionItems = res.Value.FormSections.flatMap(section => section.FormSectionItems);
        const emergencyInfo = allFormSectionItems.find(sectionItem => 
          sectionItem.FormBankItemEmergencyContact !== null
        );
        if (!_.isEmpty(emergencyInfo)) {
          const emergencyContact = emergencyInfo.FormBankItemEmergencyContact;
          $scope.patient.EmergencyContactName = emergencyContact.Name;
          $scope.patient.EmergencyContactPhone = emergencyContact.Phone;
          $scope.patient.EmergencyContactRelationship =
            emergencyContact.Relationship;
        }
      }
      res.Value.FormSections = res.Value.FormSections.filter(
        function (formSection) {
          const section = formSection.FormSectionItems.find(item => item.FormBankItemEmergencyContact !== null)
          return _.isEmpty(section);
        }
      );

      $scope.form = res.Value;
      $scope.formSections = res.Value.FormSections;
      ctrl.getSignature(res.Value);

      angular.forEach($scope.formSections, function (formSection) {
        var oneColumnGroup = false;
        formSection.$$isMHF = true;

        if (
          formSection.Title ===
            'Do you have any of the following diseases or problems' ||
          formSection.Title === 'Medical History' ||
          formSection.Title === 'WOMEN ONLY. Are you:' ||
          formSection.Title === 'Premedication'
        ) {
          formSection.$$oneColumn = true;
          oneColumnGroup = true;
        }

        angular.forEach(
          formSection.FormSectionItems,
          function (formSectionItem) {
            formSectionItem.$$isMHF = true;
            formSectionItem.printView = true;

            if (oneColumnGroup) {
              formSectionItem.$$oneColumn = true;
            }
          }
        );
      });
    };

    $scope.onMedicalHistoryFormDirectiveRender =
      function onMedicalHistoryFormDirectiveRender() {
        $scope.loadingForm = false;
      };

    // display signature
    ctrl.getSignature = function (medicalHistoryForm) {
      $scope.medicalHistoryForm = medicalHistoryForm;
      $scope.signatureTitle = localize.getLocalizedString(
        'Signature of Patient/Legal Guardian'
      );
    };

    this.initialize();
  },
]);
