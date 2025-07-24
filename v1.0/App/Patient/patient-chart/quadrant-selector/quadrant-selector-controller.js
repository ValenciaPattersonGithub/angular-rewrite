(function () {
  'use strict';

  angular.module('Soar.Patient').controller('QuadrantSelectorController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    'localize',
    'patSecurityService',
    'ToothSelectionService',
    'PatientOdontogramFactory',
    'ModalFactory',
    'FeatureService',
    function (
      $scope,
      $rootScope,
      $routeParams,
      localize,
      patSecurityService,
      toothSelector,
      patientOdontogramFactory,
      modalFactory,
      featureService
    ) {
      var ctrl = this;

      // String literals used on the view
      $scope.viewText = {
        selectionTools: localize.getLocalizedString('Selection Tools'),
        clear: localize.getLocalizedString('Clear'),
        upper: localize.getLocalizedString('Upper Teeth'),
        lower: localize.getLocalizedString('Lower Teeth'),
        all: localize.getLocalizedString('All Teeth'),
        actions: localize.getLocalizedString('Actions'),
        supernumerary: localize.getLocalizedString('Supernumerary Teeth'),
        exportToPdf: localize.getLocalizedString('Export Clinical Data'),
      };
      //TODO: Rename this to viewText and change this in the quadrant-selector-new control in the quadrant-selector-new.html
      $scope.viewText2 = {
        selectionTools: localize.getLocalizedString('Selections'),
        clear: localize.getLocalizedString('Clear'),
        upper: localize.getLocalizedString('Upper Teeth'),
        lower: localize.getLocalizedString('Lower Teeth'),
        all: localize.getLocalizedString('All Teeth'),
        actions: localize.getLocalizedString('Actions'),
        supernumerary: localize.getLocalizedString('Supernumerary Teeth'),
        exportToPdf: localize.getLocalizedString('Export Clinical Data'),
      };
      // End string literals used on the view

      // Scope variables
      $scope.ogmEditAuthAbbrev = 'soar-clin-codogm-edit';
      $scope.patientId = $routeParams.patientId;
      // End scope variables

      // Scope functions
      $scope.clearSelection = clearSelection;
      $scope.selectToothGroup = selectToothGroup;
      $scope.togglePrimary = togglePrimary;
      $scope.openSupernumeraryModal = openSupernumeraryModal;
      $scope.onExportToPdfClicked = onExportToPdfClicked;
      // End scope functions

      // Controller functions
      ctrl.authEditOdontogramAccess = authEditOdontogramAccess;
      ctrl.authAccess = authAccess;
      // End controller functions

      ctrl.authAccess();

      // Implementation details
      function authEditOdontogramAccess() {
        return patSecurityService.IsAuthorizedByAbbreviation(
          $scope.ogmEditAuthAbbrev
        );
      }

      $scope.$on('soar:openCommunicationModal', function () {
        $scope.clearSelection();
      });

      $scope.onExportPdfSuccess = function () {
        $scope.docCtrls.close();
        $scope.showQuandrantSelectionMenu = false;
      };

      $scope.onExportPdfCancel = function () {
        $scope.docCtrls.close();
        $scope.showQuandrantSelectionMenu = false;
      };

      function clearSelection() {
        toothSelector.selection.teeth = [];
        patientOdontogramFactory.setSelectedTeeth(null);
        hideQuadrantSelector();
      }

      function openSupernumeraryModal() {
        if ($scope.hasEditOdontogramAccess) {
          patientOdontogramFactory.setCloseToothOptions(true);

          // instantiate modal
          var modalInstance = modalFactory.Modal({
            amfa: $scope.ogmEditAuthAbbrev,
            backdrop: 'static',
            controller: 'SupernumeraryToothSelectorController',
            templateUrl:
              'App/Patient/patient-chart/supernumerary-tooth-selector/supernumerary-tooth-selector.html',
            windowClass: 'modal-65',
          });
        }

        hideQuadrantSelector();
      }

      function togglePrimary(togglePrimary) {
        if ($scope.hasEditOdontogramAccess) {
          $rootScope.$broadcast('soar:odo-toggle-primary', togglePrimary);
        }
      }

      function selectToothGroup(type, position) {
        patientOdontogramFactory.setSelectedTeeth(null);
        toothSelector.selectToothGroup(type, position);

        hideQuadrantSelector();
      }

      function authAccess() {
        if (ctrl.authEditOdontogramAccess()) {
          $scope.hasEditOdontogramAccess = true;
        }
      }

      function hideQuadrantSelector() {
        // This variable is set on the parent controller and passed in to this directive. The parent element of this directive is ng-if'd with this value.
        $scope.showQuandrantSelectionMenu = false;
      }

      function onExportToPdfClicked() {
        $scope.docCtrls
          .content(`<export-chart (export-cancel-event)="onExportPdfCancel($event)"
                                                           (export-success-event)="onExportPdfSuccess($event)"
                                                           [patient-id]="patientId">
                                             <export-chart>`);
        $scope.docCtrls.setOptions({
          resizable: false,
          position: {
            top: '35%',
            left: '35%',
          },
          minWidth: 300,
          scrollable: false,
          iframe: false,
          actions: ['Close'],
          title: 'Export Clinical Data to PDF',
          modal: true,
        });

        $scope.docCtrls.open();
      }
    },
  ]);
})();
