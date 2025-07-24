'use strict';

angular.module('Soar.Patient').controller('OdontogramSnapshotController', [
  '$scope',
  'PatientOdontogramFactory',
  'OdontogramSnapshotWorkerFactory',
  'fileService',
  'toastrFactory',
  'localize',
  'FileUploadFactory',
  function (
    $scope,
    patientOdontogramFactory,
    snapshotWorkerFactory,
    fileService,
    toastrFactory,
    localize,
    fileUploadFactory
  ) {
    var ctrl = this;
    $scope.patientOdontogram = {};
    $scope.savingOdontogram = false;
    $scope.snapshotIsDirty = false;

    ctrl.defaultImageSrc = 'Images/Teeth/DefaultSnapshot.png';

    //#region Authorization

    ctrl.init = function () {
      $scope.authAccess = patientOdontogramFactory.access();
      if ($scope.personId) {
        patientOdontogramFactory
          .get($scope.personId)
          .then(ctrl.odontogramGetSuccess, ctrl.retrievalFailure);
      }
    };

    ctrl.retrievalFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the {0}. Refresh the page to try again.',
          ['Odontogram Snapshot']
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    ctrl.odontogramGetSuccess = function (res) {
      if (res && res.Value) {
        $scope.patientOdontogram = res.Value;
        var snapshotId = res.Value.SnapshotAllocationId;
        if (snapshotId && snapshotId > 0) {
          fileUploadFactory
            .CreatePatientDirectory(
              {
                PatientId: $scope.personId,
                DirectoryAllocationId: $scope.patientDirectoryId,
              },
              null,
              'plapi-files-fsys-write'
            )
            .then(function () {
              fileService
                .downloadFile(snapshotId)
                .then(ctrl.fileDownloadSuccess, ctrl.retrievalFailure);
              return;
            }, ctrl.retrievalFailure);
        } else {
          $scope.imageSrc = ctrl.defaultImageSrc;
        }

        if ($scope.patientOdontogram.SnapshotIsDirty === true) {
          $scope.snapshotIsDirty = true;
          if ($scope.patientOdontogram.SnapshotUpdateQueued === false) {
            $scope.updateSnapshot();
          } else if ($scope.patientOdontogram.SnapshotDateInvalidated != null) {
            var age = moment()
              .utc()
              .diff(
                moment.utc($scope.patientOdontogram.SnapshotDateInvalidated),
                'minutes'
              );
            if (age > 5) $scope.updateSnapshot();
          }
        }
      } else {
        $scope.imageSrc = ctrl.defaultImageSrc;
      }
    };

    ctrl.fileDownloadSuccess = function (res) {
      if (res && res.data) {
        $scope.imageSrc = res.data;
      } else {
        ctrl.retrievalFailure();
      }
    };

    // calling init function explicitly as a hopeful fix to an sporadic issue where the snapshot doesn't always update after chart changes
    ctrl.init();

    $scope.updateSnapshot = function () {
      $scope.showRetryMessage = false;
      snapshotWorkerFactory.getSnapshot(
        $scope.personId,
        ctrl.snapshotWorkerSuccess,
        ctrl.snapshotWorkerFailure
      );
    };

    ctrl.snapshotWorkerSuccess = function (res) {
      if (!_.isNil(res) && !_.isNil(res.Value)) {
        if (!_.isNil(res.Value.ImageData) && res.Value.ImageData.length > 0) {
          $scope.imageSrc = res.Value.ImageData;
          $scope.snapshotIsDirty = false;
        } else {
          ctrl.odontogramGetSuccess(res);
        }
      } else {
        $scope.showRetryMessage = true;
      }
    };

    ctrl.snapshotWorkerFailure = function (res) {
      if (
        !_.isNil(res) &&
        !_.isNil(res.Value) &&
        res.Value.SnapshotIsDirty === false
      ) {
        ctrl.odontogramGetSuccess(res);
      } else {
        $scope.showRetryMessage = true;
      }
    };

    $scope.$on('fuse:overview-refresh-odontogram', function () {
      ctrl.init();
    });
  },
]);
