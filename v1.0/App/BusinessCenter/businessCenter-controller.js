'use strict';

angular.module('Soar.BusinessCenter').controller('BusinessCenterController', [
  '$scope',
  '$routeParams',
  'ListHelper',
  '$location',
  'toastrFactory',
  'patSecurityService',
  function (
    $scope,
    $routeParams,
    listHelper,
    $location,
    toastrFactory,
    patSecurityService
  ) {
    var ctrl = this;

    //#region Authorization
    ctrl.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation('soar-biz-biz-view');
    };

    ctrl.authAccess = function () {
      $scope.hasViewAccess = ctrl.authViewAccess();

      if (!$scope.hasViewAccess) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-biz-biz-view'),
          'Not Authorized'
        );
        $location.path('/');
      }
    };
    ctrl.authAccess();
    //#endregion

    $scope.templates = [
      {
        Category: 'PracticeSettings',
        Title: 'Practice Settings',
        Url: '#/BusinessCenter/PracticeSettings',
        TemplateUrl: 'App/BusinessCenter/practice-setup/practice-setup.html',
        Selected: true,
        amfa: 'soar-per-perdem-view',
        SubCategories: [
          {
            SubCategory: 'Locations',
            Title: 'Locations',
            Url: '#/BusinessCenter/PracticeSettings/Locations',
            TemplateUrl:
              'App/BusinessCenter/locations/location-landing/location-landing.html',
            amfa: 'soar-biz-bizloc-view',
          },
          {
            SubCategory: 'Identifiers',
            Title: 'Identifiers',
            Url: '#/BusinessCenter/PracticeSettings/Identifiers/',
            TemplateUrl:
              'App/BusinessCenter/identifiers/locations-identifiers/locations-identifiers.html',
            amfa: 'soar-biz-bizloc-view',
          },
        ],
      },
      {
        Category: 'Insurance',
        Title: 'Insurance',
        Url: '#/BusinessCenter/Insurance',
        TemplateUrl: 'App/BusinessCenter/insurance/insurance.html',
        Selected: false,
        amfa: 'soar-ins-ibcomp-view',
        SubCategories: [
          {
            SubCategory: 'Carriers',
            Title: 'Carriers',
            Url: '#/BusinessCenter/Insurance/Carriers',
            TemplateUrl: 'App/BusinessCenter/insurance/carriers/carriers.html',
            amfa: 'soar-ins-ibcomp-view',
            ignore: true,
            Actions: [
              {
                Action: 'Create',
                Url: '#/BusinessCenter/Insurance/Carriers/Create',
                TemplateUrl:
                  'App/BusinessCenter/insurance/carriers/carrier-crud/carrier-crud.html',
                amfa: 'soar-ins-ibcomp-add',
              },
              {
                Action: 'Edit',
                Url: '#/BusinessCenter/Insurance/Carriers/Edit',
                TemplateUrl:
                  'App/BusinessCenter/insurance/carriers/carrier-crud/carrier-crud.html',
                amfa: 'soar-ins-ibcomp-edit',
              },
              {
                Action: 'Landing',
                Url: '#/BusinessCenter/Insurance/Carriers/Landing',
                TemplateUrl:
                  'App/BusinessCenter/insurance/carriers/carrier-landing/carrier-landing.html',
                amfa: '',
              },
            ],
          },
          {
            SubCategory: 'Plans',
            Title: 'Plans',
            Url: '#/BusinessCenter/Insurance/Plans',
            TemplateUrl:
              'App/BusinessCenter/insurance/benefit-plans/dental-benefit-plans.html',
            amfa: 'soar-ins-ibplan-view',
            ignore: true,
            Actions: [
              {
                Action: 'Create',
                Url: '#/BusinessCenter/Insurance/Plans/Create',
                TemplateUrl:
                  'App/BusinessCenter/insurance/benefit-plans/dental-benefit-plan-crud/dental-benefit-plan-crud.html',
                amfa: 'soar-ins-ibplan-add',
              },
              {
                Action: 'Edit',
                Url: '#/BusinessCenter/Insurance/Plans/Edit',
                TemplateUrl:
                  'App/BusinessCenter/insurance/benefit-plans/dental-benefit-plan-crud/dental-benefit-plan-crud.html',
                amfa: 'soar-ins-ibplan-edit',
              },
            ],
          },
        ],
      },
      {
        Category: 'Receivables',
        Title: 'Total Receivables',
        Url: '#/BusinessCenter/Receivables',
        TemplateUrl: 'App/BusinessCenter/receivables/receivables.html',
        Selected: false,
        amfa: 'soar-per-perdem-view',
      },
      {
        Category: 'ViewDeposit',
        Title: 'Single Deposit View',
        Url: '#/BusinessCenter/ViewDeposit/',
        TemplateUrl:
          'App/BusinessCenter/receivables/deposits/deposit-view/deposit-view.html',
        Selected: false,
        amfa: 'soar-per-perdem-view',
      },
      {
        Category: 'MassUpdate',
        Title: 'Mass Updates',
        Url: '#/BusinessCenter/MassUpdate',
        Selected: false,
      },
      {
        Category: 'MassUpdateResults',
        Title: 'Mass Update Results',
        Url: '#/BusinessCenter/MassUpdateResults',
        Selected: false,
      },
      {
        Category: 'AppointmentsTransfer',
        Title: 'Mass Update Appointments Transfer',
        Url: '#/BusinessCenter/AppointmentsTransfer',
        Selected: false,
      },
    ];

    $scope.selectedCategoryIndex = 0;
    $scope.selectedSubCategoryIndex = 0;
    $scope.selectedActionIndex = 0;

    $scope.selectTemplate = function (index, subIndex, actionIndex) {
      index = index < 0 || index >= $scope.templates.length ? 0 : index; // If the index is out of the bounds of the array, set the value to 0.
      $scope.selectedCategoryIndex = index;

      if (subIndex >= 0) {
        $scope.selectedSubCategoryIndex = subIndex;

        if (actionIndex) {
          $scope.selectedActionIndex = actionIndex;
        }
      }

      angular.forEach($scope.templates, function (template) {
        template.Selected = false;
      });

      $scope.templates[$scope.selectedCategoryIndex].Selected = true;

      if (
        subIndex >= 0 &&
        (angular.isUndefined(actionIndex) || actionIndex < 0) &&
        $scope.templates[index].SubCategories[subIndex].ignore != true
      ) {
        $scope.activeUrl =
          $scope.templates[index].SubCategories[subIndex].TemplateUrl;
      } else if (subIndex >= 0 && actionIndex >= 0) {
        $scope.activeUrl =
          $scope.templates[index].SubCategories[subIndex].TemplateUrl;
      } else {
        $scope.activeUrl = $scope.templates[index].TemplateUrl;
      }
    };

    var category, subCategory, action;
    if ($routeParams.Category) {
      /** remove '?' */

      category = listHelper.findIndexByFieldValue(
        $scope.templates,
        'Category',
        $routeParams.Category.indexOf('?') !== -1
          ? $routeParams.Category.substring(0, $routeParams.Category.length - 1)
          : $routeParams.Category
      );

      if ($routeParams.SubCategory) {
        /** remove '?' */
        subCategory = listHelper.findIndexByFieldValue(
          $scope.templates[category].SubCategories,
          'SubCategory',
          $routeParams.SubCategory.indexOf('?') !== -1
            ? $routeParams.SubCategory.substring(
                0,
                $routeParams.SubCategory.length - 1
              )
            : $routeParams.SubCategory
        );

        if ($routeParams.Action && subCategory != -1) {
          /** remove '?' */
          action = listHelper.findIndexByFieldValue(
            $scope.templates[category].SubCategories[subCategory].Actions,
            'Action',
            $routeParams.Action.indexOf('?') !== -1
              ? $routeParams.Action.substring(0, $routeParams.Action.length - 1)
              : $routeParams.Action
          );

          $scope.selectTemplate(category, subCategory, action);
        } else {
          $scope.selectTemplate(category, subCategory);
        }
      } else {
        $scope.selectTemplate(category);
      }
    } else {
      $scope.selectTemplate(0);
    }
  },
]);
