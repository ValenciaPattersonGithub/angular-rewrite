(function () {
  'use strict';
  var app = angular
    .module('Soar.BusinessCenter')
    .controller('ReportsLandingController', ReportsLandingController);
  ReportsLandingController.$inject = [
    '$scope',
    'localize',
    '$location',
    'ReportsFactory',
    'ModalFactory',
    '$window',
    'patSecurityService',
    'toastrFactory',
    'ReportCategories',
    'FeatureService',
    'ReportsService',
    'tabLauncher',
    'FeatureFlagService',
    'FuseFlag',
  ];
  function ReportsLandingController(
    $scope,
    localize,
    $location,
    reportsFactory,
    modalFactory,
    $window,
    patSecurityService,
    toastrFactory,
    ReportCategories,
    featureService,
    reportsService,
    tabLauncher,
    featureFlagService,
    fuseFlag
  ) {
    BaseCtrl.call(this, $scope, 'ReportsLandingController');
    //initialization values
    var ctrl = this;
    var patientsByBenefitPlanlaunchDarklyStatus = false;
      var serviceCodeByServiceTypeProductivitylaunchDarklyStatus = false;
      var releaseOldReferalReportslaunchDarklyStatus = false;
    sessionStorage.removeItem('dateType');
    $scope.displayMoreInfo = true;
    $scope.currentCategory = 0;
    $scope.customReports = 10;
    $scope.categories = [];
    $scope.filteredReports = [];
    $scope.userSearch = '';
    $scope.ReportCategories = ReportCategories;
    $scope.customReportFilter = {
      ReportCategory: 'Show Only Custom Reports',
      ReportCategoryValue: 10,
      Selected: false,
    };
    $scope.favoriteReportFilter = {
      ReportCategory: 'Show Only Favorite Reports',
      ReportCategoryValue: 11,
      Selected: false,
    };
    ctrl.includeCustomReports = false;
    ctrl.includeFavoriteReports = false;
    $scope.filtersAppiled = 0;
    $scope.reportTypes = [
      {
        ReportCategory: 'Select/Deselect All',
        ReportCategoryValue: 0,
        Selected: true,
      },
      { ReportCategory: 'Activity', ReportCategoryValue: 9, Selected: true },
      { ReportCategory: 'Clinical', ReportCategoryValue: 7, Selected: true },
      { ReportCategory: 'Financial', ReportCategoryValue: 6, Selected: true },
      { ReportCategory: 'Insurance', ReportCategoryValue: 1, Selected: true },
      { ReportCategory: 'Patient', ReportCategoryValue: 2, Selected: true },
      { ReportCategory: 'Provider Goals', ReportCategoryValue: 12, Selected: true },
      { ReportCategory: 'Provider', ReportCategoryValue: 3, Selected: true },
      { ReportCategory: 'Referral', ReportCategoryValue: 8, Selected: true },
      { ReportCategory: 'Schedule', ReportCategoryValue: 4, Selected: true },
      { ReportCategory: 'Service', ReportCategoryValue: 5, Selected: true },
    ];

    ctrl.$onInit = function () {
      $scope.developmentMode = false;
      featureService.isEnabled('DevelopmentMode').then(function (res) {
        $scope.developmentMode = res;
      });
      ctrl.getListOfAvailableReports();
      $scope.breadcrumbs = [
        {
          name: localize.getLocalizedString('Business Center'),
          path: '/BusinessCenter/PracticeSettings/',
          title: 'Practice Settings',
        },
        {
          name: localize.getLocalizedString('Reports'),
          path: '/BusinessCenter/Reports/',
          title: 'Reports',
        },
      ];
      var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
      ctrl.userLocation = typeof !_.isUndefined(cachedLocation)
        ? cachedLocation
        : null;
    };

    // check on whether to enable report link
    $scope.checkAccess = function (amfa) {
      var value =
        patSecurityService.IsAuthorizedByAbbreviation(amfa) ||
        patSecurityService.IsAuthorizedByAbbreviationAtLocation(
          amfa,
          ctrl.userLocation.id
        );
      return !value;
    };

    // handle URL update for breadcrumbs
    $scope.changePageState = function (breadcrumb) {
      document.title = breadcrumb.title;
      $location.url(breadcrumb.path);
    };

    ctrl.deleteCustomReport = function (report) {
      return function () {
        reportsFactory.DeleteCustomReport(report.Id).then(function (res) {
          if (res.$resolved) {
            $scope.originalReports = _.reject(
              $scope.originalReports,
              function (listReport) {
                return listReport.Id === report.Id;
              }
            );
            $scope.reports = _.reject($scope.reports, function (listReport) {
              return listReport.Id === report.Id;
            });
          }
        });
      };
    };

    $scope.navigate = function (url) {
      tabLauncher.launchNewTab(url);
    };

    $scope.deleteCustomReportConfirm = function (report) {
      var message = localize.getLocalizedString(
        'Are you sure you want to delete this report?'
      );
      var title = localize.getLocalizedString('Delete custom report');
      var button2Text = localize.getLocalizedString('No');
      var button1Text = localize.getLocalizedString('Yes');
      modalFactory
        .ConfirmModal(title, message, button1Text, button2Text)
        .then(ctrl.deleteCustomReport(report));
    };

    // calls the factory to get all the report metadata
    ctrl.getListOfAvailableReports = function () {
      reportsFactory.GetListOfAvailableReports().then(function (res) {
        if (res && res.Value) {
          $scope.originalReports = [];
          _.each(res.Value, function (rep) {
            rep.$$AmfaAbbrev = reportsFactory.GetAmfaAbbrev(rep.ActionId);
            rep.Name = _.escape(rep.Name);
            if (
              $scope.currentCategory == 0 ||
              $scope.currentCategory == rep.Category + 1
            ) {
              $scope.originalReports.push(rep);
            }
          });

          $scope.originalReports = ctrl.alphabetizeReportList(
            $scope.originalReports
            );

          featureFlagService.getOnce$(fuseFlag.ReportPatientsByBenefitPlan).subscribe((value) => {
              patientsByBenefitPlanlaunchDarklyStatus = value;
          });

          featureFlagService.getOnce$(fuseFlag.ReportServiceCodeByServiceTypeProductivity).subscribe((value) => {
              serviceCodeByServiceTypeProductivitylaunchDarklyStatus = value;
          });

          featureFlagService.getOnce$(fuseFlag.ReleseOldReferral).subscribe((value) => {
              releaseOldReferalReportslaunchDarklyStatus = value;
          });

          $scope.originalReports = _.filter(
            $scope.originalReports,
            x =>
              (x.Id !== 134 || (x.Id === 134 && $scope.developmentMode)) &&
              (x.Id !== 102 || (x.Id === 102 && $scope.developmentMode)) &&
              (x.Id !== 112 || (x.Id === 112 && $scope.developmentMode)) &&
              (x.Id !== 113 || (x.Id === 113 && $scope.developmentMode)) &&
              (x.Id !== 114 || (x.Id === 114 && $scope.developmentMode)) &&
              (x.Id !== 115 || (x.Id === 115 && $scope.developmentMode)) &&
              (x.Id !== 116 || (x.Id === 116 && $scope.developmentMode)) &&
              (x.Id !== 102 || (x.Id === 102 && $scope.developmentMode)) &&
              (x.Id !== 121 || (x.Id === 121 && $scope.developmentMode)) &&
              (x.Id !== 122 || (x.Id === 122 && $scope.developmentMode)) &&
              (x.Id !== 123 || (x.Id === 123 && $scope.developmentMode)) &&
              (x.Id !== 124 || (x.Id === 124 && $scope.developmentMode)) &&
              (x.Id !== 128 || (x.Id === 128 && $scope.developmentMode)) &&
              (x.Id !== 201 || (x.Id === 201 && patientsByBenefitPlanlaunchDarklyStatus)) &&
              (x.Id !== 129 || (x.Id === 129 && $scope.developmentMode)) &&
              (x.Id !== 203 || (x.Id === 203 && $scope.developmentMode)) &&
              (x.Id !== 207 || (x.Id === 207 && $scope.developmentMode)) &&
              (x.Id !== 15 || (x.Id === 15 && releaseOldReferalReportslaunchDarklyStatus)) &&
              (x.Id !== 39 || (x.Id === 39 && releaseOldReferalReportslaunchDarklyStatus)) &&
              (x.Id !== 43 || (x.Id === 43 && releaseOldReferalReportslaunchDarklyStatus)) &&
              (x.Id !== 217 || (x.Id === 217 && releaseOldReferalReportslaunchDarklyStatus) &&
              (x.Id !== 252 || (x.Id === 252 && $scope.developmentMode)) 
            )
          );
          $scope.customReportsExists = _.some($scope.originalReports, {
            IsCustomReport: true,
          });
          $scope.reports = _.cloneDeep($scope.originalReports);
          $scope.setDefaultCategory();
        }
      });
    };

    // click handler for generating a report, calls modal if report can be filtered
    $scope.generateReport = function (report) {
      sessionStorage.setItem('dateType', 'fromReports');
      sessionStorage.setItem('fromDashboard', true);
      reportsFactory.SetAmfa(report.$$AmfaAbbrev);
      var appName = '/BusinessCenter/';
      if (report.IsMFEReport && report.MFEAppRoute != ''){
        appName = '/' + report.MFEAppRoute + '/';
      }
      var path =
      appName +
        report.Route.charAt(0).toUpperCase() +
        report.Route.slice(1);
      //   + '/' + true
      reportsFactory.SetReportPath(path);
      reportsFactory.SetRequestBodyProperties(
        report.RequestBodyProperties ? report.RequestBodyProperties : null
      );
      reportsFactory.SetReportId(report.Id);
      reportsFactory.SetFuseReportTitle(report.Name);
      reportsFactory.SetReportCategoryId(report.Category);
      reportsFactory.SetNavigationFrom(false);
      window.open('/v1.0/index.html#' + _.escape(path));
      reportsFactory.AddViewedReportActivityEvent(
        report.Id,
        report.IsCustomReport
      );
    };

    // Alphabetically sort the list of reports by name.
    ctrl.alphabetizeReportList = function (reports) {
      _.each(reports, function (rep) {
        switch (rep.Category + 1) {
          case 1:
            rep.CategoryName = 'Insurance Reports';
            break;
          case 2:
            rep.CategoryName = 'Patient Reports';
            break;
          case 3:
            rep.CategoryName = 'Provider Reports';
            break;
          case 4:
            rep.CategoryName = 'Schedule Reports';
            break;
          case 5:
            rep.CategoryName = 'Service Reports';
            break;
          case 6:
            rep.CategoryName = 'Financial Reports';
            break;
          case 7:
            rep.CategoryName = 'Clinical Reports';
            break;
          case 8:
            rep.CategoryName = 'Referral Reports';
            break;
          case 9:
            rep.CategoryName = 'Activity Reports';
            break;
          case 12:
            rep.CategoryName = 'Provider Goals Reports';
            break;
        }
      });
      return _.sortBy(reports, ['CategoryName']);
    };

    ctrl.$onInit();

    $scope.changeFilter = function () {
      ctrl.getListOfAvailableReports();
    };

    $scope.categories = [1, 2, 3, 4, 5, 6, 7, 8, 9,12];
    $scope.toggleSelect = function (item) {
      $scope.userSearch = '';
      var selectedValue = item.ReportCategoryValue;
      $scope.reports.length = 0;
      $scope.filteredReports.length = 0;
      //   When all is selected/de selected if condition will be executed,
      //   when other category selected/de selected else condition will be executed
      if (selectedValue === 0) {
        if (item.Selected) {
          $scope.userSearch = '';
          $scope.categories = [1, 2, 3, 4, 5, 6, 7, 8, 9,12];
          _.each($scope.reportTypes, function (type) {
            type.Selected = true;
          });
          ctrl.filterWhenAll();
        } else {
          $scope.categories.length = 0;
          _.each($scope.reportTypes, function (type) {
            type.Selected = false;
          });
          $scope.filteredReports.length = 0;
        }
      } else {
        var valueExists = _.includes($scope.categories, selectedValue);
        if (!valueExists) {
          $scope.categories.push(selectedValue);
        } else {
          $scope.categories = _.reject($scope.categories, function (value) {
            return value === selectedValue;
          });
        }
        if (_.isEmpty($scope.categories)) {
          $scope.reportTypes[0].Selected = false;
          $scope.filteredReports.length = 0;
        } else {
          $scope.reportTypes[0].Selected =
            $scope.categories.length === $scope.reportTypes.length - 1
              ? true
              : false;
          ctrl.getfilteredReports();
        }
      }
      $scope.reports = _.sortBy($scope.filteredReports, ['CategoryName']);
    };

    ctrl.filterWhenAll = function () {
      if (ctrl.includeCustomReports && ctrl.includeFavoriteReports) {
        _.each($scope.originalReports, function (report) {
          if (report.IsCustomReport && report.IsFavoriteReport) {
            $scope.filteredReports.push(report);
          }
        });
      } else if (ctrl.includeCustomReports && !ctrl.includeFavoriteReports) {
        _.each($scope.originalReports, function (report) {
          if (report.IsCustomReport) {
            $scope.filteredReports.push(report);
          }
        });
      } else if (!ctrl.includeCustomReports && ctrl.includeFavoriteReports) {
        _.each($scope.originalReports, function (report) {
          if (report.IsFavoriteReport) {
            $scope.filteredReports.push(report);
          }
        });
      } else {
        $scope.filteredReports = _.cloneDeep($scope.originalReports);
      }
    };

    ctrl.getfilteredReports = function () {
      if (ctrl.includeCustomReports && ctrl.includeFavoriteReports) {
        _.each($scope.categories, function (cat) {
          _.each($scope.originalReports, function (report) {
            if (
              report.Category + 1 === cat &&
              report.IsCustomReport &&
              report.IsFavoriteReport
            ) {
              $scope.filteredReports.push(report);
            }
          });
        });
      } else if (ctrl.includeCustomReports && !ctrl.includeFavoriteReports) {
        _.each($scope.categories, function (cat) {
          _.each($scope.originalReports, function (report) {
            if (report.Category + 1 === cat && report.IsCustomReport) {
              $scope.filteredReports.push(report);
            }
          });
        });
      } else if (!ctrl.includeCustomReports && ctrl.includeFavoriteReports) {
        _.each($scope.categories, function (cat) {
          _.each($scope.originalReports, function (report) {
            if (report.Category + 1 === cat && report.IsFavoriteReport) {
              $scope.filteredReports.push(report);
            }
          });
        });
      } else {
        _.each($scope.categories, function (cat) {
          _.each($scope.originalReports, function (report) {
            if (report.Category + 1 === cat) {
              $scope.filteredReports.push(report);
            }
          });
        });
      }
    };

    $scope.filterReports = function (item) {
      $scope.userSearch = '';
      var selectedValue = item.ReportCategoryValue;
      $scope.reports.length = 0;
      $scope.filteredReports.length = 0;
      if (selectedValue === 11) {
        if (item.Selected) {
          $scope.filtersAppiled++;
          ctrl.includeFavoriteReports = true;
          _.each($scope.categories, function (cat) {
            _.each($scope.originalReports, function (report) {
              if (report.Category + 1 === cat) {
                if (ctrl.includeCustomReports) {
                  if (report.IsFavoriteReport && report.IsCustomReport) {
                    $scope.filteredReports.push(report);
                  }
                } else {
                  if (report.IsFavoriteReport) {
                    $scope.filteredReports.push(report);
                  }
                }
              }
            });
          });
        } else {
          $scope.filtersAppiled--;
          ctrl.includeFavoriteReports = false;
          _.each($scope.categories, function (cat) {
            _.each($scope.originalReports, function (report) {
              if (report.Category + 1 === cat) {
                if (ctrl.includeCustomReports) {
                  if (report.IsCustomReport) {
                    $scope.filteredReports.push(report);
                  }
                } else {
                  $scope.filteredReports.push(report);
                }
              }
            });
          });
        }
      }
      if (selectedValue === 10) {
        if (item.Selected) {
          $scope.filtersAppiled++;
          ctrl.includeCustomReports = true;
          _.each($scope.categories, function (cat) {
            _.each($scope.originalReports, function (report) {
              if (report.Category + 1 === cat) {
                if (ctrl.includeFavoriteReports) {
                  if (report.IsFavoriteReport && report.IsCustomReport) {
                    $scope.filteredReports.push(report);
                  }
                } else {
                  if (report.IsCustomReport) {
                    $scope.filteredReports.push(report);
                  }
                }
              }
            });
          });
        } else {
          $scope.filtersAppiled--;
          ctrl.includeCustomReports = false;
          _.each($scope.categories, function (cat) {
            _.each($scope.originalReports, function (report) {
              if (report.Category + 1 === cat) {
                if (ctrl.includeFavoriteReports) {
                  if (report.IsFavoriteReport) {
                    $scope.filteredReports.push(report);
                  }
                } else {
                  $scope.filteredReports.push(report);
                }
              }
            });
          });
        }
      }
      $scope.reports = _.sortBy($scope.filteredReports, ['CategoryName']);
    };

    $scope.toggleFavorite = function (report) {
      report.IsFavoriteReport = !report.IsFavoriteReport;
      $scope.originalReports.forEach(function (ele) {
        if (
          ele.Id === report.Id &&
          ele.IsCustomReport === report.IsCustomReport
        ) {
          ele.IsFavoriteReport = report.IsFavoriteReport;
        }
      });
      $scope.userSearch = '';
      $scope.filteredReports.length = 0;
      $scope.reports.length = 0;
      var userFavoriteReportDto = {};
      userFavoriteReportDto.ReportId = report.Id;
      userFavoriteReportDto.IsCustomReport = report.IsCustomReport;
      userFavoriteReportDto.IsChecked = report.IsFavoriteReport;
      reportsService.AddUserFavoriteReport(userFavoriteReportDto);
      ctrl.getfilteredReports();
      $scope.reports = _.sortBy($scope.filteredReports, ['CategoryName']);
    };

    ctrl.success = function (detail) {
      return function () {
        toastrFactory.success(
          localize.getLocalizedString('Successfully {0}', [detail]),
          'Success'
        );
      };
    };

    ctrl.failure = function (detail) {
      return function () {
        toastrFactory.error(
          localize.getLocalizedString('Failed to {0}', [detail]),
          'Error'
        );
      };
    };

    $scope.resetFilters = function () {
      ctrl.includeCustomReports = false;
      ctrl.includeFavoriteReports = false;
      $scope.reports = [];
      $scope.filteredReports = [];
      $scope.filtersAppiled = 0;
      $scope.customReportFilter.Selected = false;
      $scope.favoriteReportFilter.Selected = false;
      _.each($scope.categories, function (cat) {
        _.each($scope.originalReports, function (report) {
          if (report.Category + 1 === cat) {
            $scope.filteredReports.push(report);
          }
        });
      });
      $scope.reports = _.sortBy($scope.filteredReports, ['CategoryName']);
    };

    $scope.onSearch = function (searchText) {
      if (searchText === '') {
        $scope.resetFilters();
        $scope.displayMoreInfo = true;
      }
      $scope.filtersAppiled = 0;
      $scope.customReportFilter.Selected = false;
      $scope.favoriteReportFilter.Selected = false;
      ctrl.includeCustomReports = false;
      ctrl.includeFavoriteReports = false;
      _.each($scope.reportTypes, function (type) {
        type.Selected = true;
      });
      ctrl.filtered = [];
      _.each($scope.originalReports, function (report) {
        regex = null;
        var str = report.Name;
        var rex = new RegExp(
            searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            'gi'
          ),
          regex = str.match(rex);
        if (!_.isNull(regex)) {
          ctrl.filtered.push(report);
        }
      });
      $scope.reports = _.sortBy(ctrl.filtered, ['CategoryName']);
      $scope.searchReasults = _.isEmpty($scope.reports)
        ? 'No Search Results'
        : 'Search Results';
      $scope.categories = [1, 2, 3, 4, 5, 6, 7, 8, 9,12];
    };

    $scope.showMore = function () {
      $scope.displayMoreInfo = !$scope.displayMoreInfo;
    };

    $scope.setDefaultCategory = function () {
      $scope.defaultCategory = $location.search().type;
      if (
        $scope.defaultCategory != null ||
        $scope.defaultCategory != undefined
      ) {
        $scope.resetFilters();
        $scope.categories = [1, 2, 3, 4, 5, 6, 7, 8, 9,12];
        $scope.reportTypes[0].Selected = false;
        $scope.toggleSelect($scope.reportTypes[0]);
        if ($scope.defaultCategory == 'favorite') {
          $scope.reportTypes[0].Selected = true;
          $scope.toggleSelect($scope.reportTypes[0]);
          $scope.favoriteReportFilter.Selected = true;
          $scope.filterReports($scope.favoriteReportFilter);
        } else {
          _.each($scope.reportTypes, function (cat) {
            if (
              cat.ReportCategory.toUpperCase() ==
              $scope.defaultCategory.toUpperCase()
            ) {
              cat.Selected = true;
              $scope.toggleSelect(cat);
            }
          });
        }
      }
    };

    $scope.$on('patCore:initlocation', function () {
      if (
        !patSecurityService.IsAuthorizedByAbbreviation(
          'soar-report-report-view'
        )
      ) {
        toastrFactory.error(
          localize.getLocalizedString(
            'You do not have permission to view reports landing.'
          ),
          localize.getLocalizedString('Not Authorized')
        );
        window.location.replace('#');
      }
    });
  }

  // to highlite the search text
  app.filter('highlight', [
    '$sce',
    function ($sce) {
      return function (text, phrase) {
        if (phrase)
          text = text.replace(
            new RegExp(
              '(' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')',
              'gi'
            ),
            '<a class="highlighted">$1</a>'
          );
        return $sce.trustAsHtml(text);
      };
    },
  ]);
  ReportsLandingController.prototype = Object.create(BaseCtrl);
})();
