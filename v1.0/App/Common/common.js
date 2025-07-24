/* global Dynamsoft */

'use strict';

var commonApp = angular
  .module('Soar.Common', [
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ui.bootstrap',
    'common.services',
    'common.directives',
    'common.controllers',
    'common.factories',
    'common.animations',
    'PatWebCoreV1',
    'angular.directives',
    'kendo.directives',
    'ngSanitize',
  ])
  .run([
    'referenceDataService',
    'NavigationData',
    'practiceService',
    'patSecurityService',
    'DomainHeaderService',
    '$rootScope',
    '$uibModalStack',
    '$location',
    'locationService',
    '$uibModal',
    '$q',
    '$timeout',
    'GlobalSearchFactory',
    'toastrFactory',
    'AmfaInfo',
    'ListHelper',
    'UserServices',
    'localize',
    'UserFetchStatus',
    'ModalFactory',
    '$window',
    'userSettingsDataService',
    'FlyoutData',
    'configSettingsService',
    function (
      referenceDataService,
      navData,
      practiceService,
      patSecurityService,
      domainHeaderService,
      $rootScope,
      $uibModalStack,
      $location,
      locationService,
      $uibModal,
      $q,
      $timeout,
      globalSearchFactory,
      toastrFactory,
      amfaInfo,
      listHelper,
      userServices,
      localize,
      userFetchStatus,
      modalFactory,
      $window,
      userSettingsDataService,
      flyoutData,
      configSettingsService
    ) {
      if (
        !$rootScope.patAuthContext ||
        !$rootScope.patAuthContext.isAuthorized
      ) {
        patSecurityService.logout();
        $location.path('/');
      }

      // Capture the user email for tracking in Dynatrace
      if (
        !_.isUndefined($rootScope.patAuthContext) &&
        !_.isUndefined($rootScope.patAuthContext.userInfo)
      ) {
        $window.userEmail = $rootScope.patAuthContext.userInfo.username;
      }

      function parseValue(paramValues, routeParams) {
        if (paramValues.amfa) {
          return paramValues.amfa;
        }

        if (paramValues.routeParamName && paramValues.values) {
          var routeParam = routeParams[paramValues.routeParamName];
          if (!routeParam && paramValues.values['default']) {
            return parseValue(paramValues.values['default']);
          } else {
            return parseValue(
              paramValues.values[routeParams[paramValues.routeParamName]],
              routeParams
            );
          }
        }

        return '';
      }

      var hasRouteChange = false;
      var loadingModal, showModal;
      var loadingModalTimer = null;

      var deferred = $q.defer();
      $rootScope.$on('fuse:headerLoaded', function () {
        deferred.resolve();
      });
      var initLocationPromise = deferred.promise;

      $rootScope.$on('$routeChangeStart', function (event, next) {

        let isPayPageCallback;
        let isPaypageModalOpen;
        try {
          // Check if route is from a paypage callback
          isPayPageCallback = next['$$route'].originalPath.includes('paypage-redirect-callback');

          // Check if the paypage modal is open
          isPaypageModalOpen = JSON.parse(sessionStorage.getItem('isPaypageModalOpen'));
        } catch {
          // Default to false if something blows up and allow user to navigate uninterrupted
          isPayPageCallback = false;
          isPaypageModalOpen = false;
        }

        // If the paypage modal is open and the route change was not initiated by the GPI callback
        // then we should prompt the user to confirm that they wish to abort the paypage
        if (isPaypageModalOpen && !isPayPageCallback && !confirm('Are you sure you want to exit this page? All incomplete transactions will be lost.') ) {
          event.preventDefault();
          return;
        } else {
          sessionStorage.removeItem('isPaypageModalOpen');
        }

        hasRouteChange = true;
        if (
          !$rootScope.patAuthContext ||
          !$rootScope.patAuthContext.isAuthorized
        ) {
          $location.path('/');
          return;
        }

        var amfa = null;
        if (next.data && !next.data.isPublic) {
          if (next.data.amf) {
            amfa = next.data.amf;
          } else if (next.data.amfaOverride) {
            amfa = parseValue(next.data.amfaOverride, next.params);
          }

          next.resolve = next.resolve || {};
          next.resolve.initLocationResolver = function () {
            return initLocationPromise;
          };
        }

        if (amfa && !patSecurityService.IsAuthorizedByAbbreviation(amfa)) {
          toastrFactory.error(
            patSecurityService.generateMessage(amfa),
            'Not Authorized'
          );
          var defaultId = sessionStorage
            .getItem('continueProcessingCall')
            .toString();
          // if no session value set then only check the condition
          // redirecting to selected landing page based on response data
          // for schedule page as default landing page
          if (defaultId !== 'undefined') {
            if (defaultId === '2' && !$location.$$path.match('/Schedule')) {
              window.open('#/Schedule/', '_self');
            }
            // for Dashboard 2 as default landing page
            else if (defaultId === '1') {
              window.open('#/Dashboard2/', '_self');
              // for dashboard 1
            } else if (defaultId === '0') {
              $location.path('/');
            }
          } else {
            $location.path('/');
          }
          return;
        }

        showModal = true;
        $timeout.cancel(loadingModalTimer);
        loadingModalTimer = $timeout(function () {
          if (showModal && $rootScope.suppressLoadingModal === false) {
            loadingModal = $uibModal.open({
              template:
                '<div>' +
                '  <i id="resolveLoadingSpinner" class="fa fa-spinner fa-4x fa-spin"></i><br/>' +
                '  <label style="padding-top: 5px">{{ \'Loading\' | i18n }}...</label>' +
                '</div>',
              size: 'sm',
              windowClass: 'modal-loading',
              backdrop: 'static',
              keyboard: false,
            });
          }
        }, 1000);

        if (!_.isNil(next.params.setLocation)) {
          localStorage.setItem('locationOverride', next.params.setLocation);
        }
      });

      $rootScope.$on('$routeChangeSuccess', function () {
        showModal = false;
        hasRouteChange = false;
        if (loadingModal) {
          loadingModal.dismiss();
          loadingModal = null;
        }
      });

      $rootScope.$on('$routeChangeError', function () {
        showModal = false;
        hasRouteChange = false;
        if (loadingModal) {
          loadingModal.dismiss();
          loadingModal = null;
        }
        $uibModal.open({
          template:
            '<div>' +
            '  <i class="fa fa-exclamation fa-4x"></i><br/>' +
            "  <label>{{ 'Data load failed. Please refresh the page to try again' | i18n }}...</label>" +
            '</div>',
          size: 'sm',
          windowClass: 'modal-loading',
          backdrop: 'static',
          keyboard: false,
        });
      });

      $rootScope.$on('$locationChangeStart', function (event) {
        if ($rootScope.patAuthContext.accessLevel != 'Inactive') {
          var topModal = $uibModalStack.getTop();
          if (topModal && hasRouteChange) {
            var confirmMessage =
              'If you leave the page any unsave changes will be lost. Do you want to continue?';
            var isDirty = topModal.value.modalScope.hasChanges;
            var hasDirtyProp =
              typeof topModal.value.modalScope.hasChanges !== 'undefined';
            if (
              (isDirty && hasDirtyProp && confirm(confirmMessage)) ||
              (hasDirtyProp && !isDirty) ||
              (!hasDirtyProp && confirm(confirmMessage))
            ) {
              $uibModalStack.close(topModal.key);
            } else {
              event.preventDefault();
              showModal = false;
              hasRouteChange = false;
            }
          }
        }
      });

      function selectLocation(
        currentLocation,
        usersLocations,
        locationOverride
      ) {
        var configuredLocation = null;
        // First check if the user has an existing saved location from the last time they used the application.
        if (
          !_.isNil(locationOverride) ||
          (usersLocations && usersLocations.length > 0)
        ) {
          // the core-shell deleteUserContext method that is called during logout
          // clears the userLocation from localStorage, attempting to retrieve it from usersLocations based on userId
          var userId = $rootScope.patAuthContext.userInfo.userid;

          var foundALocationForThisUser = false;
          // we have to make sure the userLocations (from local storage) matches the available locations for this user before selecting a location from list
          // reference 275331 App Header Location: Issue when last logged in location is no longer available
          var usersAvailableLocations = [];

          var locations = locationService.getActiveLocations();
          usersAvailableLocations = locations;

          if (_.isNil(locationOverride)) {
            angular.forEach(usersLocations, function (storedLocation) {
              if (
                !foundALocationForThisUser &&
                storedLocation.users &&
                storedLocation.users.indexOf(userId) !== -1
              ) {
                // is this an currently available location?
                var index = listHelper.findIndexByFieldValue(
                  usersAvailableLocations,
                  'id',
                  storedLocation.id
                );
                // if so, select it
                if (index > -1) {
                  delete storedLocation.users;
                  // Is it ok to set the location from the server as the one in sessionStorage?
                  //configuredLocation = usersAvailableLocations[index];
                  // Or should i just ensure the deactivation value is correct since it might have changed since your last login.

                  storedLocation.name = usersAvailableLocations[index].name;
                  storedLocation.deactivationTimeUtc =
                    usersAvailableLocations[index].deactivationTimeUtc;
                  /// todo finish
                  configuredLocation = storedLocation;
                }
              }
            });
          } else {
            // find location in list
            var overrideTarget = _.find(usersAvailableLocations, {
              id: locationOverride,
            });

            // set configuredLocation to found location
            if (!_.isNil(overrideTarget)) {
              configuredLocation = overrideTarget;
            } else {
              modalFactory.LocationMismatchOnOverrideModal();
              $location.search({});
              $location.path('/');
            }
          }
        } else {
          // currentLocation is set right away by selecting the first item in the users available locations list.
          configuredLocation = currentLocation;
        }

        if (configuredLocation === null) {
          configuredLocation = currentLocation;
        }

        locationService.setLocation(configuredLocation);

        // broadcast to the locations directive that locations are loaded.
        $rootScope.$broadcast('patCore:load-location-display', {
          location: configuredLocation,
        });
        getCurrentUser();
      }

      function continueProcessingLocations(res) {
        //console.log("Locations Loaded");
        // ok so locations have loaded from webshell ... now we need to see if the selected location
        // is the same as the one the user has saved in local storage.

        var currentLocation = locationService.getCurrentLocation();
        // previously stored user location selections
        var usersLocations = JSON.parse(localStorage.getItem('usersLocations'));
        var locationOverride = JSON.parse(
          localStorage.getItem('locationOverride')
        );
        localStorage.removeItem('locationOverride');
        selectLocation(currentLocation, usersLocations, locationOverride);
        // header flyout options
        $rootScope.$broadcast('FlyoutOptions', flyoutData.flyoutMenuItems);
        // checking the if the method is called or not using 'continueProcessingCall' session storage item
        var isMethodCalled = sessionStorage.getItem('continueProcessingCall');
        // if no session value set then only check the condition
        if (!isMethodCalled && $location.$$path !== '/Help/') {
          // method called then set the 'continueProcessingCall' item
          sessionStorage.setItem('continueProcessingCall', res);
          // redirecting to selected landing page based on response data
          // for schedule page as default landing page
          if (res === 2) {
            window.open('#/Schedule/', '_self');
          }
          // for Dashboard 2 as default landing page
          else if (res === 1) {
            window.open('#/Dashboard2/', '_self');
          }
        }
        // need location to load before calling this as it uses Location level permissions.
        initRecentList();
      }

      // this event will fire when the locations have finished loading from the server.
      $rootScope.$on('patCore:practiceAndLocationsLoaded', function () {
        // we will probably end up changing this call again and maybe including this data with retrieval of the user record.
        // as a start we are going to keep it separate as the main driver for moving the call is not refactoring and restructuring the site but
        // getting it so we can change links in the application and where users navigate to based on a flag in the user settings table.
        configSettingsService.loadSettings().then(function() {
              userSettingsDataService.getUserSettingsAtInitialization().then(
                  function (res) {
                      var responce = res.data ? res.data : res;
                      continueProcessingLocations(responce.DefaultLandingPage);
                      $rootScope.$broadcast('DefaultLandingPageValue', responce);
                  },
                  function () {
                      //toastrFactory.error(localize.getLocalizedString('Failed to retrieve user settings'));
                      // still proceed with the user using the application for now we need the locations to be loaded regardless.
                      continueProcessingLocations();
                  }
              );
          });
      });
      function getCurrentUser() {
        userServices.Users.get(
          { Id: $rootScope.patAuthContext.userInfo.userid, $bypassDelay: true },
          getUserSuccess,
          getUserFailed
        );
      }

      function getUserSuccess(result) {
        var user = result.Value;

        localStorage.setItem('fuseUser', angular.toJson(user));
        userFetchStatus.complete = true;
        
        // Kicks off reference data retrieval and management
        configSettingsService.loadSettings().then(_ => 
          referenceDataService.kickOff().then(_ => 
            $rootScope.$broadcast('fuse:initheader')
          )
        );
      }

      function getUserFailed() {
        const userContext = JSON.parse(sessionStorage.getItem('userContext'));
        var practiceAccess = userContext.Result.Access;

        if (
          practiceAccess &&
          practiceAccess[0].PracticeStatus.toLowerCase() != 'credithold'
        ) {
          localStorage.removeItem('fuseUser');
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the current user. Refresh the page to try again.'
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      }

      $rootScope.$on('user-updated', function (event, args) {
        if (args.Value.UserId === $rootScope.patAuthContext.userInfo.userid) {
          getUserSuccess(args);
        }
      });

      // load the most recent patient list on logon
      function initRecentList() {
        globalSearchFactory.LoadRecentPersons();
      }

      practiceService.getPractices().then(function () {
        if ($rootScope.patAuthContext.accessLevel != 'Inactive') {
          // load header data.
          var currentPractice = practiceService.getCurrentPractice();
          if (currentPractice && $rootScope.patAuthContext) {
            var practiceId = practiceService.getCurrentPractice().id;
            var userId = $rootScope.patAuthContext.userInfo.userid;

            // set the domain headers
            domainHeaderService.headerData.userId = userId;
            domainHeaderService.headerData.practiceId = practiceId;
          }

          //var practice = practices[0];
          //if (practices.length > 1) {
          //    angular.forEach(practices, function (value) {
          //        if (value.id == 100) {
          //            practice = value;
          //        }
          //    });
          //}
        }
      });

      // polyfill for String.prototype.includes (not implemented in IE)
      if (!String.prototype.includes) {
        String.prototype.includes = function () {
          return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
      }

      // polyfill for String.prototype.endsWith (not implemented in IE 11)
      if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (searchString, position) {
          var subjectString = this.toString();
          if (
            typeof position !== 'number' ||
            !isFinite(position) ||
            Math.floor(position) !== position ||
            position > subjectString.length
          ) {
            position = subjectString.length;
          }
          position -= searchString.length;
          var lastIndex = subjectString.lastIndexOf(searchString, position);
          return lastIndex !== -1 && lastIndex === position;
        };
      }

      // polyfill for string.startsWith (not implemented in IE 11)
      if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
          position = position || 0;
          return this.indexOf(searchString, position) === position;
        };
      }

      // prepent polyfill
      // eslint-disable-next-line no-global-assign
      HTMLElement = typeof HTMLElement != 'undefined' ? HTMLElement : Element;
      if (!HTMLElement.prototype.prepend) {
        HTMLElement.prototype.prepend = function (element) {
          if (element) {
            if (this.firstChild) {
              return this.insertBefore(element, this.firstChild);
            } else {
              return this.appendChild(element);
            }
          }
        };
      }

      // Element.prototype.remove polifill
      if (!Element.prototype.remove) {
        Element.prototype.remove = function () {
          this.parentElement.removeChild(this);
        };
      }

      // NodeList.prototype.remove polifill
      if (!NodeList.prototype.remove) {
        NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
          for (var i = this.length - 1; i >= 0; i--) {
            if (this[i] && this[i].parentElement) {
              this[i].parentElement.removeChild(this[i]);
            }
          }
        };
      }
    },
  ])
  .run([
    '$rootScope',
    '$window',
    function ($rootScope, $window) {
      // the purpose of this block is to ensure that certain storage items that were moved from local to session storage are
      // deterministically cleared from local storage, and to handle removal of those itmes from session storage on logout
      /*global dtrum:true*/

      var cacheKeys = [
        'MostRecentPersons',
        'cachedUsers',
        'continueProcessingCall',
      ];

      cacheKeys.forEach(function (key) {
        localStorage.removeItem(key);
      });

      $rootScope.$on('fuse:logout', function () {
        cacheKeys.forEach(function (key) {
          sessionStorage.removeItem(key);
        });

        try {
          // Dynatrace end session
          if (!_.isUndefined($window.dtrum)) {
            $window.dtrum.endSession();
          }

          // Clean up session variable
          $window.userEmail = '';
        } catch (error) {
          throw new Error(error);
        }
      });
    },
  ])
  .config([
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push('ApiCallDelayService');
      $httpProvider.interceptors.push('DomainLocatorService');
      $httpProvider.interceptors.push('ClinicalLocatorService');
      $httpProvider.interceptors.push('SAPIScheduleLocatorService');
      $httpProvider.interceptors.push('InsuranceSapiLocatorService');
      $httpProvider.interceptors.push('SchedulingLocatorService');
      $httpProvider.interceptors.push('EnterpriseLocatorService');
      $httpProvider.interceptors.push('ApiCallHandlerService');
      $httpProvider.interceptors.push('InsuranceApiLocatorService');
      $httpProvider.interceptors.push('ReportingApiLocatorService');
      ///////////////////////////////////////////////////////////////////////////////////
      // do not remove, apis will not work if you remove this code!!!!!
      // need to remove platform interceptor from list then add it back in at the end so that
      // there are no problems with the interceptors overwriting one another.

      var importantInterceptor = 'httpBearerTokenInterceptor';
      var index = $httpProvider.interceptors.indexOf(importantInterceptor);
      if ($httpProvider.interceptors.indexOf(importantInterceptor) > -1) {
        $httpProvider.interceptors.splice(index, 1);
        $httpProvider.interceptors.push(importantInterceptor);
      }
    },
  ])
  // the following service will need to be moved to either enterprise solution or to common-services.js in the soar solution
  // left here for ease of locating
  .config([
    '$provide',
    function ($provide) {
      $provide.decorator('patSecurityService', [
        '$delegate',
        '$rootScope',
        'AmfaInfo',
        'toastrFactory',
        'localize',
        'locationService',
        function (
          $delegate,
          $rootScope,
          amfaInfo,
          toastrFactory,
          localize,
          locationService
        ) {
          $delegate.IsAuthorizedByAbbreviation = function (abbrev) {
            if (checkAmfa(abbrev)) {
              var retVal = $delegate.isAmfaAuthorizedByName(abbrev);
              if (!retVal) {
                var ofcLocation = locationService.getCurrentLocation();
                if (!ofcLocation) {
                  return false;
                }

                retVal = $delegate.isAmfaAuthorizedByNameAtLocation(
                  abbrev,
                  ofcLocation.id
                );
              }
              return retVal;
            }

            return false;
          };

          $delegate.IsAuthorizedByAbbreviationAtLocation = function (
            abbrev,
            locationId
          ) {
            if (checkAmfa(abbrev)) {
              return $delegate.isAmfaAuthorizedByNameAtLocation(
                abbrev,
                locationId
              );
            }
            return false;
          };

          $delegate.IsAuthorizedByAbbreviationAtPractice = function (abbrev) {
            return $delegate.IsAuthorizedByAbbreviationAtLocation(abbrev, -1);
          };

          $delegate.generateMessage = function (abbrev) {
            if (checkAmfa(abbrev)) {
              var ofcLocation = locationService.getCurrentLocation();
              if (!ofcLocation) {
                // no selected location
                return localize.getLocalizedString(
                  'No location has been selected yet.'
                );
              }
              return localize.getLocalizedString(
                'You do not have permission to {0} {1}.',
                [
                  amfaInfo[abbrev].ActionName.toLowerCase(),
                  amfaInfo[abbrev].ItemType.toLowerCase(),
                ]
              );
            }
          };

          $delegate.getAccessLevel = function () {
            return $rootScope.patAuthContext.accessLevel;
          };

          function checkAmfa(abbrev) {
            if (!amfaInfo[abbrev]) {
              toastrFactory.error(
                'No such amfa value exists: ' + abbrev,
                'Invalid Data'
              );

              /* eslint-disable no-console */
              console.error('Invalid AMFA used: ' + abbrev);
              console.log(new Error().stack);
              /* eslint-enable no-console */

              return false;
            }
            return true;
          }

          return $delegate;
        },
      ]);
    },
  ])
  .config([
    '$provide',
    function ($provide) {
      $provide.decorator('$http', [
        '$delegate',
        '$location',
        '$q',
        function multiRequestQueuer($delegate, $location, $q) {
          var createHashCode = function (string) {
            var hash = 0;
            if (string) {
              for (var i = 0; i < string.length; i++) {
                var character = string.charCodeAt(i);
                hash = (hash << 5) - hash + character;
                hash = hash & hash; // Convert to 32bit integer
              }
            }

            return hash.toString();
          };

          var queuedRequestPromises = [];

          var overridenHttp = function (requestConfig) {
            //Ignore calls for html, javascript or any call from the path '/' as they cause issues since the app hasn't bootstrapped yet.
            if (
              requestConfig.method.toLowerCase() !== 'get' ||
              requestConfig.url.indexOf('.html') >= 0 ||
              requestConfig.url.indexOf('.js') >= 0 ||
              $location.$$url === '/'
            ) {
              return $delegate(requestConfig);
            }

            var parametersString = '';

            if (requestConfig.params) {
              var orderdParams = Object.keys(requestConfig.params).sort(
                function (a, b) {
                  return requestConfig.params[a] - requestConfig.params[b];
                }
              );
              for (var i = 0; i < orderdParams.length; i++) {
                if (requestConfig.params.hasOwnProperty(orderdParams[i])) {
                  parametersString +=
                    orderdParams[i] + requestConfig.params[orderdParams[i]];
                }
              }
            }

            var requestHash = createHashCode(
              requestConfig.method.toLowerCase() +
                requestConfig.url.toLowerCase() +
                parametersString
            );

            var requestQueue = queuedRequestPromises[requestHash];

            if (!requestQueue) {
              var requestPromise = $delegate(requestConfig);
              if (requestPromise) {
                requestQueue = {
                  promise: requestPromise,
                  additionalPromises: [],
                };
                queuedRequestPromises[requestHash] = requestQueue;
                requestPromise
                  .then(function requestCompleted(result) {
                    var additionalPromises =
                      queuedRequestPromises[requestHash].additionalPromises;
                    for (var r = 0; r < additionalPromises.length; r++) {
                      additionalPromises[r].resolve(_.cloneDeep(result));
                    }
                  })
                  .finally(function requestCompletedFinally() {
                    queuedRequestPromises[requestHash] = null;
                    delete queuedRequestPromises[requestHash];
                  });

                return requestPromise;
              }
            } else {
              var defer = $q.defer();
              requestQueue.additionalPromises.push(defer);

              return defer.promise;
            }

            return null;
          };

          //Taken from the angular library in its standard $http implementation
          function createShortMethods() {
            angular.forEach(arguments, function (name) {
              overridenHttp[name] = function (url, config) {
                return overridenHttp(
                  angular.extend({}, config || {}, {
                    method: name,
                    url: url,
                  })
                );
              };
            });
          }

          function createShortMethodsWithData() {
            angular.forEach(arguments, function (name) {
              overridenHttp[name] = function (url, data, config) {
                return overridenHttp(
                  angular.extend({}, config || {}, {
                    method: name,
                    url: url,
                    data: data,
                  })
                );
              };
            });
          }
          createShortMethods('get', 'delete', 'head', 'jsonp');
          createShortMethodsWithData('post', 'put', 'patch');
          //end angular library code

          overridenHttp.defaults = $delegate.defaults;
          overridenHttp.pendingRequests = $delegate.pendingRequests;

          return overridenHttp;
        },
      ]);
    },
  ])
  .config([
    '$provide',
    function ($provide) {
      $provide.decorator('$exceptionHandler', [
        '$delegate',
        '$log',
        function exceptionHandlerDecorator($delegate, $log) {
          return function (exception, cause) {
            if (
              exception
                .toString()
                .toLowerCase()
                .includes('possibly unhandled rejection')
            ) {
              $log.debug(exception);
              return;
            }
            $delegate(exception, cause);
          };
        },
      ]);
    },
  ])
  .config([
    '$locationProvider',
    function ($locationProvider) {
      $locationProvider.hashPrefix('');
    },
  ])
  // the following service will need to be moved to either enterprise solution or to common-services.js in the soar solution
  // left here for ease of locating
  .service('AuthZService', [
    'patSecurityService',
    'localize',
    function (patSecurityService, localize) {
      var localizedString = localize.getLocalizedString(
        'You do not have permission to view this information'
      );
      var checkAuthZ = function (abbrev) {
        return patSecurityService.IsAuthorizedByAbbreviation(abbrev);
      };

      var generateMessage = function (abbrev) {
        return patSecurityService.generateMessage(abbrev);
      };
      var generateTitleMessage = function () {
        return localizedString;
      };

      this.checkAuthZ = checkAuthZ;
      this.generateMessage = generateMessage;
      this.generateTitleMessage = generateTitleMessage;
    },
  ])
  .run([
    'DOMAIN_API_URL',
    '$document',
    function (domainUrl, $document) {
      var document = $document[0];
      var script = document.createElement('script');
      //script.setAttribute('src', domainUrl + '/signalr/hubs');
      script.setAttribute('type', 'text/javascript');

      document.head.appendChild(script);
    },
  ])
  .value('UserFetchStatus', { complete: false });

// Javascript error handling
window.onerror = function (/*errorText, url, lineNumber*/) {
  //var msg = "errorText=" + errorText + "&url=" + url + "&lineNumber=" + lineNumber;
  //console.log(msg);
  //var xhr = new XMLHttpRequest();
  //xhr.open("POST", "/api/apierror", true);
  //xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //xhr.setRequestHeader("X-XSRF-Token", $("#navbar").attr('ptc-request-verification-token'));
  //xhr.send(msg);
};

//http://stackoverflow.com/questions/1915812/window-onerror-does-not-work
