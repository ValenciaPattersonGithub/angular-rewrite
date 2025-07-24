'use strict';

angular
  .module('Soar.BusinessCenter')
  .controller('TeamMembersSettingsController', [
    '$scope',
    '$routeParams',
    'ListHelper',
    'localize',
    '$location',
    'CommonServices',
    '$injector',
    'FuseFlag',
    'patSecurityService',
    function (
      $scope,
      $routeParams,
      listHelper,
      localize,
      $location,
      commonServices,
      $injector,
      fuseFlag,
      patSecurityService
    ) {
      var ctrl = this;

      ctrl.inputValue = 'Team Members';
      ctrl.sections = [
        'Users',
        'Additional Identifiers',
        'Add a Team Member',
        'Assign Roles',
        'Provider Goals'
      ];

      // used by the generic template
      $scope.idPrefix = 'team-member-';
      $scope.iconClass = 'fa-users';
      $scope.header = 'Team Members';

      // adding links for each sections
      ctrl.addLinks = function () {
        angular.forEach($scope.list, function (item) {
          switch (item.Section) {
            case ctrl.sections[0]:
              item.Link = '#/BusinessCenter/Users/';
              break;
            case ctrl.sections[1]:
              item.Link = '#/BusinessCenter/Users/UserIdentifiers/';
              break;
            case ctrl.sections[2]:
              item.Link = '#/BusinessCenter/Users/Create/';
              item.AmfaAbbreviation =
                'plapi-user-usr-read,plapi-user-usr-create';
              break;
            case ctrl.sections[3]:
              item.Link = '#/BusinessCenter/Users/Roles/';
              item.AmfaAbbreviation =
                'plapi-user-usrrol-read,plapi-user-usrrol-create,plapi-user-usrrol-delete';
              break;
            case ctrl.sections[4]:
                  item.Link = '#/practiceSettings/';
                item.AmfaAbbreviation =
                    'soar-per-perhst-view';
                break;
          }
        });
      };

        ctrl.success = function (res) {
        if (res && res.Value && res.Value.Sections) {
          $scope.listIsLoading = false;
          $scope.list = res.Value.Sections;
          //$scope.list.push({ Section: 'Additional Identifiers' });
          $scope.list.push({ Section: 'Add a Team Member' });
          $scope.list.push({ Section: 'Assign Roles' });
            
          $injector.get('FeatureFlagService').getOnce$(fuseFlag.ShowProviderGoals).subscribe((value) => {
              $scope.ShowProviderGoals = value;
              if ($scope.ShowProviderGoals && ctrl.authViewAccess()) {
                  $scope.list.push({ Section: 'Provider Goals' });
              }
          });
          
          ctrl.addLinks();
        }
        };

    ctrl.authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation('soar-per-perhst-view');
    };



      ctrl.failure = function () {
        $scope.listIsLoading = false;
        };

      ctrl.loadLists = function () {
        // for noResults directive
        $scope.listIsLoading = true;
        commonServices.PracticeSettings.PracticeSetup.Retrieve({ InputValue: ctrl.inputValue }).$promise.then(ctrl.success, ctrl.failure);
      };

      ctrl.loadLists();


      // click handler for modals
      $scope.openModal = function (template, modifierClass) {
        // placeholder - no modals in this section yet
        if (template && modifierClass !== 'inactive') {
          switch (template) {
            case 'App/BusinessCenter/identifiers/team-member-identifiers/team-member-identifiers-crud.html':
              var title = localize.getLocalizedString('Additional Identifiers');
              var amfaValue = 'soar-biz-bizgrp-view';
              ctrl.instantiateModal(title, amfaValue, template);
              break;
          }
        }
      };

      // determines whether the inactive or complete class are added
      $scope.getModifierClass = function (item) {
        var cls = '';
        switch (item.Section) {
          case ctrl.sections[0]:
            if (item.Count > 0) {
              cls = 'complete';
            }
            break;
          case ctrl.sections[1]:
            if (item.Count > 0) {
              cls = 'complete';
            }
            break;
          case ctrl.sections[2]:
            cls = 'complete bold';
            break;
          case ctrl.sections[3]:
            cls = 'complete bold';
                break;
          case ctrl.sections[4]:
            if (item.Section == "Provider Goals") {
                cls = 'complete bold';
            }else
            {
              cls = 'complete';
            }
            break;
        }
        return cls;
      };

      // display the info inside the parens, either a number or text
      $scope.displayAdditionalContent = function (item) {
        var content = '';
        switch (item.Section) {
          case ctrl.sections[0]:
            content = '(' + item.Count + ')';
            break;
          case ctrl.sections[1]:
            content = '(' + item.Count + ')';
            break;
        }
        return content;
      };

      // for the when the desired display name differs from what is returned by the service
      $scope.displayName = function (item) {
        var name = item.Section;
        switch (item.Section) {
          case ctrl.sections[0]:
            name = 'All Team Members';
            break;
          case ctrl.sections[1]:
            name = 'Additional Identifiers';
            break;
          case ctrl.sections[2]:
            name = 'Add a Team Member';
            break;
          case ctrl.sections[3]:
            name = 'Assign Roles';
            break;
          case ctrl.sections[4]:
            if (this.showProviderGoals) 
            name = 'Provider Goals';
            break;
        }
        return name;
      };
    },
  ]);
