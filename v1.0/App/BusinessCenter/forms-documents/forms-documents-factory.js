'use strict';

angular.module('common.factories').factory('FormsDocumentsFactory', [
  '$q',
  'toastrFactory',
  'localize',
  'patSecurityService',
  'RecentDocumentsService',
  function (
    $q,
    toastrFactory,
    localize,
    patSecurityService,
    recentDocumentsService
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
        'soar-doc-docimp-add'
      );
    };

    factory.authDeleteAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-doc-docimp-delete'
      );
    };

    factory.authEditAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-doc-docimp-edit'
      );
    };

    factory.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-doc-docimp-view'
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

    // update recent documents list (takes a list of document ids) and returns recent document list
    factory.updateRecentDocuments = function (documents) {
      // if documents is single object, add to list before update
      var recentDocuments = [];
      if (_.isArray(documents)) {
        recentDocuments = _.cloneDeep(documents);
      } else {
        recentDocuments.push(documents);
      }

      // get a unique list of documentIds
      var recentDocumentIds = [];
      recentDocumentIds = _.uniq(_.map(recentDocuments, 'DocumentId'));

      var defer = $q.defer();
      var promise = defer.promise;
      if (factory.authCreateAccess()) {
        recentDocumentsService
          .update({ returnList: true }, recentDocumentIds)
          .$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to update the {0} {1}. Please try again.',
                  ['Recent', 'documents']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
      }
      return promise;
    };

    return {
      access: function () {
        return factory.authAccess();
      },
      UpdateRecentDocuments: function (document) {
        return factory.updateRecentDocuments(document);
      },
    };
  },
]);
