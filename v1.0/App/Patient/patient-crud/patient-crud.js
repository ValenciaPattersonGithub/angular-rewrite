'use strict';

var app = angular.module('Soar.Patient');

var PatientCrudControl = app.controller('PatientCrudController', [
  '$scope',
  '$routeParams',
  '$filter',
  '$location',
  'localize',
  'PersonServices',
  '$timeout',
  'toastrFactory',
  'StaticData',
  'patSecurityService',
  'PatientBenefitPlansFactory',
  'SaveStates',
  'ModalFactory',
  'ObjectService',
  'GlobalSearchFactory',
  'userSettingsDataService',
  function (
    $scope,
    $routeParams,
    $filter,
    $location,
    localize,
    personServices,
    $timeout,
    toastrFactory,
    staticData,
    patSecurityService,
    patientBenefitPlansFactory,
    saveStates,
    modalFactory,
    objectService,
    globalSearchFactory,
    userSettingsDataService
  ) {
    var ctrl = this;
    // ie hack, $pristine is being set to false incorrectly after the first time this form is loaded
    $timeout(function () {
      if ($scope.frmPatientCrud) {
        $scope.frmPatientCrud.$setPristine();
      }
    }, 100);

    //#region Authorization
    // view access
    ctrl.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-per-perdem-add'
      );
    };

    ctrl.authAccess = function () {
      if (!ctrl.authViewAccess()) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-per-perdem-add'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      } else {
        $scope.hasViewAccess = true;
      }
    };

    // authorization
    ctrl.authAccess();

    //ctrl.setDefaultPreferredLocation = function () {
    //    var userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
    //    if (userLocation) {
    //        $scope.defaultLocation = userLocation.id;
    //    }
    //};

    //ctrl.setDefaultPreferredLocation();

    ctrl.setStickyForIE = function () {
      var ua = window.navigator.userAgent;
      var msie = ua.indexOf('MSIE ');

      if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        // If Internet Explorer, return version number
        var stickyElement = angular.element('.secondaryNavigationFixed');
        var offsetTop = stickyElement.offset().top;
        var $win = angular.element(document);
        var topClass = 'secondaryNavigationFixedIE';

        $win.on('scroll', function (e) {
          if ($win.scrollTop() >= offsetTop) {
            stickyElement.addClass(topClass);
          } else {
            stickyElement.removeClass(topClass);
          }
        });
      }
    };

    $scope.$on('patCore:initlocation', function () {
      var userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
      if (userLocation) {
        $scope.defaultLocation = userLocation.id;
      }
    });

    //#region properties
    $scope.hasErrors = false;
    $scope.flags = { validReferral: true };
    $scope.formIsValid = false;
    $scope.setFocusOnProfile = false;
    $scope.setFocusOnPreferredLocation = false;
    $scope.setFocusOnPreviousDental = false;
    $scope.setFocusOnReferrals = false;
    $scope.availablePriorities = [];
    $scope.defaultLocation = null;

    //#endregion

    //#region new patient

    $scope.previousDentalOffice = {
      PreviousDentalOfficeId: null,
      IsValid: true,
      PatientId: null,
      Name: '',
      Address: {
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: null,
        ZipCode: '',
      },
      PhoneNumber: '',
      Notes: '',
    };

    $scope.priorityList = [
      {
        Name: 'Primary Dental',
        Priority: 0,
      },
      {
        Name: 'Secondary Dental',
        Priority: 1,
      },
      {
        Name: '3rd Supplemental Dental',
        Priority: 2,
      },
      {
        Name: '4th Supplemental Dental',
        Priority: 3,
      },
      {
        Name: '5th Supplemental Dental',
        Priority: 4,
      },
      {
        Name: '6th Supplemental Dental',
        Priority: 5,
      },
    ];

    // phone object to pass to phone info
    $scope.phones = [
      //{
      //    PatientId: null,
      //    PhoneNumber: '',
      //    Type: '',
      //    TextOk: false,
      //    Notes: '',
      //    ObjectState: '',
      //    IsPrimary: true,
      //    ReminderOK: false
      //}
    ];
    $scope.validPhones = true;

    // email object to pass to email info
    $scope.emails = [
      //{
      //    PatientId: null,
      //    Email: '',
      //    ReminderOK: true,
      //    AccountEmailId: null,
      //    ObjectState: '',
      //    IsPrimary: true
      //}
    ];
    $scope.validPhones = true;

    // referral object
    $scope.patientReferral = {
      PatientReferralId: null,
      ReferredPatientId: null,
      ReferralType: null,
      ReferralSourceId: null,
      SourceDescription1: '',
      SourceDescription2: '',
    };
    $scope.updated = {};
    $scope.person = {
      Profile: {
        PatientId: null,
        FirstName: '',
        MiddleName: '',
        LastName: '',
        PreferredName: '',
        Prefix: '',
        Suffix: '',
        AddressLine1: '',
        AddressLine2: '',
        City: '',
        State: '',
        ZipCode: '',
        Sex: '',
        DateOfBirth: null,
        IsPatient: true,
        PatientCode: null,
        EmailAddress: '',
        EmailAddress2: '',
        EmailAddressRemindersOk: false,
        EmailAddress2RemindersOk: false,
        PersonAccount: {
          ReceivesStatements: true,
          ReceivesFinanceCharges: true,
        },
        ResponsiblePersonType: null,
        ResponsiblePersonId: null,
        PreferredLocation: $scope.defaultLocation,
        PreferredDentist: null,
        PreferredHygienist: null,
        IsValid: true,
        ContactsAreValid: true,
        IsResponsiblePersonEditable: true,
        MailAddressRemindersOK: false,
      },
      Phones: [],
      PreviousDentalOffice: null,
      Referral: null,
      Flags: [],
      PatientBenefitPlanDtos: [],
      patientIdentifierDtos: [],
      PatientLocations: [],
    };
    //#endregion

    ctrl.setPriorityList = function () {
      var count = $scope.person.PatientBenefitPlanDtos.length;
      $scope.priorityList[count - 1].Priority = parseInt(
        $scope.priorityList[count - 1].Priority
      );
      if ($scope.availablePriorities.length <= 5) {
        $scope.availablePriorities.push($scope.priorityList[count - 1]);
      }
      $scope.$broadcast('PlanPriorityChange', $scope.availablePriorities);
    };

    ctrl.getInsuranceObject = function () {
      return {
        PatientId: null,
        BenefitPlanId: null,
        PolicyHolderId: null,
        DependentChildOnly: false,
        PolicyHolderStringId: null,
        RelationshipToPolicyHolder: null,
        RequiredIdentification: null,
      };
    };

    $scope.addInsurance = function () {
      angular.forEach($scope.person.PatientBenefitPlanDtos, function (plan) {
        plan.Priority = parseInt(plan.Priority);
      });
      var insuranceObj = ctrl.getInsuranceObject();
      insuranceObj.Priority = $scope.person.PatientBenefitPlanDtos.length;

      if (insuranceObj) {
        $scope.person.PatientBenefitPlanDtos.push(insuranceObj);

        ctrl.setPriorityList();
      }
      $scope.benefitPlanBackup = angular.copy(
        $scope.person.PatientBenefitPlanDtos
      );
    };

    $scope.removeInsurance = function ($index) {
      angular.forEach(
        $scope.person.PatientBenefitPlanDtos,
        function (plan, index) {
          plan.Priority = parseInt(index);
        }
      );
      if ($index != $scope.person.PatientBenefitPlanDtos.length - 1) {
        for (
          var j = $index;
          j < $scope.person.PatientBenefitPlanDtos.length - 1;
          j++
        ) {
          $scope.person.PatientBenefitPlanDtos[j] =
            $scope.person.PatientBenefitPlanDtos[j + 1];
          $scope.person.PatientBenefitPlanDtos[j].Priority =
            $scope.person.PatientBenefitPlanDtos[j].Priority - 1;
        }
      }
      $scope.person.PatientBenefitPlanDtos.pop();
      $scope.availablePriorities.pop();
      $scope.$broadcast('PlanPriorityChange', $scope.availablePriorities);
      $scope.person.PatientBenefitPlanDtos = $filter('orderBy')(
        $scope.person.PatientBenefitPlanDtos,
        'Priority'
      );
    };
    //#endregion

    $scope.priorityChanged = function ($index) {
      $scope.person.PatientBenefitPlanDtos[$index].Priority = parseInt($index);
      angular.forEach($scope.person.PatientBenefitPlanDtos, function (plan) {
        plan.Priority = parseInt(plan.Priority);
      });
      //$scope.person.PatientBenefitPlanDtos[].Priority= parseInt();
      $scope.person.PatientBenefitPlanDtos = $filter('orderBy')(
        $scope.person.PatientBenefitPlanDtos,
        'Priority'
      );
      var updatedObj = patientBenefitPlansFactory.updatedPriority;
      if (updatedObj.oldPriority == updatedObj.newPriority) return;

      if (updatedObj.oldPriority < updatedObj.newPriority) {
        // If moving down the list, loop from end to start
        for (
          var j = $scope.person.PatientBenefitPlanDtos.length - 1;
          j >= 0;
          j--
        ) {
          if (
            parseInt($scope.person.PatientBenefitPlanDtos[j].Priority) ==
            updatedObj.oldPriority
          ) {
            $scope.person.PatientBenefitPlanDtos[j].Priority =
              updatedObj.newPriority;
          } else if (
            parseInt($scope.person.PatientBenefitPlanDtos[j].Priority) >
            updatedObj.newPriority
          ) {
            //do nothing
          } else if (
            parseInt($scope.person.PatientBenefitPlanDtos[j].Priority) <
            updatedObj.oldPriority
          ) {
            //do nothing
          } else {
            $scope.person.PatientBenefitPlanDtos[j].Priority =
              parseInt($scope.person.PatientBenefitPlanDtos[j].Priority) - 1;
          }
        }
      } else {
        // If moving up the list, loop start to end
        for (
          var j = 0;
          j <= $scope.person.PatientBenefitPlanDtos.length - 1;
          j++
        ) {
          if (
            parseInt($scope.person.PatientBenefitPlanDtos[j].Priority) ==
            updatedObj.oldPriority
          ) {
            $scope.person.PatientBenefitPlanDtos[j].Priority =
              updatedObj.newPriority;
          } else if (
            parseInt($scope.person.PatientBenefitPlanDtos[j].Priority) <
            updatedObj.newPriority
          ) {
            //do nothing
          } else if (
            parseInt($scope.person.PatientBenefitPlanDtos[j].Priority) >
            updatedObj.oldPriority
          ) {
            //do nothing
          } else {
            $scope.person.PatientBenefitPlanDtos[j].Priority =
              parseInt($scope.person.PatientBenefitPlanDtos[j].Priority) + 1;
          }
        }
      }
      $scope.person.PatientBenefitPlanDtos = $filter('orderBy')(
        $scope.person.PatientBenefitPlanDtos,
        'Priority'
      );
    };

    // go back to patient landing page on Discard.
    $scope.cancelChanges = function () {
      $location.path('Patient');
    };

    //#region View Patient

    // Handle click event to view / edit patient
    $scope.viewPatient = function (patientId) {
      let patientPath = 'Patient/';
      $location.path(patientPath + patientId + '/Overview');
    };

    //#endregion

    //#region Patient Validation

    // validate required and any attributes
    ctrl.validatePerson = function (nv, ov) {
      if (nv) {
        var insuraceIsValid = ctrl.validateInsurance();
        var phonesAreValid = ctrl.validatePhones();
        var emailsAreValid = ctrl.validateEmails();

        $scope.formIsValid =
          $scope.person.Profile.IsValid === true &&
          $scope.person.Profile.ContactsAreValid &&
          angular.isDefined($scope.person.Profile.PreferredLocation) &&
          $scope.person.Profile.PreferredLocation != null &&
          $scope.previousDentalOffice.IsValid == true &&
          $scope.flags.validReferral == true &&
          insuraceIsValid &&
          phonesAreValid &&
          emailsAreValid;
      }
    };

    ctrl.validatePhones = function () {
      var isValid = true;

      for (var i = 0; i < $scope.phones.length && isValid; i++) {
        $scope.phones[i].$$hasErrors = false;

        $scope.phones[i].$$hasErrors =
          $scope.phones[i].ObjectState == null ||
          $scope.phones[i].ObjectState == saveStates.None ||
          $scope.phones[i].PhoneNumber.length != 10 ||
          $scope.phones[i].Type == null ||
          $scope.phones[i].Type.length == 0;

        if ($scope.phones[i].PhoneNumber == '' && $scope.phones[i].Type == '') {
          $scope.phones[i].$$hasErrors = false;
        }

        isValid = !$scope.phones[i].$$hasErrors;
        $scope.person.Profile.ContactsAreValid = isValid;
      }

      return isValid;
    };

    ctrl.validateEmails = function () {
      var isValid = true;

      for (var i = 0; i < $scope.emails.length && isValid; i++) {
        $scope.emails[i].$$hasErrors = false;

        $scope.emails[i].$$hasErrors =
          $scope.emails[i].ObjectState == null ||
          $scope.emails[i].ObjectState == saveStates.None;

        if (
          ($scope.emails[i].invalidEmail ||
            $scope.emails[i].Email == undefined ||
            $scope.emails[i].Email == '' ||
            $scope.emails[i].Email == null) &&
          $scope.emails[i].AccountEmailId == null
        ) {
          $scope.emails[i].$$hasErrors = true;
        }

        isValid = !$scope.emails[i].$$hasErrors;
      }

      return isValid;
    };

    ctrl.validateInsurance = function () {
      var insurances = $scope.person.PatientBenefitPlanDtos;
      var isValid = true;

      for (var i = 0; i < insurances.length && isValid; i++) {
        insurances[i].$hasErrors = false;

        if (insurances[i].PolicyHolderId != null) {
          insurances[i].$hasErrors =
            !(insurances[i].$dateValid && insurances[i].BenefitPlanId) ||
            (insurances[i].PatientId != insurances[i].PolicyHolderId &&
              (insurances[i].RelationshipToPolicyHolder == '' ||
                !insurances[i].RelationshipToPolicyHolder)) ||
            insurances[i].$validPolicyHolder == false;
        }

        isValid = !insurances[i].$hasErrors;

        angular.forEach(insurances, function (plan, index) {
          if (plan.$validPolicyHolder == false) {
            isValid = false;
            insurances[index].$hasErrors = true;
          }
        });
      }

      return isValid;
    };

    // Watch the data, if any changes validate and enable/disable save
    $scope.$watch(
      'person',
      function (nv, ov) {
        //ctrl.validatePerson(nv, ov);
        if (!$scope.originalPerson) {
          $scope.originalPerson = angular.copy($scope.person);
        }
      },
      true
    );

    // used to determine whether or not to show global discard modal
    $scope.updateDataHasChangedFlag = function (resetting) {
      if (resetting === true) {
        $scope.person = angular.copy($scope.originalPerson);
        $scope.phones = [
          {
            PatientId: null,
            PhoneNumber: '',
            Type: '',
            TextOk: false,
            Notes: '',
            ObjectState: '',
          },
        ];
      }
      var originalPersonCopy = angular.copy($scope.originalPerson);
      var personCopy = angular.copy($scope.person);

      // objectService.objectAreEqual doesn't support nested objects yet, comparing the Profile seperately for now
      $scope.dataHasChanged = !objectService.objectAreEqual(
        originalPersonCopy.Profile,
        personCopy.Profile
      );

      if (!$scope.dataHasChanged) {
        if (
          !objectService.objectAreEqual(originalPersonCopy, personCopy) ||
          $scope.phones.length > 1 ||
          $scope.phones[0].PhoneNumber
        ) {
          $scope.dataHasChanged = true;
        }
      }
    };

    //#endregion

    // Bug 7137 TODO check this is still needed
    $timeout(function () {
      var element = angular.element('#workArea');
      element.scrollTop(0);
      ctrl.setStickyForIE();
    }, 500);

    //#region save person

    ctrl.clearAddressFields = function () {
      $scope.person.Profile.AddressLine1 = null;
      $scope.person.Profile.AddressLine2 = null;
      $scope.person.Profile.City = null;
      $scope.person.Profile.State = null;
      $scope.person.Profile.ZipCode = null;
      $scope.person.Profile.MailAddressRemindersOK = false;
    };

    ctrl.addPhones = function () {
      // reset phones in case responsible person changes
      $scope.person.Phones = [];
      angular.forEach($scope.phones, function (phone) {
        if (
          phone.ObjectState != null &&
          phone.ObjectState != saveStates.None &&
          phone.PhoneNumber &&
          phone.PhoneNumber.length == 10
        ) {
          var phoneToAdd = angular.copy(phone);
          phoneToAdd.PhoneNumber =
            phoneToAdd.PhoneReferrerId != null ? null : phoneToAdd.PhoneNumber;
          $scope.person.Phones.push(phoneToAdd);
        }
      });
    };

    ctrl.addEmails = function () {
      // reset emails in case responsible person changes
      $scope.person.Emails = [];
      angular.forEach($scope.emails, function (email) {
        if (
          email.ObjectState != null &&
          email.ObjectState != saveStates.None &&
          (email.Email || email.AccountEmailId)
        ) {
          var emailToAdd = angular.copy(email);
          emailToAdd.Email =
            emailToAdd.AccountEmailId != null ? null : emailToAdd.Email;
          $scope.person.Emails.push(emailToAdd);
        }
      });
    };

    $scope.savePerson = function () {
      if (
        patSecurityService.IsAuthorizedByAbbreviation('soar-per-perdem-add')
      ) {
        // reset form focus
        $scope.setFocusOnProfile = false;
        $scope.setFocusOnPreferredLocation = false;
        $scope.setFocusOnPreviousDental = false;
        $scope.setFocusOnReferrals = false;
        ctrl.validatePerson($scope.person);
        ctrl.setFormFocus();

        if ($scope.formIsValid && !$scope.savingPatient) {
          $scope.savingPatient = true; //Added to prevent multiple clicks Bug 370390
          // only load valid phones to the person dto
          ctrl.addPhones($scope.phones);

          ctrl.addEmails();
          // clean up the zip codes before save
          $scope.person.Profile.ZipCode = $filter('zipStrip')(
            $scope.person.Profile.ZipCode
          );
          if (
            $scope.person.PreviousDentalOffice &&
            $scope.person.PreviousDentalOffice.Address.ZipCode
          ) {
            $scope.person.PreviousDentalOffice.Address.ZipCode = $filter(
              'zipStrip'
            )($scope.person.PreviousDentalOffice.Address.ZipCode);
          }

          if ($scope.person.Profile.DateOfBirth) {
            $scope.person.Profile.DateOfBirth.setHours(23);
            $scope.person.Profile.DateOfBirth.setMinutes(59);
            $scope.person.Profile.DateOfBirth =
              $scope.person.Profile.DateOfBirth.toLocaleString();
          }

          if ($scope.person.Profile.AddressReferrerId) {
            ctrl.clearAddressFields();
          }

          personServices.Persons.save(
            $scope.person,
            ctrl.savePersonSuccess,
            $scope.savePersonFailure
          );
        }
      }
    };

    ctrl.savePersonSuccess = function (res) {
      $scope.updateDataHasChangedFlag(true);
      // add selected person id to 'most recent' list
      var patient = res.Value;
      ctrl.saveMostRecent(patient.Profile.PatientId);
      toastrFactory.success(
        localize.getLocalizedString('Save {0}.', ['successful']),
        localize.getLocalizedString('Success')
      );
      let patientPath = 'Patient/';
      $location.path(patientPath + patient.Profile.PatientId + '/Overview');
    };

    $scope.savePersonFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Save was unsuccessful. Please retry your save.'
        ),
        localize.getLocalizedString('Server Error')
      );
      $scope.savingPatient = false;
    };

    ctrl.setFormFocus = function () {
      if (
        $scope.formIsValid == false &&
        $scope.person.Profile.IsValid == false
      ) {
        $timeout(function () {
          $scope.setFocusOnProfile = true;
          $scope.$apply();
        }, 0);
      } else if (
        $scope.formIsValid == false &&
        $scope.person.Profile.ContactsAreValid == false
      ) {
        $timeout(function () {
          $scope.setFocusOnContactDetails = true;
          $('html, body')
            .stop()
            .animate(
              {
                scrollTop: $('.phone-item').offset().top - 300,
              },
              '500',
              'linear'
            );

          $scope.$apply();
        }, 0);
      } else if (
        $scope.formIsValid === false &&
        (angular.isUndefined($scope.person.Profile.PreferredLocation) ||
          $scope.person.Profile.PreferredLocation == null)
      ) {
        $timeout(function () {
          $scope.setFocusOnPreferredLocation = true;
          $scope.$apply();
        }, 0);
      } else if (
        $scope.formIsValid == false &&
        $scope.previousDentalOffice.IsValid == false
      ) {
        $timeout(function () {
          $scope.setFocusOnPreviousDental = true;
          $scope.$apply();
        }, 0);
      } else if (
        $scope.formIsValid == false &&
        $scope.flags.validReferral == false
      ) {
        $timeout(function () {
          $scope.setFocusOnReferrals = true;
          $('html, body')
            .stop()
            .animate(
              {
                scrollTop:
                  $('#patienAdditionlIdentifierSection').offset().top - 100,
              },
              '500',
              'linear'
            );
          $scope.$apply();
        }, 0);
      } else if (
        $scope.formIsValid == false &&
        $scope.person.PatientBenefitPlanDtos &&
        _.find($scope.person.PatientBenefitPlanDtos, function (plan) {
          return plan.$hasErrors;
        })
      ) {
        for (var i = 0; i < $scope.person.PatientBenefitPlanDtos.length; i++) {
          if ($scope.person.PatientBenefitPlanDtos[i].$hasErrors) {
            $(
              $('#patient-insurance-div' + i + ' .k-widget.k-dropdown').find(
                'select'
              )[0]
            )
              .data('kendoDropDownList')
              .focus();
            return;
          }
        }
      }
    };

    //#endregion

    $scope.$watch('phones', function (nv) {});

    //#region
    $scope.$watch('person.Referral', function (nv, ov) {}, true);

    $scope.$watch('flags.validReferral', function (nv, ov) {}, true);

    $scope.$watch(
      'person.Profile.PersonAccount.ReceivesStatements',
      function (nv) {
        if (nv === false) {
          $scope.person.Profile.PersonAccount.ReceivesFinanceCharges = false;
        }
      }
    );
    $scope.$watch(
      'person.Profile.PersonAccount.ReceivesFinanceCharges',
      function (nv) {
        if (
          nv === true &&
          $scope.person.Profile.PersonAccount.ReceivesStatements === false
        ) {
          $scope.person.Profile.PersonAccount.ReceivesFinanceCharges = false;
        }
      }
    );

    //#endregion

    //#region obsolete or move to another directive

    //#region ResponsiblePerson

    // when the ResponsiblePersonId changes set the PersonAccount
    //$scope.$watch('personalInfo.Profile.ResponsiblePersonId', function (nv, ov) {
    //    $scope.defaultFocusOnRespParty = ($routeParams.panel === 'PI_RP' || $scope.patientData.defaultExpandedPanel === 'PI_RP') ? true : false;
    //    if (nv && nv != ov) {
    //        $scope.personalInfo.Profile.PersonAccount.PersonAccountMember.ResponsiblePersonId = $scope.personalInfo.Profile.ResponsiblePersonId;
    //        $scope.personalInfo.Profile.PersonAccount.PersonAccountMember.ResponsiblePersonType = $scope.personalInfo.Profile.ResponsiblePersonType;
    //    }
    //}, true);

    //#region recents

    ctrl.saveMostRecent = function (personId) {
      globalSearchFactory.SaveMostRecentPerson(personId);
    };

    // #endregion
  },
]);
