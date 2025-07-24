angular.module('Soar.Common').controller('NavigationCtrl', [
  '$scope',
  '$q',
  '$timeout',
  '$location',
  '$rootScope',
  'NavigationData',
  'toastrFactory',
  'DomainHeaderService',
  'patSecurityService',
  'locationService',
  '$window',
  'FeatureService',
  'userSettingsDataService',
  'referenceDataService',
  'LocationServices',
  'localize',
  'tabLauncher',
  function (
    $scope,
    $q,
    $timeout,
    $location,
    $rootScope,
    navigationData,
    toastrFactory,
    domainHeaderService,
    patSecurityService,
    locationService,
    $window,
    featureService,
    userSettingsDataService,
    referenceDataService,
    locationServices,
    localize,
    tabLauncher
  ) {
    $scope.showNewPatientHeader =
      userSettingsDataService.isNewNavigationEnabled();
    $scope.isSRHEnabled = false;
    $scope.navItems = [
      { Name: 'dashboard', Path: '/Dashboard/' },
      { Name: 'schedule', Path: '/Schedule/' },
      { Name: 'patient', Path: '/Patient/' },
      { Name: 'business', Path: '/BusinessCenter/' },
      { Name: 'help', Path: '/Help/' },
    ];

    $scope.initNavSelect = function () {
      angular.forEach($scope.navItems, function (item) {
        if ($location.$$path.indexOf(item.Path) > -1 && item.Path.length > 1) {
          $scope.selected = item.Name;
        }
      });
    };
    $scope.getLocationSRHEnrollmentStatus = function () {
      var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
      if (cachedLocation) {
        locationServices.getLocationSRHEnrollmentStatus(
          { locationId: cachedLocation.id },
          $scope.getLocationSRHEnrollmentStatusSuccess,
          $scope.getLocationSRHEnrollmentStatusFailure
        );
      }
    };

    $scope.getLocationSRHEnrollmentStatusSuccess = function (res) {
      $scope.isSRHEnabled = res.Result;
    };

    $scope.getLocationSRHEnrollmentStatusFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve SolutionReach Health enrollment Status'
        ),
        localize.getLocalizedString('Error')
      );
    };
    var userAgent = window.navigator.userAgent;
    $scope.browser = 'unknown';
    var browsers = {
      chrome: /chrome/i,
      safari: /safari/i,
      firefox: /firefox/i,
      ie: /internet explorer/i,
    };
    for (var key in browsers) {
      if (browsers[key].test(userAgent)) {
        $scope.browser = key;
      }
    }

    $scope.isInDeveloperMode = false;
    featureService.isEnabled('DevelopmentMode').then(function (res) {
      $scope.isInDeveloperMode = res;
    });

    $scope.navigate = function (url) {
      tabLauncher.launchNewTab('/v1.0/index.html' + url);
    };

    $scope.initNavSelect();
    $scope.getLocationSRHEnrollmentStatus();
    $scope.$watch('selected', function (nv, ov) {
      $scope.navClicked = true;

      // Needs to be done when user clicks an already selected nav option
      if (nv == null) {
        $scope.selected = ov;
      }
    });

    $scope.navData = navigationData;

    $scope.loginData = {
      userName: '',
      password: '',
    };
    $scope.login = function () {
      patSecurityService.login($scope.loginData);
    };

    $scope.logout = function () {
      patSecurityService.logout();
      $location.path('/');
    };
    $scope.userLocation = 0;
    $scope.locations = [];
    $scope.userPractice = {};

    // this is an async call so wait for promise..
    $scope.getLocations = function () {
      return locationService.getAllLocations();
    };

    // This code runs at startup ... it should be removed in favor of
    // having an $scope.on only happen when the user has changed. (I assume that is what this does)
    // This is a hack it appears to get around a problem that has sense been fixed I would assume.
    // or further changes need to happen in the webshell but a watch that then calls get locations is not right.
    // also this seems off since if the user does change
    // we would first have to get there practices before attempting to get a location.
    $scope.$on(
      function () {
        return $rootScope.patAuthContext.userInfo.userid;
      },
      function () {
        console.log('Watch Called');
        $scope.getLocations().then(function (locs) {
          $scope.locations = locs;
          if ($scope.locations && $scope.locations.length > 0) {
            $scope.userLocation = $scope.locations[0].Id;
          }
        });
      }
    );
    $scope.$emit('toggleHeader');

    $scope.expanded = false;

    $scope.toggleNav = function (expanded) {
      console.log(expanded);
      if (expanded) {
        $scope.expanded = false;
      } else {
        $scope.expanded = true;
      }
    };

    $scope.clearStoredFilters = function () {
      $window.sessionStorage.removeItem('patientFilters');
    };

    $scope.$on('show-globalAppHeader', function (events, args) {
      $scope.toShow = true;
      if (args === 3) {
        $scope.toShow = false;
      }
    });

    // this is an async call so wait for promise..
    //$scope.getPractices = function() {
    //    var deferred = $q.defer();
    //    //setTimeout(
    //    $timeout(function() {
    //        deferred.resolve(patSecurityService.GetPractices());
    //    }, 2000);
    //    return deferred.promise;
    //};

    //$scope.getPractices().then(function(p) {
    //    $scope.practice = p;
    //    if ($scope.practice) {
    //        $scope.userPractice = $scope.practice[0];
    //    }
    //    console.log($scope.userPractice);
    //});

    // TODO Get Practice from patSecurityService...
    //$scope.practices = [];
    //    $scope.getPractice = function () {
    //        $scope.practices = patSecurityService.GetPractices();
    //        console.log($scope.practices);
    //    }
    //    $scope.getPractice();
  },
]);
