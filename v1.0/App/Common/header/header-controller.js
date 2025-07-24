'use strict';

angular
    .module('Soar.Common')
    .controller('HeaderController', [
        '$rootScope',
        '$scope',
        '$location',
        'toastrFactory',
        'patSecurityService',
        '$timeout',
        'locationService',
        'LocationServices',

        'ListHelper',
        'tabLauncher',
        'GlobalSearchFactory',
        'PatCacheFactory',
        'UserRxFactory',
        'localize',
        'SoarConfig',
        'HeaderAlert',
        '$uibModal',
        'webshellOptionalFeatures',
        'ModalFactory',
        'referenceDataService',
        '$injector',
        'UserSettingsService',
        'CommonServices',
        '$q',
        '$interval',
        'TimeZoneFactory',
        'FuseFlag',
        'DecodeJWT',
        HeaderController,
    ]);

function HeaderController(
    $rootScope,
    $scope,
    $location,
    toastrFactory,
    patSecurityService,
    $timeout,
    locationService,
    locationServices,
    listHelper,
    tabLauncher,
    globalSearchFactory,
    cacheFactory,
    userRxFactory,
    localize,
    soarConfig,
    headerAlert,
    $uibModal,
    webshellOptionalFeatures,
    modalFactory,
    referenceDataService,
    $injector,
    userSettingsService,
    commonServices,
    $q,
    $interval,
    timeZoneFactory,
    fuseFlag,
    decodeJWT
) {
    BaseCtrl.call(this, $scope, 'HeaderController');
    var ctrl = this;
    $scope.DoseSpotAdminPortalUrl =
        'https://pd-pss.dosespot.com/Admin/Account/Login';
    $scope.DentalXChangePortalUrl = 'https://register.dentalxchange.com/reg/login?0';
    $scope.OpenEdgePortalUrl = 'https://openedgepayments.com/openedgeview/';
    $scope.RevenueWellPortalUrl =
        'https://rwlogin.com/PracticePortalAuthentication/SignIn';
    $scope.FuseAcademyUrl =
        `${soarConfig.duendeRootUrl}/idpsso/IdpInitiatedSso/?clientId=FuseAcademy`;
    $scope.mfaSettingsUrl = `${soarConfig.mfaSettingsUrl}%26nonce=defaultNonce%26scope=openid%26response_type=id_token%26prompt=login`;

    $scope.mfaSettingsUrlDecoded = decodeURIComponent($scope.mfaSettingsUrl);
    
    $scope.PRMUrl = function () {
        const currentLocation = locationService.getCurrentLocation();
        if (!currentLocation) {
            return '#'
        }
        const baseUrl = soarConfig.prmUrl;

        return `${baseUrl}?locationId=${currentLocation.id}&practiceId=${currentLocation.practiceid}`;
    };

    ctrl.getIsActiveMFASession = function () {
      const fuseLoginToken = JSON.parse(sessionStorage.getItem('fuseLogin'));
      if (!fuseLoginToken || !fuseLoginToken.access_token) {
        return false;
      }
      const decodedIdToken = decodeJWT.decode(fuseLoginToken.access_token);
      if (!decodedIdToken) {
        return false;
      }
      if (!decodedIdToken.mfaEnabled) {
        return false;
      }
      return decodedIdToken.mfaEnabled;
    };

    $scope.isActiveMFASession = ctrl.getIsActiveMFASession();

    ctrl.checkFeatureFlags = function () {
        $injector.get('FeatureFlagService').getOnce$(fuseFlag.AddNarlugaLinkInQuickLinksSection).subscribe((value) => {
            $scope.AddPRMLinkInQuickLinks = value;
        });
        $injector.get('FeatureFlagService').getOnce$(fuseFlag.ShowNotifications).subscribe((value) => {
            $scope.ShowNotifications = value;
        });
        $injector.get('FeatureFlagService').getOnce$(fuseFlag.EnableMFASettings).subscribe((value) => {
            $scope.enableMFASettings = value;
        });

    };

    ctrl.getNotificationStatus = function () {
        $injector.get('NotificationsService').response$.subscribe(function (response) {
            $scope.IsNotificationBellRed = response;
        });
    };

    ctrl.SetNotificationClosed = function () {

        $injector.get('NotificationsService').response$.subscribe(function (response) {
            $scope.isNotificationsOpen = response;
        });
    }

    ctrl.getRxNotificationsIndicator = function () {
        $injector.get('NotificationsService').rxNotification$.subscribe(function (response) {
            $scope.isRxNotificationsCountGreaterThanZero = response;
        });
    }



    var ctrl = this;
    $scope.arrowFlag = false;
    $scope.mouseover = function () {
        $scope.arrowFlag = true;
    };
    $scope.mouseleave = function () {
        $scope.arrowFlag = false;
    };

    $scope.ultCountdownInterval = null;
    $scope.ultEndTime = null;

    // fly out menu for default landing page
    $rootScope.$on('FlyoutOptions', function (event, options) {
        $scope.menu = options;
    });
    // initial user data fetching from common.js/userSettingsDataService.getUserSettingsAtInitialization()
    $rootScope.$on('DefaultLandingPageValue', function (event, data) {
        $scope.userSetting = data || {};
        $scope.DefaultLandingPage = data.DefaultLandingPage.toString();
    });

    //assign latest data from selectPage method
    function getUserData(response) {
        $scope.userSetting = response || {};
        $scope.DefaultLandingPage = response.DefaultLandingPage.toString();
    }

    // update selected landing page id
    $scope.selectPage = function (pageId) {
        $scope.userSetting.DefaultLandingPage = Number(pageId);
        userSettingsService.update($scope.userSetting).$promise.then(
            function (res) {
                getUserData(res.Value);
                toastrFactory.success(
                    localize.getLocalizedString('{0} saved successfully.', [
                        'Default landing page',
                    ]),
                    'Success'
                );
            },
            function (error) {
                toastrFactory.error(
                    localize.getLocalizedString('Failed to save {0}.', [
                        'Default landing page',
                    ]),
                    'Error'
                );
            }
        );
    };

    $scope.loading = true;
    $scope.practiceSettingsPromise = null;
    $scope.currentUser = '';
    $scope.currentUserData = null;
    $scope.rxUser = false;
    $scope.loadingModal = null;
    $scope.notifications = {
        counts: 0,
        newCounts: false,
        url: '',
    };
    ctrl.rxNotificationAttempts = 0;
    ctrl.rightnowJsUrl = '/euf/rightnow/RightNow.Client.js';
    ctrl.liveChatWidgetUrl = '/ci/ws/get';
    $scope.liveChatToolTipText = localize.getLocalizedString(
        'Live Chat-Unavailable'
    );
    $scope.outOfHours = true;
    $scope.liveChatJSLoaded = false;

    $scope.filteredLocations = [];
    $scope.filteredLocationsOriginal = [];
    $scope.liveChatInterval = 0;

    $scope.ResetPasswordUrlBase = soarConfig.resetPasswordUrl;
    $scope.LoadChatWidget = function (customFields) {
        const chatUrl = `${soarConfig.supportLiveChatUrl}${ctrl.liveChatWidgetUrl}`;
        const chatWidget = {
            chat_login_page: '/app/chat/pfi_chat_launch',
            chat_login_page_height: 630,
            chat_login_page_width: 480,
            container_element_id: 'PFILinkContainer',
            info_element_id: 'PFILinkInfo',
            link_element_id: 'PFIChatLink',
            enable_polling: false,
            p: soarConfig.supportLiveChatProductCode,
            min_sessions_avail: 0,
            enable_availability_check: true,
            instance_id: 'sccl_0',
            module: 'ConditionalChatLink',
            type: 7,
            custom_fields: customFields,
        };
        /*global RightNow*/
        RightNow.Client.Controller.addComponent(chatWidget, chatUrl);
        RightNow.Client.Event.evt_widgetLoaded.subscribe(function () {
            RightNow.Client.Event.evt_conditionalChatLinkAvailabilityResponse.subscribe(
                function (eventName, data) {
                    if (data[0].id === 'sccl_0') {
                        $scope.outOfHours = !!data[0].data.out_of_hours;
                        $scope.liveChatToolTipText = localize.getLocalizedString(
                            $scope.outOfHours
                                ? 'Live Chat-Unavailable'
                                : 'Live Chat-Available'
                        );
                    }
                }
            );
            ctrl.refreshLiveChat();
        });
    };

    ctrl.refreshLiveChat = function () {
        if ($scope.outOfHours) {
            $scope.liveChatInterval += 60000;
            /*global sccl_0*/
            sccl_0.checkChatLinkAvailability(null, sccl_0);
            $timeout(function () {
                ctrl.refreshLiveChat();
            }, $scope.liveChatInterval);
        }
    };
    $scope.startLiveChat = function () {
        if (!this.outOfHours) {
            ctrl.openChatWidget();
        }
    };
    ctrl.openChatWidget = function () {
        /*global sccl_0*/
        sccl_0.chatLinkClicked();
    };
    ctrl.getRxNotifications = function (entId) {
        // re-initialize the counts since this means the location changed
        $scope.notifications.counts = 0;
        $scope.notifications.newCounts = false;
        $scope.notifications.url = 'https://www.dosespot.com/';
        // if this call failed for this location in the last 8 hours, the call won't be made again to prevent
        // multiple error messages
        if (
            $scope.loggedInLocation &&
            userRxFactory.NotificationFailed(
                $rootScope.patAuthContext.userInfo.userid
            ) === false
        ) {
            ctrl.rxNotificationAttempts += 1;
            userRxFactory
                .RxNotifications(
                    $rootScope.patAuthContext.userInfo.userid,
                    ctrl.rxNotificationAttempts,
                    entId
                )
                .then(
                    function (res) {
                        // handle successful call
                        ctrl.rxNotificationsSuccess(res);
                        // setup interval
                        userRxFactory.SetRxNotificationsTimer(
                            $rootScope.patAuthContext.userInfo.userid,
                            entId
                        );
                    },
                    function () {
                        // if call fails (for any reason)
                        // note, this can happen if a user is setup in fuse for rx but not validated for Dosespot for a number of reasons
                        // we will only show a failed message if first call or if location changes
                        ctrl.rxNotificationsFailed(entId);
                    }
                );
        }
    };

    ctrl.updateRxNotifications = function (res) {
        ctrl.rxNotificationsSuccess(res);
    };

    // subscribe to rx notification count
    userRxFactory.observeNotifications(ctrl.updateRxNotifications);

    ctrl.rxNotificationsSuccess = function (res) {
        var previousCounts = angular.copy($scope.notifications.counts);
        ctrl.rxNotificationAttempts = 0;
        if (res) {
            var counts =
                res.RefillRequestsTotalCount +
                res.TransactionErrorsTotalCount +
                res.PendingPrescriptionsTotalCount;
            if (counts > previousCounts) {
                $scope.notifications.newCounts = true;
            }
            $scope.notifications.counts = counts;
            if (res.Counts.length > 0) {
                $scope.notifications.url = res.Counts[0].NotificationCountsUrl;
            }
        }
    };

    ctrl.rxNotificationsFailed = function (entId) {
        if (ctrl.rxNotificationAttempts < 3) {
            $timeout(function () {
                ctrl.getRxNotifications(entId);
            }, 10000);
        } else {
            // reset the ctrl.rxNotificationAttempts and show failed message
            ctrl.rxNotificationAttempts = 0;
            toastrFactory.error(
                localize.getLocalizedString(
                    'Failed to retrieve {0}.',
                    ['Rx Notifications'],
                    localize.getLocalizedString('Error')
                )
            );
        }
    };

    $scope.parentPath = function () {
        var path = $location.path();

        if (path.indexOf('/') == 0) {
            path = path.substr(1);
        }

        if (path.indexOf('/') > -1) {
            path = path.substr(0, path.indexOf('/'));
        }

        return '#/' + path;
    };

    $scope.openNewTab = function () {
        tabLauncher.launchNewTab(_.escape($scope.parentPath()));
    };

    // initialize login
    $scope.loginData = {
        userName: '',
        password: '',
    };

    // login
    $scope.focusOnSearchBar = false;
    $scope.login = function () {
        patSecurityService.login();
    };

    // logout
    $scope.logout = function () {
        modalFactory
            .ConfirmModal(
                localize.getLocalizedString('Sign Out'),
                localize.getLocalizedString(
                    'You will be signed out of all Fuse tabs and any unsaved changes will be lost.\r\n\r\nAre you sure you want to sign out?'
                ),
                localize.getLocalizedString('Yes'),
                localize.getLocalizedString('No')
            )
            .then(function () {
                $rootScope.$broadcast('fuse:logout');
                patSecurityService.logout();
                $location.path(_.escape('/'));
                sessionStorage.removeItem('rxAccess');
                sessionStorage.removeItem('rxAccessDenied');
            });
    };

    $scope.$watch('patAuthContext.isAuthorized', function (isAuth) {
        if (!isAuth) {
            $timeout(function () {
                angular.element('#divSignIn').focus();
            }, 0);
        } else {
            //$scope.focusOnSearchBar = true;
            if ($rootScope.patAuthContext.accessLevel == 'Inactive') {
                $uibModal.open({
                    templateUrl: 'App/Dashboard/inactive/inactive.html',
                    keyboard: false,
                    size: 'xl',
                    windowClass: 'center-modal',
                    backdrop: 'static',
                });
            }

            if ($location.$$path == '/') {
                $scope.forceNavOpen = true;
            }
        }
    });

    $scope.isNavCollapsed = true;
    $scope.isPatientEngagement = false;
    $scope.forceNavOpen = false;
    $scope.openCloseNav = function () {
        $scope.isNavCollapsed = !$scope.isNavCollapsed;
    };

    $scope.closeNav = function () {
        $timeout(function () {
            if (!$scope.navWasClicked) {
                $scope.isNavCollapsed = true;
            }
        }, 200);
    };

    $scope.$on('$routeChangeSuccess', function () {
        $scope.isPatientEngagement = $location.path() === '/Engagement/';
        $scope.closeNav();
    });

    $scope.navWasClicked = null;
    $scope.$watch('navWasClicked', function (nv, ov) {
        if (nv && !$scope.forceNavOpen) {
            // reset navWasClicked
            $scope.navWasClicked = false;
            $scope.isNavCollapsed = true;
        } else if (nv != null && $scope.forceNavOpen) {
            $scope.isNavCollapsed = false;
            $scope.navWasClicked = false;
            $scope.forceNavOpen = false;
        }
    });

    $scope.searchClicked = false;

    $scope.getPracticeSettings = function () {
        var defer = $q.defer();
        var promise = defer.promise;

        if ($scope.practiceSettings) {
            $scope.practiceSettingsPromise = promise;
            defer.resolve();
        } else {
            $scope.practiceSettingsPromise = commonServices.PracticeSettings.Operations.Retrieve().$promise.then(
                res => {
                    $scope.practiceSettings = res.Value;
                }
            );
            defer.resolve();
        }
        return $scope.practiceSettingsPromise;
    };

    $scope.getLocationSuccess = function (res) {
        $scope.loggedInLocation = res.Value;
        const practiceId = locationService.getCurrentLocation().practiceid;

        if ($scope.liveChatJSLoaded) {
            const userContext = JSON.parse(sessionStorage.getItem('userContext'));
            var userData = userContext.Result.User;
            const userslist = referenceDataService.get(
                referenceDataService.entityNames.users
            );
            var personInfo = listHelper.findItemsByFieldValue(
                userslist,
                'UserId',
                userData.UserId
            );
            if (personInfo) {
                personInfo = personInfo[0];
                const customFields = `{ "11":"${practiceId}","137":"${userData.FirstName}",
                                    "138":"${userData.LastName}", "139":"${userData.UserName}",
                                    "140":"${$scope.loggedInLocation.PrimaryPhone}",
                                    "153":"${practiceId}",
                                    "154":"${$scope.loggedInLocation.NameLine1}",
                                    "155":"${$scope.loggedInLocation.SecondaryPhone}"
                                    "156":"${$scope.loggedInLocation.Timezone}",
                                    "157":"${personInfo.JobTitle}",
                                    "158":"${personInfo.ProfessionalDesignation}",
                                    "159":"${personInfo.SuffixName}"}`;
                $scope.LoadChatWidget(customFields);
            }
        }
        // rx access? we need to make this call again because it may be successful for a different location        

                var rxService = $injector.get('RxService');
                rxService
                    .notificationsPreCheck($scope.currentUserData.UserId)
                    .then(function (res) {
                        if (res && res.result) {
                            $scope.rxUser = true;
                            ctrl.getRxNotifications(res.entId);
                        }
                        if (res && res.showAdminLink) {
                            $scope.showAdminLink = true;
                        }
                    })
                    .catch(function () { });
            
        userRxFactory.setLocation($scope.loggedInLocation);
        userRxFactory.setLocationChange(true);
        $scope.loading = false;
    };

    $scope.formatDisplayName = function (user) {
        var middleName = user.MiddleName || '';
        var designation = user.ProfessionalDesignation || '';
        return (
            user.LastName +
            ', ' +
            user.FirstName +
            (middleName.length > 0 ? ' ' + middleName.charAt(0) + '. ' : '') +
            (designation.length > 0 ? ' ' + designation : '')
        );
    };

    // storing the selected locations for each user
    $scope.addUsersLocationsToLocalStorage = function (currentLocation) {
        var userId = $rootScope.patAuthContext.userInfo.userid;
        var usersLocations = JSON.parse(localStorage.getItem('usersLocations'));
        // if none have been stored yet, add to localStorage for the first time
        if (!usersLocations) {
            var usersLocations = [angular.copy(currentLocation)];
            usersLocations[0].users = [userId];
        }
        // loop through previously stored locations and update accordingly
        else if (usersLocations.length > 0) {
            var index = listHelper.findIndexByFieldValue(
                usersLocations,
                'id',
                currentLocation.id
            );
            // add location if it doesn't already exist
            if (index === -1) {
                var userLocation = angular.copy(currentLocation);
                userLocation.users = [userId];
                usersLocations.push(userLocation);
            }
            // if location exists, and user is not assoc with it, add them
            else if (
                usersLocations[index].users &&
                usersLocations[index].users.indexOf(userId) === -1
            ) {
                usersLocations[index].users.push(userId);
            }
            var keysOfLocationsToBeRemoved = [];
            // remove this user from any previously selected location
            angular.forEach(usersLocations, function (loc, key) {
                if (
                    currentLocation.id !== loc.id &&
                    loc.users &&
                    loc.users.indexOf(userId) !== -1
                ) {
                    loc.users.splice(loc.users.indexOf(userId), 1);
                }
                if (loc.users && loc.users.length === 0) {
                    keysOfLocationsToBeRemoved.push(key);
                }
            });
            // if no users are associated with this location anymore, remove the location
            angular.forEach(keysOfLocationsToBeRemoved, function (keyOfLocation) {
                usersLocations.splice(keyOfLocation, 1);
            });
        }
        localStorage.setItem('usersLocations', angular.toJson(usersLocations));
        $scope.loading = false;
    };

    $scope.setupHeaderDirective = function () {
        $scope.currentUserData = JSON.parse(localStorage.getItem('fuseUser'));
        if ($scope.currentUserData != null) {
            localStorage.removeItem('fuseUser');
            $scope.currentUser = $scope.formatDisplayName($scope.currentUserData);
            $scope.setupDirectiveLocation();
            webshellOptionalFeatures.loadWalkme();
            $scope.$broadcast('$routeChangeSuccess');
        }
    };

    // this is hit when location changes in the UI
    $scope.$on('patCore:initlocation', function (event) {
        $scope.setupDirectiveLocation();
    });

    $scope.setupDirectiveLocation = function () {
        var currentLocation = locationService.getCurrentLocation();
        //NOTE, we can't use the referenceData here because if the user has changed locations
        // the referenceData will have the previous users locations in it and may not have a match to this users
        // current location (ref bug 398884)

        $scope.getPracticeSettings().then(() => {
            if ($scope.practiceSettings) {
                if (!$scope.practiceSettings.IsLiveChatEnabled) {
                    locationServices.get(
                        { Id: currentLocation.id },
                        $scope.getLocationSuccess
                    );
                } else {
                    var scriptService = $injector.get('ScriptService');
                    scriptService
                        .loadScript(`${soarConfig.supportLiveChatUrl}${ctrl.rightnowJsUrl}`)
                        .then(function (res) {
                            locationServices.get(
                                { Id: currentLocation.id },
                                $scope.getLocationSuccess
                            );
                            $scope.liveChatJSLoaded = true;
                        });
                }
            } else {
                locationServices.get(
                    { Id: currentLocation.id },
                    $scope.getLocationSuccess
                );
            }
            $scope.addUsersLocationsToLocalStorage(currentLocation);
            // only set the selected value if currentLocation exists in localStorage and that value does not already exist in the selected value span
            if (
                currentLocation &&
                currentLocation.name &&
                angular.element('.top-nav-locations button.btn-primary')
            ) {
                const patientRegistrationService = $injector.get(
                    'PatientRegistrationService'
                );
                if (patientRegistrationService) {
                    patientRegistrationService.setRegistrationEvent({
                        eventtype: 6,
                        data: currentLocation,
                    });
                }
                angular
                    .element('.top-nav-locations button.btn-primary')
                    .html(
                        _.escape(currentLocation.name) +
                        '<span class="top-nav-item"> change</span>'
                    );
            }
            // window.location = '#/Dashboard/';

            $scope.amfa = 'soar-per-perdem-search';
            // right now this ensures the loading spinner will go away.
            $rootScope.$broadcast('fuse:headerLoaded');
        });
    };

    $scope.$on('fuse:initheader', function (event) {
        ctrl.checkFeatureFlags();
        $scope.setupHeaderDirective();
        ctrl.getNotificationStatus();
        ctrl.SetNotificationClosed();
        ctrl.getRxNotificationsIndicator();
    });

    // if fuseUser exists in local storage grab the user and populate stuff.
    $scope.currentUserData = JSON.parse(localStorage.getItem('fuseUser'));
    if ($scope.currentUserData != null) {
        $scope.setupHeaderDirective();
    }

    //#region reset recents list on new login
    ctrl.clearRecents = function () {
        globalSearchFactory.ClearRecentPersons();
    };

    ctrl.clearRecents();

    //#endregion

    //#region clear all existing $resource caches

    ctrl.clearCache = function () {
        cacheFactory.ClearAll();
    };
    ctrl.clearCache();

    //#endregion

    //#region location dropdown updates

    $scope.amfa = '';

    // helper for updating filteredLocations
    ctrl.updateFilteredLocations = function (
        locationIds,
        updateSelectedLocation
    ) {
        $timeout(function () {
            $scope.filteredLocations.length = 0;
            angular.forEach($scope.filteredLocationsOriginal, function (loc) {
                if (locationIds.indexOf('All') !== -1) {
                    $scope.filteredLocations.push(loc);
                } else if (locationIds.indexOf(loc.id) !== -1) {
                    $scope.filteredLocations.push(loc);
                }
            });
            if (updateSelectedLocation) {
                var currentLocation = locationService.getCurrentLocation();
                if (
                    !currentLocation ||
                    listHelper.findIndexByFieldValue(
                        $scope.filteredLocations,
                        'id',
                        currentLocation.id
                    ) === -1
                ) {
                    locationService.selectLocation($scope.filteredLocations[0]);
                }
            }
        }, 1000);
    };

    // the header location dropdown needs updated if the active user changes there own location, user crud broadcasts this
    $scope.$on('soar:filter-header-locations', function (ev, locationIds) {
        console.log('##selected location changed##');
        ctrl.updateFilteredLocations(locationIds, false);
    });

    // making a copy of the unfiltered list to use every time the list needs re-filtered
    $scope.$watch(
        'filteredLocations',
        function (nv, ov) {
            if ($scope.filteredLocationsOriginal.length === 0 && nv.length > 0) {
                $scope.filteredLocationsOriginal = angular.copy(
                    $scope.filteredLocations
                );
            }
        },
        true
    );

    //#endregion

    $scope.$on('show-globalAppHeader', function (events, args) {
        if (args === 1) {
            $scope.toShow = true;
            headerAlert.show = true;
            $scope.isInactive = true;
        } else if (args === 2) {
            $scope.toShow = true;
            headerAlert.show = true;
            $scope.isInactive = false;
        } else if (args === 3) {
            $scope.toShow = false;
            headerAlert.show = false;
        }
    });

    $scope.$watch('toShow', function (nv, ov) {
        if (
            nv != ov &&
            (angular.element('#trxHistoryDiv').length > 0 ||
                angular.element('#summaryDiv').length > 0)
        ) {
            if (nv) {
                angular.element('.slidePanel').removeClass('marginTop');
                angular.element('.slidePanel').addClass('marginTopExtra');
            } else {
                angular.element('.slidePanel').removeClass('marginTopExtra');
                angular.element('.slidePanel').addClass('marginTop');
            }
        }
    });

    $scope.$watch('loading', function (nv, ov) {
        if (nv && nv != ov && nv === true) {
            $scope.loadingModal = $uibModal.open({
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
        } else {
            if ($scope.loadingModal != null) {
                $scope.loadingModal.close();
                $scope.loadingModal = null;
            }
        }
    });

    $scope.$watch('ultHeaderCountdown', function (nv, ov) {
        if (nv && !ov) {
            var ultEndTimeForWarning = localStorage.getItem('ultEndTime');
            if (ultEndTimeForWarning) {
                $scope.ultEndTime = JSON.parse(ultEndTimeForWarning);
            }

            var ultCounter = function () {
                var currentMoment = moment();
                var localTimeForUltTimezone = timeZoneFactory.ConvertDateToMomentTZ(
                    currentMoment,
                    $scope.ultEndTime.Timezone
                );

                var startTimeHoursInSec = localTimeForUltTimezone.hour() * 60 * 60;
                var startTimeMinutesInSec = localTimeForUltTimezone.minutes() * 60;
                var startTimeSecondsInSec = localTimeForUltTimezone.seconds();
                var startTimeInSec =
                    startTimeHoursInSec + startTimeMinutesInSec + startTimeSecondsInSec;

                if ($rootScope.ultHeaderCountdown > 0) {
                    $rootScope.ultHeaderCountdown =
                        $scope.ultEndTime.EndTime / 1000 - startTimeInSec;
                } else {
                    $rootScope.ultHeaderCountdown = null;
                    $interval.cancel($scope.ultCountdownInterval);
                }
            };
            $scope.ultCountdownInterval = $interval(ultCounter, 1000);
        }
    });

    $scope.isNotificationsOpen = false;
    $scope.drawer = { isOpen: false };
    $scope.isRxNotificationsCountGreaterThanZero = false;
    $scope.openNotifications = function () {
        $scope.drawer.isOpen = true;
        $scope.isNotificationsOpen = true;
        $scope.IsNotificationBellRed = false;
    }

    $scope.IsNotificationBellRed = false;

    $scope.showDropdown = false;
    $scope.drawer = { isOpen: false };

    $scope.toggleDropdown = function($event) {
      $scope.showDropdown = !$scope.showDropdown;
      if ($scope.showDropdown === true){
        $scope.drawer = { isOpen: true };
      }
    };

}





HeaderController.prototype = Object.create(BaseCtrl.prototype);
