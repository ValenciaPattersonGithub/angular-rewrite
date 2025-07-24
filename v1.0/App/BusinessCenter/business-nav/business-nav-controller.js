'use strict';

angular.module('Soar.BusinessCenter').controller('BusinessNavController', [
  '$scope',
  '$location',
  'patSecurityService',
  '$filter',
  function ($scope, $location, patSecurityService, $filter) {
    var ctrl = this;
    ctrl.path = $location.path();

    $scope.initialize = function () {
      $scope.getActiveTab();
    };

    ctrl.authPracticeAtAGlanceViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation('soar-dsh-dsh-view');
    };

    ctrl.authReceivablesViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-biz-bizrcv-view'
      );
    };

    ctrl.authReportsViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-report-report-view'
      );
    };

    ctrl.handleLocationChange = function () {
      var practiceAtAGlanceTab = $scope.tabs.find(function (tab) {
        return tab.Title === 'Practice At A Glance';
      });
      if (practiceAtAGlanceTab) {
        practiceAtAGlanceTab.Disabled = !ctrl.authPracticeAtAGlanceViewAccess();
      }
    };

    $scope.$on('patCore:load-location-display', function () {
      ctrl.handleLocationChange();
    });

    $scope.$on('patCore:initlocation', function () {
      ctrl.handleLocationChange();
    });

    $scope.getActiveTab = function () {
      // Set true when a tab is selected.
      var tabHasBeenSelected = false;

      $scope.tabs.forEach(function (tab) {
        // Ignore first character in tab.Url so it can be matched against the actual URL.
        var tabpath = tab.Url.substring(1, tab.Url.length);

        // Check tabpath for length to ensure one of the disabled tabs don't match.
        if (ctrl.path.includes(tabpath) && tabpath.length > 1) {
          tab.Selected = true;
          tabHasBeenSelected = true;
        }
      });

      if (!tabHasBeenSelected) {
        // sub-sections in Practice Settings don't follow the expected URL format of
        // '/Business/PracticeSettings/<section>', just set Practice Settings as selected.
        $scope.tabs[$scope.tabs.length - 2].Selected = true;
      }
    };

    // adding active class based on location and AMFA
    $scope.getModifierClass = function (section) {
      //undefined should be used for the active buttons at the top of the Business Center
      //'active' works for the links
      //'inactive' works for both buttons and links
      var cls = undefined;
      switch (section) {
        case 'glance':
          cls = ctrl.authPracticeAtAGlanceViewAccess() ? undefined : 'inactive';
          if (ctrl.path.indexOf('/BusinessCenter/PracticeAtAGlance') !== -1) {
            cls = 'active';
          }
          break;
        case 'goals':
          cls = 'inactive';
          break;
        case 'reports':
          cls = ctrl.authReportsViewAccess() ? undefined : 'inactive';
          if (ctrl.path.indexOf('/BusinessCenter/Reports') !== -1) {
            cls = 'active';
          }
          break;
        case 'insights':
          cls = 'inactive';
          break;
        case 'insurance':
          if (ctrl.path.indexOf('/BusinessCenter/Insurance') !== -1) {
            cls = 'active';
          }
          break;
        case 'receivables':
          cls = ctrl.authReceivablesViewAccess() ? undefined : 'inactive';
          if (ctrl.path.indexOf('/BusinessCenter/Receivables') !== -1) {
            cls = 'active';
          }
          break;
        case 'forms':
          if (ctrl.path.indexOf('/BusinessCenter/FormsDocuments') !== -1) {
            cls = 'active';
          }
          break;
        case 'setup':
          if (
            ctrl.path.indexOf('/BusinessCenter/PracticeSettings') !== -1 ||
            ctrl.path === '/BusinessCenter/NoteTemplates/' ||
            ctrl.path === '/BusinessCenter/ServiceCode/' ||
            ctrl.path.indexOf('BusinessCenter/Users/') !== -1 ||
            ctrl.path.indexOf('BusinessCenter/Roles/') !== -1 ||
            ctrl.path.indexOf('BusinessCenter/PreventiveCare/') !== -1
          ) {
            cls = 'active';
          }
          break;
      }
      return cls;
    };

    $scope.navigateToReceivables = function (e) {
      if (ctrl.authReceivablesViewAccess()) {
        window.location = e;
      }
    };

    $scope.navigateTo = function (e) {
      window.location = e;
    };
    $scope.tabs = [
      {
        Title: 'Practice At A Glance',
        Url: '#/BusinessCenter/PracticeAtAGlance',
        TemplateUrl:
          'App/BusinessCenter/practice-at-a-glace/practice-at-a-glance.html',
        title: 'Practice At A Glance',
        IconClass: 'fa fa-th-large fa-3x',
        Selected: false,
        Disabled: !ctrl.authPracticeAtAGlanceViewAccess(),
        Target: '_self',
      },
      {
        Title: 'Goals',
        Url: '#/',
        TemplateUrl:
          'App/Patient/patient-profile/patient-overview/patient-overview.html',
        title: 'Goals',
        IconClass: 'fas fa-chart-line fa-3x',
        Selected: false,
        Disabled: true,
        Target: '_self',
      },
      {
        Title: 'Reports',
        Url: '#/BusinessCenter/Reports',
        TemplateUrl: 'App/BusinessCetner/reports/reports-page.html',
        title: 'Reports',
        IconClass: 'far fa-file fa-3x',
        Selected: false,
        Disabled: false,
        Target: '_self',
      },
      {
        Title: 'Insights',
        Url: '#/',
        TemplateUrl:
          'App/Patient/patient-profile/patient-overview/patient-overview.html',
        title: 'Insights',
        IconClass: 'far fa-lightbulb fa-3x',
        Selected: false,
        Disabled: true,
        Target: '_self',
      },
      {
        Title: 'Insurance',
        Url: '#/BusinessCenter/Insurance',
        TemplateUrl: 'App/BusinessCenter/insurance/insurance.html',
        title: 'Claims & Predeterminations',
        IconClass: 'fa fa-umbrella fa-3x',
        Selected: false,
        Disabled: false,
        Target: '_self',
      },
      {
        Title: 'Receivables',
        Url: '#/BusinessCenter/Receivables',
        TemplateUrl:
          'App/Patient/patient-profile/patient-overview/patient-overview.html',
        title: 'Receivables',
        IconClass: 'fa fa-download fa-3x',
        Selected: false,
        Disabled: false,
        Target: '_self',
      },
      {
        Title: 'Forms & Documents',
        Url: '#/BusinessCenter/FormsDocuments',
        TemplateUrl: 'App/BusinessCetner/forms-documents/forms-documents.html',
        title: 'Forms & Documents',
        IconClass: 'far fa-folder-open fa-3x',
        Selected: false,
        Disabled: false,
        Target: '_self',
      },
      {
        Title: 'Practice Settings',
        Url: '#/BusinessCenter/PracticeSettings',
        TemplateUrl: 'App/BusinessCenter/PracticeSettings',
        title: 'Practice Settings',
        IconClass: 'fa fa-cog fa-3x',
        Selected: false,
        Disabled: false,
        Target: '_self',
      },
      {
        Title: 'Patterson Marketplace',
        Url: 'https://www.pattersondental.com/',
        TemplateUrl: 'App/BusinessCenter/PracticeSettings',
        IconClass: 'fa fa-home fa-3x',
        Selected: false,
        Disabled: false,
        Target: '_blank',
      },
    ];

    // disable tabs
    if ($scope.disableTabs) {
      angular.forEach($scope.tabs, function (tab) {
        tab.Disabled = true;
        tab.Selected = false;
        tab.Url = 'javascript:void(0)';
      });
    }

    $scope.SelectTab = function (selectedTab) {
      if (selectedTab.Title === 'Patterson Marketplace') {
        return;
      } else {
        $scope.selectedTab = selectedTab;
        //disable tab selection
        if (selectedTab.Disabled) {
          event.preventDefault();
        } else {
          if ($scope.disableTabs) {
            return;
          }

          //$scope.activeUrl = selectedTab.TemplateUrl;
          angular.forEach($scope.tabs, function (tab) {
            if (tab.Url != $scope.selectedTab.Url) {
              tab.Selected = false;
            } else {
              tab.Selected = true;
              document.title = selectedTab.title;
            }
          });
        }
      }
    };
  },
]);
