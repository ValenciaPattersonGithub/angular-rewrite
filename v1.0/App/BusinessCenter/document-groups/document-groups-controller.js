angular.module('Soar.BusinessCenter').controller('DocumentGroupsController', [
  '$scope',
  'localize',
  'patSecurityService',
  'toastrFactory',
  'ModalFactory',
  '$uibModalInstance',
  'documentGroups',
  'documentGroupsCallback',
  'DocumentGroupsFactory',
  '$location',
  function (
    $scope,
    localize,
    patSecurityService,
    toastrFactory,
    modalFactory,
    $uibModalInstance,
    documentGroups,
    documentGroupsCallback,
    documentGroupsFactory,
    $location
  ) {
    var ctrl = this;

    ctrl.$onInit = function () {
      $scope.documentGroupsTitle = 'Document Groups';
      $scope.mode = 'manageDocumentGroups';
      $scope.documentGroups = documentGroups;

      $scope.authAccess = documentGroupsFactory.access();
      if (!$scope.authAccess.View) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-doc-docorg-vgroup'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      }
    };

    $scope.close = function () {
      $uibModalInstance.close();
    };

    $scope.createDocumentGroup = function () {
      $scope.mode = 'editDocumentGroup';
      $scope.documentGroupForEdit = {
        Description: '',
        DocumentGroupId: null,
        IsSystemDocumentGroup: false,
      };
    };

    $scope.editDocumentGroup = function (documentGroup) {
      if (!documentGroup.IsSystemDocumentGroup) {
        $scope.mode = 'editDocumentGroup';
        $scope.documentGroupForEdit = documentGroup;
      }
    };

    $scope.deleteDocumentGroup = function (documentGroup) {
      if ($scope.authAccess.Delete && !documentGroup.IsSystemDocumentGroup) {
        documentGroupsFactory
          .DeleteDocumentGroup(documentGroup.DocumentGroupId)
          .then(function () {
            var index = _.findIndex($scope.documentGroups, {
              DocumentGroupId: documentGroup.DocumentGroupId,
            });
            if (index >= 0) {
              $scope.documentGroups.splice(index, 1);
            }
          })
          .catch(function (res) {
            if (
              !_.isNil(res) &&
              !_.isNil(res.data) &&
              !_.isNil(res.data.InvalidProperties)
            ) {
              var hasAttachedDocuments = _.find(
                res.data.InvalidProperties,
                function (invalidProperty) {
                  return (
                    invalidProperty.PropertyName === 'DocumentGroupId' &&
                    invalidProperty.ValidationMessage.indexOf(
                      'attached documents'
                    ) >= 0
                  );
                }
              );
              if (hasAttachedDocuments) {
                modalFactory.ConfirmModal(
                  localize.getLocalizedString('Attached Files'),
                  localize.getLocalizedString(
                    'Custom document groups with attached files cannot be deleted.'
                  ),
                  localize.getLocalizedString('OK')
                );
                return;
              }
            }
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to delete the {0} {1}. Please try again.',
                ['Document Group', { skip: documentGroup.Description }]
              ),
              localize.getLocalizedString('Server Error')
            );
          });
      }
    };

    $scope.documentGroupSaved = function (documentGroup, action) {
      $scope.mode = 'manageDocumentGroups';

      if (action === documentGroupsFactory.Actions.Create) {
        $scope.documentGroups.push(documentGroup);
      } else if (action === documentGroupsFactory.Actions.Update) {
        var index = _.findIndex($scope.documentGroups, {
          DocumentGroupId: documentGroup.DocumentGroupId,
        });
        if (index >= 0) {
          $scope.documentGroups.splice(index, 1, documentGroup);
        }
      }

      if (documentGroupsCallback) {
        documentGroupsCallback(documentGroup);
      }
    };

    $scope.cancel = function () {
      $scope.mode = 'manageDocumentGroups';
    };
  },
]);
