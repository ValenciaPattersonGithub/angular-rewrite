(function () {
  'use strict';
  angular
    .module('Soar.BusinessCenter')
    .controller('ClaimNotesModalController', ClaimNotesModalController);
  ClaimNotesModalController.$inject = [
    '$scope',
    'localize',
    '$uibModalInstance',
    'claimSubmissionResultsDto',
    'toastrFactory',
    'ModalFactory',
    'PatientServices',
    'PersonServices',
    'patSecurityService',
    'referenceDataService',
    'TimeZoneFactory',
  ];
  function ClaimNotesModalController(
    $scope,
    localize,
    $uibModalInstance,
    claimSubmissionResultsDto,
    toastrFactory,
    modalFactory,
    patientServices,
    personServices,
    patSecurityService,
    referenceDataService,
    timeZoneFactory
  ) {
    BaseCtrl.call(this, $scope, 'ClaimNotesModalController');
    var ctrl = this;

    $scope.noteHistories = [];
    $scope.serviceTransactions = [];
    ctrl.isClaimAddedOrDeleted = false;
    ctrl.locations = referenceDataService.get(
      referenceDataService.entityNames.locations
    );

    $scope.authClaimAddAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-ins-iclmnt-add'
      );
    };
    $scope.authClaimEditAccess = function () {
      var claimedit = patSecurityService.IsAuthorizedByAbbreviation(
        'soar-ins-iclmnt-edit'
      );
      return claimedit;
    };
    $scope.authClaimDeleteAccess = function () {
      var claimdelete = patSecurityService.IsAuthorizedByAbbreviation(
        'soar-ins-iclmnt-delete'
      );
      return claimdelete;
    };
    ctrl.init = function () {
      $scope.patientInfo = {
        name: '',
        dob: '',
        phone: '',
        email: '',
      };
      $scope.claimSubmissionResult = claimSubmissionResultsDto;
      ctrl.getClaimNoteHistory();
      ctrl.loadPersonInfo(claimSubmissionResultsDto.PatientId);
      ctrl.loadBenifitPlan(
        claimSubmissionResultsDto.PatientId,
        claimSubmissionResultsDto.ClaimId,
        claimSubmissionResultsDto.Type
      );
      ctrl.loadServiceTransactions(
        claimSubmissionResultsDto.ClaimId,
        claimSubmissionResultsDto.Type
      );
    };

    ctrl.loadBenifitPlan = function (patientId, claimId, type) {
      patientServices.PatientBenefitPlan.getPatientBenefitPlansByPatientId({
        patientId: patientId,
        claimId: claimId,
        type: type,
      }).$promise.then(function (res) {
        $scope.SeqName = [
          'Primary Dental Benefit Plan',
          'Secondary Dental Benefit Plan',
          '3rd Supplemental Dental Benefit Plan',
          '4th Supplemental Dental Benefit Plan',
          '5th Supplemental Dental Benefit Plan',
          '6th Supplemental Dental Benefit Plan',
        ];
        $scope.benefitPlans = [];

        var befitPlantList = res.Value;
        _.each(befitPlantList, function (itm, index) {
          if (index < 6) {
            itm.patientBenefitPlanDto.$individualAnnualMaxRemaining =
              ctrl.calculateIndividualAnnualMaxRemaining(
                itm.patientBenefitPlanDto
              );

            $scope.benefitPlans.push(itm);
          }
        });
      });
    };

    $scope.checkAndUpdateUrlProtocol = function (carrierWebsite) {
      var subString1 = 'https://';
      var subString2 = 'http://';

      if (carrierWebsite.indexOf(subString1) !== -1 || carrierWebsite.indexOf(subString2) !== -1)
        return carrierWebsite;
      else
        return 'http://' + carrierWebsite;
    }

    $scope.addNote = {
      ClaimId: claimSubmissionResultsDto.ClaimId,
    };
    ctrl.getClaimNoteHistory = function () {
      patientServices.ClaimNotes.GetClaimNotesByClaimId(
        { claimId: claimSubmissionResultsDto.ClaimId },
        ctrl.getClaimNoteHistorySuccess,
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'An error occurred getting Note Histories'
            ),
            'Failure'
          );
        }
      );
    };

    ctrl.calculateIndividualAnnualMaxRemaining = function (
      patientBenefitPlanDto
    ) {
      if (
        patientBenefitPlanDto.PolicyHolderBenefitPlanDto != null &&
        patientBenefitPlanDto.PolicyHolderBenefitPlanDto.BenefitPlanDto != null
      ) {
        return patientBenefitPlanDto.PolicyHolderBenefitPlanDto.BenefitPlanDto
          .AnnualBenefitMaxPerIndividual > 0
          ? Math.max(
              0,
              patientBenefitPlanDto.PolicyHolderBenefitPlanDto.BenefitPlanDto
                .AnnualBenefitMaxPerIndividual +
                patientBenefitPlanDto.AdditionalBenefits -
                patientBenefitPlanDto.IndividualMaxUsed
            )
          : 0;
      } else {
        return 0;
      }
    };

    ctrl.getClaimNoteHistorySuccess = function (response) {
      var locationTmp = _.find(ctrl.locations, {
        LocationId: claimSubmissionResultsDto.LocationId,
      });
      var locationTimezone = locationTmp ? locationTmp.Timezone : '';
      if (locationTimezone) {
        _.forEach(response.Value, function (note) {
          note.displayDate = timeZoneFactory
            .ConvertDateToMomentTZ(note.CreatedDate, locationTimezone)
            .format('MM/DD/YYYY');
        });
      } else {
        _.forEach(response.Value, function (note) {
          note.displayDate = moment(note.CreatedDate).format('MM/DD/YYYY');
        });
      }
      $scope.noteHistories = response.Value;
    };

    ctrl.loadPersonInfo = function (id) {
      personServices.Persons.get({ Id: id }).$promise.then(function (result) {
        var user = result.Value;
        var comma = user.Profile.LastName || user.Profile.Suffix ? ', ' : '';
        $scope.patientInfo.name =
          user.Profile.LastName +
          ' ' +
          user.Profile.Suffix +
          comma +
          user.Profile.FirstName +
          ' ' +
          user.Profile.MiddleName;
        $scope.patientInfo.dob = user.Profile.DateOfBirth;

        _.forEach(user.Phones, function (phone) {
          if (phone.IsPrimary) {
            $scope.patientInfo.phone = phone.PhoneNumber;
          }
        });

        _.forEach(user.Emails, function (email) {
          if (email.IsPrimary) {
            $scope.patientInfo.email = email.Email;
          }
        });
      });
    };

    ctrl.loadServiceTransactions = function () {
      patientServices.Claim.getServiceTransactionForClaim(
        {
          claimId: claimSubmissionResultsDto.ClaimId,
          Type: claimSubmissionResultsDto.Type,
        },
        function (response) {
          var locationTmp = _.find(ctrl.locations, {
            LocationId: claimSubmissionResultsDto.LocationId,
          });
          var locationTimezone = locationTmp ? locationTmp.Timezone : '';
          if (locationTimezone) {
            _.each(response.Value, function (service) {
              service.ServiceDate = timeZoneFactory
                .ConvertDateToMomentTZ(service.ServiceDate, locationTimezone)
                .format('MM/DD/YYYY');
            });
          }
          $scope.serviceTransactions = response.Value;
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'An error occurred getting Service Transactions'
            ),
            'Failure'
          );
        }
      );
    };

    $scope.getTotal = function (column) {
      var total = 0;
      angular.forEach($scope.serviceTransactions, function (el) {
        total += el[column];
      });
      return total.toFixed(2);
    };

    $scope.close = function () {
      $uibModalInstance.close(
        ctrl.isClaimAddedOrDeleted === true ? true : null
      );
    };

    $scope.delete = function (note) {
      if (note.Type === 2) {
        var title = localize.getLocalizedString('Delete Claim Note');
        var message = localize.getLocalizedString('Are you Sure?');
        var button1Text = localize.getLocalizedString('Yes');
        var button2Text = localize.getLocalizedString('No');
        modalFactory
          .ConfirmModal(title, message, button1Text, button2Text)
          .then(function () {
            note.PatientId = claimSubmissionResultsDto.PatientId;
            patientServices.ClaimNotes.delete(note).$promise.then(
              function () {
                ctrl.isClaimAddedOrDeleted = true;
                ctrl.getClaimNoteHistory();
                toastrFactory.success(
                  localize.getLocalizedString(
                    'The Claim Note has been deleted successfully.'
                  ),
                  localize.getLocalizedString('Success')
                );
              },
              function () {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'Failed to delete the Claim Note.'
                  ),
                  localize.getLocalizedString('Error')
                );
              }
            );
          });
      }
    };

    $scope.openAddNoteModal = function (addNote) {
      addNote.isEditClaim = false;
      addNote.Note = '';
      modalFactory
        .Modal({
          templateUrl:
            'App/BusinessCenter/insurance/claims/claims-management/claim-notes-modal/addedit-claim-note/addedit-claim-note.html',
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
          windowClass: 'warning-modal-center',
          controller: 'AddEditClaimNotesModalController',
          amfa: 'soar-ins-iclaim-view',
          resolve: {
            noteHistory: function () {
              return addNote;
            },
            claimSubmissionResultsDto: function () {
              return claimSubmissionResultsDto;
            },
          },
        })
        .result.then(function (res) {
          if (res === true) {
            ctrl.isClaimAddedOrDeleted = true;
            ctrl.getClaimNoteHistory();
          }
        });
    };

    $scope.openEditNoteModal = function (noteHistory) {
      if (noteHistory.Type === 2) {
        noteHistory.isEditClaim = true;
        modalFactory
          .Modal({
            templateUrl:
              'App/BusinessCenter/insurance/claims/claims-management/claim-notes-modal/addedit-claim-note/addedit-claim-note.html',
            backdrop: 'static',
            keyboard: false,
            size: 'lg',
            windowClass: 'warning-modal-center',
            controller: 'AddEditClaimNotesModalController',
            amfa: 'soar-ins-iclaim-view',
            resolve: {
              noteHistory: function () {
                return noteHistory;
              },
              claimSubmissionResultsDto: function () {
                return claimSubmissionResultsDto;
              },
            },
          })
          .result.then(function (res) {
            if (res === true) {
              ctrl.getClaimNoteHistory();
            }
          });
      }
    };
    ctrl.init();
  }

  ClaimNotesModalController.prototype = Object.create(BaseCtrl);
})();
