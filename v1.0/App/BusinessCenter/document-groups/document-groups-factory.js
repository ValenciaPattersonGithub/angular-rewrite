'use strict';

angular.module('common.factories').factory('DocumentGroupsFactory', [
  '$q',
  'toastrFactory',
  'localize',
  'patSecurityService',
  'DocumentGroupsService',
  function (
    $q,
    toastrFactory,
    localize,
    patSecurityService,
    documentGroupsService
  ) {
    var factory = this;

    //#region authorization

    factory.documentAccess = {
      Create: false,
      View: false,
      Edit: false,
      Delete: false,
    };

    factory.authCreateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-doc-docorg-agroup'
      );
    };

    factory.authDeleteAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-doc-docorg-dgroup'
      );
    };

    factory.authEditAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-doc-docorg-egroup'
      );
    };

    factory.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-doc-docorg-vgroup'
      );
    };

    factory.authAccess = function () {
      if (factory.authViewAccess()) {
        factory.documentAccess.View = true;
      }
      if (factory.authEditAccess()) {
        factory.documentAccess.Edit = true;
      }
      if (factory.authDeleteAccess()) {
        factory.documentAccess.Delete = true;
      }
      if (factory.authCreateAccess()) {
        factory.documentAccess.Create = true;
      }
      return factory.documentAccess;
    };

    //endregion

    // get all document groups
    factory.getDocumentGroups = function () {
      var defer = $q.defer();
      var promise = defer.promise;
      if (factory.authCreateAccess()) {
        documentGroupsService.get().$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the {0}. Refresh the page to try again.',
                ['Document Groups']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
      return promise;
    };

    // create or edit a document group
    factory.saveDocumentGroup = function (documentGroupDto) {
      var defer = $q.defer();
      var promise = defer.promise;
      var isNew = _.isNil(documentGroupDto.DocumentGroupId);
      var accessFn = isNew ? factory.authCreateAccess : factory.authEditAccess;
      if (accessFn()) {
        var saveFn = isNew
          ? documentGroupsService.save
          : documentGroupsService.update;
        saveFn(documentGroupDto).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
            toastrFactory.success(
              localize.getLocalizedString('Successfully saved the {0}.', [
                'Document Group',
              ]),
              localize.getLocalizedString('Success')
            );
          },
          function (res) {
            //Additional handling if the error is due to duplicate Description
            defer.reject(res);
          }
        );
      }
      return promise;
    };

    factory.deleteDocumentGroup = function (documentGroupId) {
      var defer = $q.defer();
      var promise = defer.promise;
      if (factory.authDeleteAccess()) {
        documentGroupsService.delete({ Id: documentGroupId }).$promise.then(
          function () {
            defer.resolve();
            toastrFactory.success(
              localize.getLocalizedString('Successfully deleted the {0}.', [
                'Document Group',
              ]),
              localize.getLocalizedString('Success')
            );
          },
          function (res) {
            //Additional handling if the error is due to attached documents
            defer.reject(res);
          }
        );
      }
      return promise;
    };

    return {
      access: function () {
        return factory.authAccess();
      },
      DocumentGroups: function () {
        return factory.getDocumentGroups();
      },
      SaveDocumentGroup: function (documentGroupDto) {
        return factory.saveDocumentGroup(documentGroupDto);
      },
      DeleteDocumentGroup: function (documentGroupId) {
        return factory.deleteDocumentGroup(documentGroupId);
      },
      Actions: {
        Create: 'create',
        Update: 'update',
        Delete: 'delete',
      },
    };
  },
]);
