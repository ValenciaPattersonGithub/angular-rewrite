(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .factory('AccountSummaryDeleteFactory', accountSummaryDeleteFactory);

  accountSummaryDeleteFactory.$inject = [
    'PatientServices',
    'PatientValidationFactory',
    '$q',
    'localize',
    'ModalFactory',
    'patSecurityService',
    'toastrFactory',
  ];

  function accountSummaryDeleteFactory(
    patientServices,
    patientValidationFactory,
    $q,
    localize,
    modalFactory,
    patSecurityService,
    toastrFactory
  ) {
    var ctrl = this;
    ctrl.soarAuthSvcTrDeleteKey = 'soar-acct-actsrv-delete';
    ctrl.soarAuthClaimViewKey = 'soar-ins-iclaim-view';
    ctrl.soarAuthEnctrDeleteKey = 'soar-acct-enctr-delete';

    var deleteAccountSummaryRowDetail = function (
      accountSummaryRow,
      accountSummaryRowDetail,
      refreshSummaryPageDataForGrid,
      loggedInLocation
    ) {
      ctrl.refreshSummaryPageDataForGrid = refreshSummaryPageDataForGrid;

      if (
        _.isEqual(accountSummaryRow.ObjectType, 'EncounterBo') &&
        _.isNil(accountSummaryRowDetail)
      ) {
        ctrl.deleteEncounter(accountSummaryRow, loggedInLocation);
      }
    };

    ctrl.deleteEncounter = function (row, loggedInLocation) {
      if (!row.$$isMultiLocationEncounter) {
        if (
          !patSecurityService.IsAuthorizedByAbbreviationAtLocation(
            ctrl.soarAuthEnctrDeleteKey,
            row.EncounterServiceLocationIds[0]
          )
        ) {
          toastrFactory.error(
            patSecurityService.generateMessage(ctrl.soarAuthEnctrDeleteKey),
            'Not Authorized'
          );
          return;
        }
      } else {
        // Covers the unlikely scenario that encounter has services from multiple locations. No longer able to create in Fuse.
        _.each(row.EncounterServiceLocationIds, function (loc) {
          if (
            !patSecurityService.IsAuthorizedByAbbreviationAtLocation(
              ctrl.soarAuthEnctrDeleteKey,
              loc
            )
          ) {
            toastrFactory.error(
              patSecurityService.generateMessage(ctrl.soarAuthEnctrDeleteKey),
              'Not Authorized'
            );
            return;
          }
        });
      }
      var deletingFromServiceLoc = !row.$$isMultiLocationEncounter
        ? _.isEqual(loggedInLocation, row.EncounterServiceLocationIds[0])
        : _.includes(row.EncounterServiceLocationIds, loggedInLocation);
      var message = deletingFromServiceLoc
        ? localize.getLocalizedString('Do you wish to {0}.', [
            "keep the pending services from this encounter? If you choose to keep the services, they will return to 'Proposed' in the chart ledger and clinical timeline",
          ])
        : localize.getLocalizedString('{0} Do you wish to {1}, {2}', [
            'You are logged into a different location than is assigned to the pending encounter.',
            "keep the pending services from this encounter? If you choose to keep the services, they will return to 'Proposed' in the chart ledger and clinical timeline",
            'and will remain associated with their current location.',
          ]);
      var title = localize.getLocalizedString('Keep Proposed Services?');
      var button1Text = localize.getLocalizedString('Cancel');
      var button2Text = localize.getLocalizedString('No');
      var button3Text = localize.getLocalizedString('Yes');
      //'keepProposedServices' is necessary in this case, in order to get a proper result to put on ctrl.keepProposedServices
      modalFactory
        .ConfirmCancelModal(
          title,
          message,
          null,
          button1Text,
          button2Text,
          button3Text,
          'keepProposedServices'
        )
        .then(function (res) {
          ctrl.keepProposedServices = res;
          ctrl.deleteEncounterId = row.ObjectId;
          modalFactory.LoadingModal(ctrl.encounterDeleteCallSetup);
        });
    };

    ctrl.encounterDeleteCallSetup = function () {
      var service = [
        {
          Call: patientServices.Encounter.deleteEncounter,
          Params: {
            encounterId: ctrl.deleteEncounterId,
            keepServices: ctrl.keepProposedServices,
          },
          OnSuccess: ctrl.deleteEncounterSuccess,
          OnError: ctrl.deleteEncounterFailure,
        },
      ];
      return service;
    };

    ctrl.deleteEncounterSuccess = function () {
      toastrFactory.success(
        localize.getLocalizedString('{0} deleted successfully', [
          'Pending encounter',
        ]),
        localize.getLocalizedString('Success')
      );
      ctrl.refreshSummaryPageDataForGrid();
    };

    ctrl.deleteEncounterFailure = function (error) {
      if (!(error && (error.status === 409 || error.status === 404)))
        toastrFactory.error(
          localize.getLocalizedString('An error has occurred while {0}', [
            'deleting the pending encounter',
          ]),
          localize.getLocalizedString('Server Error')
        );
    };

    var service = {
      deleteAccountSummaryRowDetail: deleteAccountSummaryRowDetail,
    };

    return service;
  }
})();
