'use strict';
var app = angular.module('Soar.BusinessCenter');

var userCrudWrapperController = app
  .controller('UserCrudWrapperController', [
    '$scope',
    '$route',
    '$http',
    'FeatureService',
    'taxonomyDropdownTemplate',
    'currentUser',
    'referenceDataService',
    function (
      $scope,
      $route,
      $http,
      featureService,
      taxonomyDropdownTemplate,
      currentUser,
      referenceDataService
    ) {
      var ctrl = this;
      // used to control whether to use converted view or not.
      $scope.useConverted = false;
      $scope.migrationFeatureFlagsLoaded = false;
      $scope.taxonomyDropdownTemplateData = taxonomyDropdownTemplate;
      $scope.currentUserData = currentUser;

      //#region conversion feature control
      ctrl.getConversionFlags = function () {
        featureService
          .isMigrationEnabled('NgMigration_TeamMemberCrud')
          .then(function (res) {
            $scope.useConverted = res;
            $scope.migrationFeatureFlagsLoaded = true;
          });
      };

      ctrl.getConversionFlags();
      //#endregion
    },
  ])
  .directive('userCrudControllerOriginal', function () {
    return {
      restrict: 'E',
      scope: { taxonomyDropdownTemplateData: '=', currentUserData: '=' },
      templateUrl: 'App/BusinessCenter/users/user-crud/user-crud.html',
      controller: 'UserCrudController',
    };
  });
//#region Resolve
userCrudWrapperController.resolveUserCrudControl = {
  taxonomyDropdownTemplate: [
    '$http',
    function ($http) {
      return $http.get('App/BusinessCenter/components/taxonomy-dropdown.html');
    },
  ],
  currentUser: [
    '$route',
    'referenceDataService',
    function ($route, referenceDataService) {
      var id = $route.current.params.userId;
      if (id) {
        var users = referenceDataService.get(
          referenceDataService.entityNames.users
        );
        var user = _.find(users, { UserId: id });
        return user;
      } else {
        return {
          UserId: '',
          FirstName: null,
          MiddleName: null,
          LastName: null,
          PreferredName: null,
          ProfessionalDesignation: null,
          DateOfBirth: null,
          UserName: null,
          ImageFile: null,
          EmployeeStartDate: null,
          EmployeeEndDate: null,
          Email: null,
          Address: {
            AddressLine1: null,
            AddressLine2: null,
            City: null,
            State: null,
            ZipCode: null,
          },
          DepartmentId: null,
          JobTitle: null,
          ProviderTypeId: null,
          TaxId: null,
          FederalLicense: null,
          DeaNumber: null,
          NpiTypeOne: null,
          PrimaryTaxonomyId: null,
          SecondaryTaxonomyId: null,
          StateLicense: null,
          AnesthesiaId: null,
          IsActive: true,
          StatusChangeNote: null,
        };
      }
    },
  ],
};
//#endregion
