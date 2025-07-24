(function () {
    'use strict';
    //PatWebCoreContants is a dynamically generated module created via MVC controller ConfigSettings.
    var app = angular.module('PatWebCore', [
        'ngResource',
        'ui.bootstrap',
        'ngRoute',
        'PatWebCoreConstants',
        'PatCoreUtility',
        'PatCoreSecurity',
    ]);
    app.config([
        '$httpProvider',
        'CLIENT_ID',
        'TENANT',
        'POST_LOGOUT_REDIRECT_URI',
        'DISPLAY_AS',
        function (
            $httpProvider,
            CLIENT_ID,
            TENANT,
            POST_LOGOUT_REDIRECT_URI,
            DISPLAY_AS
        ) {
            document.title = DISPLAY_AS;
        },
    ]);

    app.run([
        '$rootScope',
        'instanceIdentifier',
        '$uibModal',
        '$location',
        'ROOT_URL',
        'versionService',
        'PREVENT_VERSIONED_APP_REDIRECT',
        '$window',
        'FORCE_SSL',
        'platformSessionService',
        'configSettingsService',
        function (
            $rootScope,
            instanceIdentifier,
            $uibModal,
            $location,
            ROOT_URL,
            versionService,
            PREVENT_VERSIONED_APP_REDIRECT,
            $window,
            FORCE_SSL,
            platformSessionService,
            configSettingsService
        ) {
            instanceIdentifier.getTabData();
            instanceIdentifier.getIdentifier();
            var authContext = {
                isAuthorized: false,
                accessLevel: '',
                userInfo: { username: '', firstname: '', lastname: '', userid: '' },
            };
            var storedAuthContext = platformSessionService.getSessionStorage(
                'patAuthContext'
            );

            if (!storedAuthContext) {
                $rootScope.patAuthContext = authContext;
            } else {
                var jsonAuthContext = storedAuthContext;
                $rootScope.patAuthContext = jsonAuthContext;
            }

            if ($rootScope.patAuthContext.isAuthorized) {
                var preventApplaunch = PREVENT_VERSIONED_APP_REDIRECT === 'true';
                if (preventApplaunch === false) {
                    var currentUrl = $location.absUrl().toUpperCase();
                    var rootUrl = window.location.protocol + '//' + window.location.host;
                    //if the user tries to navigate to the unversioned url redirect them to the correct versioned url
                    if (
                        currentUrl === rootUrl.toUpperCase() ||
                        currentUrl === (rootUrl + '/').toUpperCase() ||
                        currentUrl === (rootUrl + '/#').toUpperCase() ||
                        currentUrl === (rootUrl + '/#/index').toUpperCase() ||
                        currentUrl.indexOf(
                            '/' + versionService.getClientVersionUri().toUpperCase() + '/'
                        ) < 0
                    ) {
                        window.location.replace(
                            rootUrl +
                            '/' +
                            versionService.getClientVersionUri() +
                            '/index.html'
                        );
                    }
                }
            }

            var expiredTokenModal = null;
            $rootScope.$on('patwebcore:expiredToken', function () {
                if (!expiredTokenModal) {
                    var modalHtml =
                        '<div class="modal-content"><div class="modal-header"><h4 class="modal-title">Session Expiration</h4></div><div class="modal-body"><p>Your session has expired. You need to sign in again.</p></div><div class="modal-footer"><button type="button" class="btn btn-primary" ng-click="logIn()">Sign in</button></div></div>';
                    expiredTokenModal = $uibModal.open({
                        template: modalHtml,
                        animation: true,
                        controller: 'SessionExpiredModalController',
                        windowClass: 'modal-loading',
                        backdrop: 'static',
                        keyboard: false,
                    });
                }
            });
        },
    ]);
})();

angular.module('PatWebCore').controller('SessionExpiredModalController', [
    '$scope',
    'patSecurityService',
    function ($scope, patSecurityService) {
        $scope.logIn = function () {
            patSecurityService.logout();
        };
    },
]);
('use strict');
var app = angular.module('PatWebCore');
app.factory('stacktraceService', function () {
    return {
        get: printStackTrace,
    };
});

app.provider('$exceptionHandler', {
    $get: function (errorLogService) {
        return errorLogService;
    },
});

app.factory('errorLogService', [
    '$log',
    '$window',
    '$injector',
    'stacktraceService',
    'ENTERPRISE_URL',
    'CLIENT_ID',
    'SHOW_TOAST_ERROR',
    function (
        $log,
        $window,
        $injector,
        stacktraceService,
        ENTERPRISE_URL,
        CLIENT_ID,
        SHOW_TOAST_ERROR
    ) {
        function log(exception, cause) {

            //Show error toaster message if SHOW_TOAST_ERROR is true or if the route majorly belongs to Insurance. 
            var showInsuranceUIErrors;
            var primaryTeam;
            var showInsuranceUIErrorsFlag;

            try {
                //Gets primary team from the data property of route
                primaryTeam = $injector.get('$route').current.$$route.data.primaryTeam;
                if (primaryTeam == 'Insurance') {
                    showInsuranceUIErrorsFlag = $injector.get('FuseFlag').ShowInsuranceUIErrors;
                    $injector.get('FeatureFlagService').getOnce$(showInsuranceUIErrorsFlag).subscribe((value) => {
                        showInsuranceUIErrors = value;
                    });
                }
            }
            catch(err) {
                console.log('Unable to get feature flag details for error log service. Error - ' + err)
            }

            if (SHOW_TOAST_ERROR === 'true' || (primaryTeam == 'Insurance' && showInsuranceUIErrors == true)) {
                let msg = exception.message || 'Unknown Error',
                    options = {
                        // options override
                        closeButton: true,
                        positionClass: 'toast-bottom-right',
                        preventDuplicates: true,
                        timeOut: 0, // set timeout and extendedTimeOut to 0 to make it sticky
                        extendedTimeOut: 0,
                    },
                    toastElement = toastr.error(
                        msg.substring(0, 100),
                        'Javascript Error',
                        options
                    );
                if (toastElement) {
                    // Better to add somewhere else
                    toastElement.attr('style', 'background-color:#FF8F00');
                }
            }

            // log to the console and continue
            $log.error.apply($log, arguments);
        }
        return log;
    },
]);

(function () {
    'use strict';

    var app = angular.module('PatWebCore');

    app.factory('httpRequestIdentifierInterceptor', [
        'uniqueIdentifier',
        function (uniqueIdentifier) {
            return {
                request: function ($config) {
                    if ($config.noPatHeaders === true) {
                        return $config;
                    }
                    var requestId = uniqueIdentifier.getId();
                    $config.headers['PAT-Request-ID'] = requestId;
                    return $config;
                },
            };
        },
    ]);

    app.config([
        '$httpProvider',
        function ($httpProvider) {
            $httpProvider.interceptors.push('httpRequestIdentifierInterceptor');
        },
    ]);
})();
(function () {
    'use strict';

    var app = angular.module('PatWebCore');

    app.factory('apimInterceptor', ['configSettingsService', function (configSettingsService) {
        return {
            request: function ($config) {
                if ($config.noPatHeaders === true) {
                    return $config;
                }
                $config.headers['Ocp-Apim-Subscription-Key'] = configSettingsService.apimSubscriptionKey;
                return $config;
            }
        }
    }]);

    app.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('apimInterceptor');
    }]);
})();
(function () {
    'use strict';

    var app = angular.module('PatWebCore');

    app.factory('instanceIdentifierInterceptor', [
        'instanceIdentifier',
        function (instanceIdentifier) {
            return {
                request: function ($config) {
                    if ($config.noPatHeaders === true) {
                        return $config;
                    }
                    var tabId = instanceIdentifier.getIdentifier();
                    $config.headers['PAT-Application-Instance-ID'] = tabId;
                    return $config;
                },
            };
        },
    ]);

    app.config([
        '$httpProvider',
        function ($httpProvider) {
            $httpProvider.interceptors.push('instanceIdentifierInterceptor');
        },
    ]);
})();
function sortBy(propertyName) {
    return function (o1, o2) {
        if (o1[propertyName].toLowerCase() < o2[propertyName].toLowerCase()) {
            return -1;
        }
        if (o1[propertyName].toLowerCase() > o2[propertyName].toLowerCase()) {
            return 1;
        }
        return 0;
    };
}
(function () {
    'use strict';
    var factoryName = 'applicationService';
    var dependencies = ['platformSessionCachingService'];

    var app = angular.module('PatWebCore');
    app.factory(factoryName, appFactory);
    appFactory.$inject = dependencies;

    function appFactory(platformSessionCachingService) {
        var getApplicationId = function () {
            var userContext = platformSessionCachingService.userContext.get();
            if (
                userContext === null ||
                userContext.Result === null ||
                userContext.Result.Application === null
            ) {
                return null;
            }
            return userContext.Result.Application.ApplicationId;
        };

        var service = {
            getApplicationId: getApplicationId,
        };
        return service;
    }
})();
(function () {
    'use strict';
    var app = angular.module('PatWebCore');
    app.factory('instanceIdentifier', [
        'uniqueIdentifier',
        '$location',
        'platformSessionService',
        function (uniqueIdentifier, $location, platformSessionService) {
            var setNewIdentifier = function () {
                var identifier = uniqueIdentifier.getId();
                platformSessionService.setSessionStorage(
                    'instanceIdentifier',
                    identifier
                );
                return identifier;
            };

            var removeAllOldTempLocationStorageValues = function () {
                let list = [];
                let dateInMilliseconds = Date.now() - 300000; // get me time in milliseconds plus 5 seconds
                for (var i = 0; i < localStorage.length; i++) {
                    let key = localStorage.key(i);

                    if (key && key.includes('|')) {
                        let parts = key.split('|');

                        if (!isNaN(parts[0])) {
                            var math = dateInMilliseconds - parseInt(parts[0]);

                            // only process old values that were doubled up if they were started over 5 seconds ago.
                            if (math > 0) {
                                if (
                                    key.includes('patAuthContext') ||
                                    key.includes('fuseLogin') ||
                                    key.includes('newFuseLogin') ||
                                    key.includes('userLocation') ||
                                    key.includes('userPractice') ||
                                    key.includes('userContext') ||
                                    key.includes('continueProcessingCall') ||
                                    key.includes('practiceImagingVendors') ||
                                    key.includes('apteryx-imaging2') ||
                                    key.includes('userSelectedLocationfromPAAG')
                                ) {
                                    list.push(key);
                                }
                            }
                        }
                    }
                }

                for (var i = 0; i < list.length; i++) {
                    localStorage.removeItem(list[i]);
                }
            };

            var removeAllTempLocationStorageValues = function () {
                let list = [];
                for (var i = 0; i < localStorage.length; i++) {
                    let key = localStorage.key(i);
                    if (
                        key.includes('patAuthContext') ||
                        key.includes('fuseLogin') ||
                        key.includes('newFuseLogin') ||
                        key.includes('userLocation') ||
                        key.includes('userPractice') ||
                        key.includes('userContext') ||
                        key.includes('continueProcessingCall') ||
                        key.includes('practiceImagingVendors') ||
                        key.includes('apteryx-imaging2') ||
                        key.includes('userSelectedLocationfromPAAG')
                    ) {
                        list.push(key);
                    }
                }

                for (var i = 0; i < list.length; i++) {
                    localStorage.removeItem(list[i]);
                }
            };

            var getTabData = function () {
                var params = $location.search();
                if (params !== undefined) {
                    if (
                        params.hasOwnProperty('newTab') &&
                        params.hasOwnProperty('newKey')
                    ) {
                        if (params.newTab === 'true' && params.newKey !== 'false') {
                            let key = params.newKey;

                            if (!sessionStorage.getItem('fuseLogin')) {
                                sessionStorage.setItem(
                                    'patAuthContext',
                                    localStorage.getItem(key + '|patAuthContext')
                                );
                                sessionStorage.setItem(
                                    'fuseLogin',
                                    localStorage.getItem(key + '|fuseLogin')
                                );
                                sessionStorage.setItem(
                                    'newFuseLogin',
                                    localStorage.getItem(key + '|newFuseLogin')
                                );
                                sessionStorage.setItem(
                                    'userLocation',
                                    localStorage.getItem(key + '|userLocation')
                                );
                                sessionStorage.setItem(
                                    'userPractice',
                                    localStorage.getItem(key + '|userPractice')
                                );
                                sessionStorage.setItem(
                                    'userContext',
                                    localStorage.getItem(key + '|userContext')
                                );
                                sessionStorage.setItem(
                                    'continueProcessingCall',
                                    localStorage.getItem(key + '|continueProcessingCall')
                                );
                                sessionStorage.setItem(
                                    'practiceImagingVendors',
                                    localStorage.getItem(key + '|practiceImagingVendors')
                                );
                                sessionStorage.setItem(
                                    'apteryx-imaging2',
                                    localStorage.getItem(key + '|apteryx-imaging2')
                                );
                                sessionStorage.setItem(
                                    'userSelectedLocationfromPAAG',
                                    localStorage.getItem(key + '|userSelectedLocationfromPAAG')
                                );
                            }

                            // we need to remove the values every time we open a new tab.
                            // otherwise older browsers will not have the values removed.
                            localStorage.removeItem(key + '|patAuthContext');
                            localStorage.removeItem(key + '|fuseLogin');
                            localStorage.removeItem(key + '|newFuseLogin');
                            localStorage.removeItem(key + '|userLocation');
                            localStorage.removeItem(key + '|userPractice');
                            localStorage.removeItem(key + '|userContext');
                            localStorage.removeItem(key + '|continueProcessingCall');
                            localStorage.removeItem(key + '|practiceImagingVendors');
                            localStorage.removeItem(key + '|apteryx-imaging2');
                            localStorage.removeItem(key + '|userSelectedLocationfromPAAG');

                            // remove the temp localstorage values regardless of other items.
                            removeAllOldTempLocationStorageValues();

                            setNewIdentifier();
                            $location.search('newTab', 'false');
                            $location.search('newKey', 'false');

                            return;
                        }
                    }
                }

                // the removeAll Unconditionally method will run only on sign in or refresh
                // because that is the only time the session storage value below is not loaded.
                var x = sessionStorage.getItem('userPractice');
                if (x === null || x === undefined) {
                    removeAllTempLocationStorageValues();
                }
            };

            var createIdentifier = function () {
                var identifier = platformSessionService.getSessionStorage(
                    'instanceIdentifier'
                );
                if (identifier !== null) {
                    return identifier;
                } else {
                    return setNewIdentifier();
                }
            };

            var service = {
                getIdentifier: createIdentifier,
                getTabData: getTabData,
                removeAllTempLocationStorageValues: removeAllTempLocationStorageValues,
            };
            return service;
        },
    ]);
})();
(function () {
    'use strict';

    var app = angular.module('PatCoreSecurity', [
        'PatWebCoreConstants',
        'oauth2',
        'PatCoreUtility',
    ]);

    app.constant('FORCE_DUENDE', false); // Default to false, may be overridden in shell/app.js

    app.factory('patAuthenticationService', [
        '$injector',
        function ($injector) {
            return $injector.get('mainPatAuthenticationService');
        },
    ]);
})();
(function () {
    // the same as the mainPatAuthenticationService but for Apteryx integration
    'use strict';
    var app = angular.module('PatCoreSecurity'); //Assume module has already been defined elsewhere
    app.factory(
        'apteryxPatAuthenticationService',
        apteryxPatAuthenticationService
    );
    apteryxPatAuthenticationService.$inject = [
        '$rootScope',
        '$location',
        'uriService',
        'genericOidcService',
        'globalTokenList',
        '$http',
        'IdmConfig',
        'platformSessionService',
        '$window',
        'FORCE_DUENDE'
    ];

    function apteryxPatAuthenticationService(
        $rootScope,
        $location,
        uriService,
        genericOidcService,
        globalTokenList,
        $http,
        IdmConfig,
        platformSessionService,
        $window,
        FORCE_DUENDE
    ) {
        var tokenName = 'apteryx-imaging';
        var tokenState = 'apteryx-login';

        var addTokenToGlobalList = function (token) {
            //Add the tokenName and urls to the TokenList so the bearer token will be applied when it needs to be applied.
            // Need to change the url to something that makes sense.

            // grab the web.config value used here and in the web.config.
            var url = IdmConfig.apteryxUrlPart;
            globalTokenList.addToTokenList(token, [url]);
        };

        if (genericOidcService.getAccessToken(tokenName) !== null) {
            addTokenToGlobalList(tokenName);
        }

        //// load vendor token if active
        var results = platformSessionService.getSessionStorage(
            'practiceImagingVendors'
        );
        _.forEach(results, function (provider, index) {
            if (provider.VendorId === 1) {
                // make this better when doing generic implementation
                startUp(provider);
            }
        });

        function startUp(provider) {
            /// Get a users Practice and utilize its id to get the correct vendor record
            var practice = platformSessionService.getSessionStorage('userPractice');
            if (practice !== null && practice.id !== null) {
                var url =
                    uriService.getWebApiUri() +
                    '/api/practiceImagingVendor/' +
                    practice.id +
                    '/' +
                    provider.VendorId;
                $http.get(url).then(function (res) {
                    var practiceScope = '';
                    if (res.data.Result.VendorPracticeIdentifier !== null) {
                        practiceScope =
                            'apteryx-imaging-' + res.data.Result.VendorPracticeIdentifier;
                        
                        const urlParams = new URLSearchParams($window.location.search);

                        const duendeParam = urlParams.get('duende')
                        var configureDuende = FORCE_DUENDE
                        if (duendeParam !== null) {
                            configureDuende = duendeParam === 'true'
                        }

                        // !!!Config for the entire setup!!!
                        var sessionConfig = {
                            loginUrl: configureDuende ? IdmConfig.duendeRootUrl + '/connect/authorize' : IdmConfig.rootUrl + '/connect/authorize',
                            redirectUri: IdmConfig.loginRedirectUrl,
                            clientId: IdmConfig.apteryxClientId,
                            scope: 'pat.soar.api.apteryx' + ' ' + practiceScope,
                            isIdToken: false,
                        };
                        var name = platformSessionService.getSessionStorage(tokenName);
                        if (name === null) {
                            genericOidcService.setConfiguration(tokenName, sessionConfig); // populate the configuration and set session storage values.
                        } else {
                            sessionConfig.scope = genericOidcService.getValue(
                                tokenName,
                                'scope'
                            );
                        }

                        genericOidcService.setConfigValue(
                            tokenName,
                            'scope',
                            sessionConfig.scope
                        );

                        var logoutUrl = IdmConfig.rootUrl + '/connect/endsession';
                        var postLogoutRedirectUrl = configureDuende ? IdmConfig.logoutRedirectUrl + "?duende=true" : IdmConfig.logoutRedirectUrl;

                        // finally when the other items are done ... setup the token!!
                        setupToken();
                    }
                });
            }
        }

        function setupToken() {
            var win = window;
            console.log('Apteryx token refresh start');
            return genericOidcService
                .tryLoginWithIFrame(tokenName)
                .then(function (result) {
                    addTokenToGlobalList(tokenName);
                    genericOidcService.startRefresh(tokenName);
                    win.postMessage('Apteryx Token Process Completed', '*');
                    var token = genericOidcService.getAccessToken(tokenName);
                    if (token !== '') {
                        console.log('Retrieved token apteryx 1.0 successfully');
                        $rootScope.$broadcast('authService:tokenRefreshed', token);
                    }
                })
                .catch(function (result) {
                    console.log(
                        'Imaging Auth Exception: Apteryx 1 "setupToken" receiving new token! ' +
                        result
                    );
                });
        }

        function login() {
            genericOidcService.initImplicitFlow(tokenName, tokenState);
        }

        function logout() {
            // This methods is not being used
            console.log('Logging out');
            var idToken = genericOidcService.getIdToken(tokenName);
        }

        function getCachedToken() {
            return genericOidcService.getAccessToken(tokenName);
        }

        var service = {
            tokenName: tokenName,
            tokenState: tokenState,
            login: login,
            logout: logout,
            setupToken: setupToken,
            getCachedToken: getCachedToken,
        };
        return service;
    }
})();
(function () {
    // the same as the mainPatAuthenticationService but for Apteryx 2.0 integration
    'use strict';
    var app = angular.module('PatCoreSecurity'); //Assume module has already been defined elsewhere
    app.factory(
        'apteryxPatAuthenticationService2',
        apteryxPatAuthenticationService2
    );
    apteryxPatAuthenticationService2.$inject = [
        '$rootScope',
        '$location',
        '$q',
        'uriService',
        'genericOidcService',
        'globalTokenList',
        '$interval',
        '$http',
        'IdmConfig',
        'platformSessionService',
    ];

    function apteryxPatAuthenticationService2(
        $rootScope,
        $location,
        $q,
        uriService,
        genericOidcService,
        globalTokenList,
        $interval,
        $http,
        IdmConfig,
        platformSessionService
    ) {
        var tokenName = 'apteryx-imaging2';
        var tokenState = 'apteryx-login';
        var loggingIn = null;
        var baseLoginUrl = platformSessionService.getSessionStorage("fuseLogin").loginUrl
        var configureDuende = baseLoginUrl.includes("duende")

        var addTokenToGlobalList = function (token) {
            //Add the tokenName and urls to the TokenList so the bearer token will be applied when it needs to be applied.
            // Need to change the url to something that makes sense.

            // grab the web.config value used here and in the web.config.
            var url = IdmConfig.apteryx2UrlPart;
            globalTokenList.addToTokenList(token, [url]);
        };

        if (genericOidcService.getAccessToken(tokenName) !== null) {
            addTokenToGlobalList(tokenName);
        }

        if (genericOidcService.getIsLoggedIn(tokenName)) {
            loggingIn = $q.resolve();
        } else {
            //// load vendor token if active
            var results = platformSessionService.getSessionStorage(
                'practiceImagingVendors'
            );
            _.forEach(results, function (provider, index) {
                if (provider.VendorId === 3) {
                    // make this better when doing generic implementation
                    loggingIn = startUp(provider, configureDuende);
                }
            });

            function startUp(provider, configureDuende) {
                /// Get a users Practice and utilize its id to get the correct vendor record
                var practice = platformSessionService.getSessionStorage('userPractice');
                if (practice !== null && practice.id !== null) {
                    var url =
                        uriService.getWebApiUri() +
                        '/api/practiceImagingVendor/' +
                        practice.id +
                        '/' +
                        provider.VendorId;
                    return $http.get(url).then(function (result, headers) {
                        var practiceScope = '';
                        var data = result.data;
                        if (data.Result.VendorPracticeIdentifier !== null) {
                            practiceScope =
                                'apteryx-imaging2-' + data.Result.VendorPracticeIdentifier;

                            // !!!Config for the entire setup!!!
                            var sessionConfig = {
                                loginUrl: IdmConfig.rootUrl + '/connect/authorize',
                                redirectUri: IdmConfig.loginRedirectUrl,
                                clientId: configureDuende ? IdmConfig.apteryx3ClientId : IdmConfig.apteryx2ClientId,
                                scope: 'pat.soar.api.apteryx' + ' ' + practiceScope,
                                isIdToken: false,
                            };
                            var name = platformSessionService.getSessionStorage(tokenName);
                            if (name === null) {
                                genericOidcService.setConfiguration(tokenName, sessionConfig); // populate the configuration and set session storage values.
                            } else {
                                sessionConfig.scope = genericOidcService.getValue(
                                    tokenName,
                                    'scope'
                                );
                            }

                            genericOidcService.setConfigValue(
                                tokenName,
                                'scope',
                                sessionConfig.scope
                            );

                            var logoutUrl = IdmConfig.rootUrl + '/connect/endsession';

                            // finally when the other items are done ... setup the token!!
                            return setupToken();
                        }
                    });
                }

                return $q.reject(
                    'Unexpected Location in apteryxPatAuthenticationService2.startUp'
                );
            }
        }

        function setupToken() {
            console.log('Apteryx 2 token setup start');
            return genericOidcService
                .tryLoginWithIFrame(tokenName)
                .then(function (result) {
                    addTokenToGlobalList(tokenName);
                    genericOidcService.startRefresh(tokenName);
                    var token = genericOidcService.getAccessToken(tokenName);
                    if (token !== '') {
                        console.log('Loaded token ' + tokenName + ' successfully');
                        $rootScope.$broadcast('authService:tokenRefreshed', token);
                    }
                })
                .catch(function (result) {
                    console.log(
                        "Imaging Auth Exception: Apteryx 2 'setupToken' receiving new token! " +
                        result
                    );
                });
        }

        function login() {
            genericOidcService.initImplicitFlow(tokenName, tokenState);
        }

        function logout() {
            // This methods is not being used
            console.log('Logging out');
            var idToken = genericOidcService.getIdToken(tokenName);
        }

        function getCachedToken() {
            return genericOidcService.getAccessToken(tokenName);
        }

        function getIsLoggedIn() {
            return genericOidcService.getIsLoggedIn(tokenName);
        }

        var service = {
            tokenName: tokenName,
            tokenState: tokenState,
            login: login,
            logout: logout,
            loggingIn: loggingIn,
            getIsLoggedIn: getIsLoggedIn,
            setupToken: setupToken,
            getCachedToken: getCachedToken,
        };

        return service;
    }
})();
(function () {
    // Really !!! Heavily Modified version of angular-oidc library

    var app = angular.module('oauth2', []);

    app.service('genericOidcService', [
        'globalTokenList',
        '$document',
        '$window',
        '$timeout',
        '$interval',
        '$q',
        '$location',
        '$http',
        '$log',
        'platformSessionService',
        'IdmConfig',
        function (
            globalTokenList,
            $document,
            $window,
            $timeout,
            $interval,
            $q,
            $location,
            $http,
            $log,
            platformSessionService,
            IdmConfig
        ) {
            var that = this;

            // I need to pass this in as a tokenConfig value not causing a problem today but should be moved over ... make time in the next couple of weeks after vacation for this.
            this.rngUrl = '';

            var win = window;
            var unique = new Date().toString();
            var tokenDefer = [];
            var tokenInterval = [];
            var tokenRetryCount = [];
            var tokenTimeout = [];

            var tokenRefreshInterval = parseInt(IdmConfig.tokenRefreshInterval);
            if (!tokenRefreshInterval) {
                tokenRefreshInterval = 1000 /*ms*/ * 60 /*seconds*/ * 40 /*minutes*/;
            }

            // We use this to communicate from tryLogin
            // tryLogin is executing within a frame which is executing in a different context
            // But we want to communicate back to the context that the original
            // tryLoginWithIFrame call is in
            win.onOAuthCallback = function (tokenName) {
                var defer = tokenDefer[tokenName];
                if (defer) {
                    defer.resolve();
                    tokenDefer[tokenName] = null;
                }

                if (tokenTimeout[tokenName]) {
                    $timeout.cancel(tokenTimeout[tokenName]);
                }
            };

            this.tryLoginWithIFrame = function (tokenName) {
                var defer = tokenDefer[tokenName];

                if (defer) {
                    defer.reject('tryLoginWithIFrame: Unfinished login rejected');
                    tokenDefer[tokenName] = null;
                }

                if (tokenTimeout[tokenName]) {
                    $timeout.cancel(tokenTimeout[tokenName]);
                }

                // Overzealous cleanup
                removeIFrame(tokenName);

                defer = $q.defer();

                this.createUrl(tokenName, '').then(function (url) {
                    var html =
                        "<iframe src='" +
                        _.escape(url) +
                        "' height='400' width='400' id='oauthFrame" +
                        _.escape(tokenName) +
                        "' class='oauthFrame' style='display:none'></iframe>";
                    var docChild = document.getElementsByTagName(
                        'app-service-bootstrap'
                    )[0];

                    if (docChild != null) {
                        docChild.innerHTML += html;
                    } else {
                        var elem = $(html);

                        $document.find('body').children().first().append(elem);
                    }
                });

                // Remove IFrame - Success or Failure
                // Doing this within either of the onOAuthCallback methods
                // caused Chrome to hang
                defer.promise.then(
                    function () {
                        removeIFrame(tokenName);
                    },
                    function () {
                        removeIFrame(tokenName);
                    }
                );

                tokenTimeout[tokenName] = $timeout(
                    function (tn) {
                        var defer = tokenDefer[tokenName];
                        if (defer) {
                            defer.reject(
                                'tryLoginWithIFrame: Token ' + tn + ' has timed out'
                            );
                        }
                    },
                    15000,
                    true,
                    tokenName
                );

                tokenDefer[tokenName] = defer;

                return defer.promise;
            };

            this.createUrl = function (tokenName, state) {
                var that = this;

                // get tokenConfig
                var tokenConfig = this.getToken(tokenName);

                if (state === null || typeof state === 'undefined') {
                    tokenConfig.state = '';
                } else {
                    tokenConfig.state = state;
                }

                // Set State value in SessionStorage
                platformSessionService.setSessionStorage(tokenName, tokenConfig);

                return this.createAndSaveNonce(tokenName, tokenConfig).then(function (
                    nonce
                ) {
                    state = state ? nonce + ';' + state : nonce;

                    var response_type = tokenConfig.isIdToken
                        ? 'id_token+token'
                        : 'token';

                    var url =
                        tokenConfig.loginUrl +
                        '?response_type=' +
                        response_type +
                        '&client_id=' +
                        encodeURIComponent(tokenConfig.clientId) +
                        '&state=' +
                        encodeURIComponent(state) +
                        '&redirect_uri=' +
                        encodeURIComponent(tokenConfig.redirectUri) +
                        '&scope=' +
                        encodeURIComponent(tokenConfig.scope);

                    if (tokenConfig.isIdToken) {
                        url += '&nonce=' + encodeURIComponent(tokenConfig.nonce);
                    }
                    return url;
                });
            };

            this.createAndSaveNonce = function (tokenName, tokenConfig) {
                return this.createNonce(this.rngUrl).then(function (nonce) {
                    tokenConfig.nonce = nonce;
                    platformSessionService.setSessionStorage(tokenName, tokenConfig);
                    return nonce;
                });
            };

            this.initImplicitFlow = function (tokenName, state) {
                this.createUrl(tokenName, state)
                    .then(function (url) {
                        location.href = url;
                    })
                    .catch(function (error) {
                        $log.error('Error in initImplicitFlow');
                        $log.error(error);
                    });
            };

            this.callEventIfExists = function (tokenName, accessToken, idToken) {
                if (this.options.onTokenReceived) {
                    var tokenParams = {
                        tokenName: tokenName,
                        idToken: idToken,
                        accessToken: accessToken,
                    };
                    this.options.onTokenReceived(tokenParams);
                }
            };

            this.tryLogin = function (tokenName, options) {
                options = options || {};

                /** @type {URLSearchParams} */
                var parts = this.getFragment();

                var accessToken = parts.get('access_token');
                var idToken = parts.get('id_token');
                var state = parts.get('state');
                var error = parts.get('error');

                if (!state) {
                    return false;
                }

                var savedNonce = this.getValue(tokenName, 'nonce');

                var stateParts = state.split(';');
                var nonceInState = stateParts[0];

                if (savedNonce !== nonceInState) {
                    if (options.onError) {
                        options.onError('Mismatched nonce received for ' + tokenName);
                    }
                    return false;
                }

                var oidcSuccess = false;
                var oauthSuccess = false;

                if (error) {
                    if (options.onError) {
                        options.onError(error);
                    }
                }

                if (!accessToken || !state) {
                    return false;
                }

                var tokenConfig = platformSessionService.getSessionStorage(tokenName);
                var isIdToken = tokenConfig['isIdToken'];

                // this code processes based on the isIdToken flag stored for the token at creation time.
                if (isIdToken && !idToken) return false;

                if (savedNonce === nonceInState) {
                    // set access_token
                    tokenConfig['access_token'] = accessToken;
                    platformSessionService.setSessionStorage(tokenName, tokenConfig);

                    // set accessTokenParts
                    var now = new Date();
                    var refreshBy = new Date(now.getTime() + tokenRefreshInterval);
                    tokenConfig['expires_at'] = refreshBy;

                    platformSessionService.setSessionStorage(tokenName, tokenConfig);

                    if (stateParts.length > 1) {
                        this.state = stateParts[1];
                    }

                    oauthSuccess = true;
                }

                if (!oauthSuccess) {
                    return false;
                }

                if (isIdToken) {
                    tokenConfig['id_token'] = idToken;
                    platformSessionService.setSessionStorage(tokenName, tokenConfig);
                }

                if (options.validationHandler) {
                    var validationParams = { accessToken: accessToken, idToken: idToken };

                    options
                        .validationHandler(validationParams)
                        .then(function () {
                            this.callEventIfExists(tokenName, accessToken, idToken);
                        })
                        .catch(function (reason) {
                            var text =
                                'Auth Exception: Error with generic "tryLogin" validating tokens ' +
                                reason;
                            $log.error(text);
                            throw text;
                        });
                } else {
                    this.callEventIfExists(tokenName, accessToken, idToken);
                }

                var win = window;
                if (win.parent && win.parent.onOAuthCallback) {
                    // Important step
                    // When this is within an iframe we are in a new context - new instance of genericOidcService
                    // We need to communicate back to the original page's instance of genericOidcService
                    // this is done using a callback on our PARENT
                    win.parent.onOAuthCallback(tokenName, this.state);
                }

                return true;
            };

            var removeIFrame = function (tokenName) {
                var iframe = document.getElementById('oauthFrame' + tokenName);
                if (iframe !== null) {
                    iframe.parentNode.removeChild(iframe);
                }
            };

            this.logOut = function () {
                globalTokenList.emptyTokenListAndRemoveSessionValues();
            };

            this.setup = function (tokenName, options) {
                options = options || {};
                options.loginState = options.loginState || 'login';
                this.options = options;

                if (this.tryLogin(tokenName, options)) {
                    if (this.state) {
                        $location.url(this.state.substr(1)); // cut # off
                    }
                    return true;
                }
                return false;
            };

            this.startRefresh = function (tokenName) {
                // Double check that we are in the parent window - not within the refresh iframe
                if (window === window.parent) {
                    // Setup a timeout to refresh the token at the expiration
                    // which is actually a little ahead of the true expiration
                    var now = new Date();
                    var expiresAt = this.getExpiresAt(tokenName);
                    if (expiresAt) {
                        var timeToExpiration = expiresAt.getTime() - now.getTime();

                        // If the computer was asleep, maybe??
                        if (timeToExpiration < 0) {
                            timeToExpiration = 100; // Just in case it doesn't like 0
                        }

                        // Provides a means in the console to override (ususally shorten) the token refresh
                        // For testing and reproducing issues
                        var override = platformSessionService.getSessionStorage(
                            'overrideAuthTokenTimeout'
                        );
                        if (override !== null && _.parseInt(override) > 0) {
                            timeToExpiration = override;
                        }

                        var refreshAt = new Date(new Date().getTime() + timeToExpiration);
                        console.log('Refresh ' + tokenName + ' at ' + refreshAt);

                        tokenRetryCount[tokenName] = 0;
                        // Important: Don't let the interval continually execute
                        tokenInterval[tokenName] = $interval(
                            this.refresh,
                            timeToExpiration,
                            1,
                            true,
                            this,
                            tokenName
                        );
                    }
                }
            };

            this.retryRefresh = function (tokenName) {
                if (tokenRetryCount[tokenName] < 5) {
                    tokenRetryCount[tokenName] = tokenRetryCount[tokenName] + 1;

                    var refreshAt = new Date(new Date().getTime() + 10000);
                    console.log(
                        'Retry #' +
                        tokenRetryCount[tokenName] +
                        ' refresh of ' +
                        tokenName +
                        ' at ' +
                        refreshAt
                    );

                    tokenInterval[tokenName] = $interval(
                        this.refresh,
                        10000,
                        1,
                        true,
                        this,
                        tokenName
                    );
                    return true;
                } else {
                    return false;
                }
            };

            this.refresh = function (genericOidcService, tokenName) {
                // If this executes on the logout screen or something else unexpected do nothing
                if (
                    genericOidcService.getAccessToken(tokenName) !== null &&
                    genericOidcService.getAccessToken(tokenName) != ''
                ) {
                    console.log(tokenName + ' token refresh start');
                    //console.log('Time of refresh: ' + new Date());
                    return genericOidcService
                        .tryLoginWithIFrame(tokenName)
                        .then(function () {
                            console.log(
                                'Retrieved a new ' + tokenName + ' token successfully'
                            );
                            // Infinite loop - refresh the new token when the new token expires
                            genericOidcService.startRefresh(tokenName);
                        })
                        .catch(function (result) {
                            var text = 'Refresh error for token ' + tokenName + ':' + result;
                            console.log(text);

                            // There was an error, tokenRetryCount
                            if (!genericOidcService.retryRefresh(tokenName)) {
                                throw text;
                            }
                        });
                } else {
                    console.log(
                        'genericOidcService.Refresh: Access_Token is null for ' + tokenName
                    );
                }
            };

            this.getIsLoggedIn = function (tokenName) {
                // Ensure the tokenConfig is in session storage and login actually succeeded (access_token != '')
                if (
                    this.getAccessToken(tokenName) !== null &&
                    this.getAccessToken(tokenName) != ''
                ) {
                    var expiresAt = this.getExpiresAt(tokenName);
                    var now = new Date();
                    if (expiresAt && expiresAt > now) {
                        return true;
                    }
                    return false;
                }
                return false;
            };

            this.createNonce = function (specificUrl) {
                if (specificUrl) {
                    return $http.get(specificUrl).then(function (result) {
                        return result.data;
                    });
                } else {
                    var text = '';
                    var possible =
                        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

                    for (var i = 0; i < 40; i++)
                        text += possible.charAt(
                            Math.floor(Math.random() * possible.length)
                        );

                    return $q.when(text);
                }
            };

            // external
            this.setConfigValue = function (tokenName, property, value) {
                var tokenConfig = platformSessionService.getSessionStorage(tokenName);
                tokenConfig[property] = value;
                platformSessionService.setSessionStorage(tokenName, tokenConfig);
            };

            this.setConfiguration = function (tokenName, startingConfig) {
                var tokenConfig = {
                    loginUrl: startingConfig.loginUrl,
                    redirectUri: startingConfig.redirectUri,
                    clientId: startingConfig.clientId,
                    scope: startingConfig.scope,
                    access_token: '',
                    id_token: '',
                    expires_at: '',
                    state: '',
                    nonce: '',
                    isIdToken: startingConfig.isIdToken,
                };
                platformSessionService.setSessionStorage(tokenName, tokenConfig);
            };

            this.getValue = function (tokenName, property) {
                var result = platformSessionService.getSessionStorage(tokenName);
                if (result !== null) {
                    return result[property];
                } else {
                    return null;
                }
            };

            this.getToken = function (tokenName) {
                return platformSessionService.getSessionStorage(tokenName);
            };

            this.getIdToken = function (tokenName) {
                return this.getValue(tokenName, 'id_token');
            };

            this.getAccessToken = function (tokenName) {
                try {
                    return this.getValue(tokenName, 'access_token');
                } catch (err) {
                    return null;
                }
            };

            this.getExpiresAt = function (tokenName) {
                var expires_at = this.getValue(tokenName, 'expires_at');
                if (expires_at) {
                    return new Date(expires_at);
                } else {
                    return null;
                }
            };

            /**
             * Returns URLSearchParams parsed from window.location.hash excluding the hash and, optionally, a leading slash(/).
             *
             * @returns {URLSearchParams} URLSearchParams
             */
            this.getFragment = function () {
                if (window.location.hash.indexOf('#') === 0) {
                    return new URLSearchParams(window.location.hash.replace(/^#\/?/, ''));
                } else {
                    return new URLSearchParams();
                }
            };
        },
    ]);
})();
(function () {
    // This item is used to save a list of tokenNames and URLs for those token names.
    // Details of this might evolve, however at present the idea is that when someone logs into the application
    // they will get a token, we also have other services that require a separate token right now ex: Apteryx integration.
    // After a user logs in the old behavior was that the Authorization header bearer token was set.
    // Now that we are going to utilize more then one token, we need a place to store which url is good for what token,
    // we get the token from sessionStorage by name.
    // That is what this service is meant to accomplish. It is used to keep track of those tokens.
    // Secondarily this item will also help in the logout process. Since we have many tokens
    // we need a way to remove them before a user logs out of the application. This service contains a method that iterates over the tokens
    // and removes the corresponding values from sessions storage, then removes the values from the list.
    var app = angular.module('oauth2');

    app.service('globalTokenList', [
        '$filter',
        function ($filter) {
            var tokenNameList = [];

            this.getList = function () {
                return tokenNameList;
            };

            this.addToTokenList = function (tokenName, urls) {
                var tokenNameAndUrls = {
                    name: tokenName,
                    urls: urls,
                };
                // check if it exists already in the list ... if it does then do nothing
                if (!_.isNil(tokenNameList) && tokenNameList.length >= 0) {
                    var value = $filter('filter')(tokenNameList, { name: tokenName });
                    if (_.isNil(value) || value.length === 0) {
                        tokenNameList.push(tokenNameAndUrls);
                    }
                }
            };

            this.getNameOfTokenToUtilizeForAuthorizationHeader = function (url) {
                // if url match is not found return nothing.
                var tokenName = '';
                // iterate over the tokenNameList and based on if the current Url matches
                // return what Token name to utilize for the authorization bearer token
                if (!_.isNil(tokenNameList) && tokenNameList.length > 0) {
                    _.forEach(tokenNameList, function (item, key) {
                        // iterate over the list of urls that should work for a token ...
                        // if present in the list ... then return tokenName.
                        _.forEach(item.urls, function (element, index) {
                            if (url.indexOf(element) > -1) {
                                tokenName = item.name;
                            }
                        });
                    });
                }
                return tokenName;
            };

            this.emptyTokenListAndRemoveSessionValues = function () {
                if (!_.isNil(tokenNameList) && tokenNameList.length > 0) {
                    _.forEach(tokenNameList, function (item, key) {
                        var value = item.name;
                        sessionStorage.removeItem(value);
                    });
                    tokenNameList = []; // empty out the tokenNameList
                }
                
            };
        },
    ]);
})();
(function () {
    'use strict';

    var app = angular.module('PatCoreSecurity');

    app.factory('httpBearerTokenInterceptor', [
        'globalTokenList',
        'platformSessionService',
        function (globalTokenList, platformSessionService) {
            return {
                request: function ($config) {
                    if ($config.noPatHeaders === true) {
                        return $config;
                    }

                    // When a user signs in they are given a token and the token name is setup as part of that.
                    // The token names and Url patterns associated with the different tokens are stored in a separate service
                    // That service (globalTokenList) is used to determine what token is added for the authentication header as a bearer token.

                    //var list = globalTokenList.getList();
                    //var name = 'fuseLogin';
                    var name = globalTokenList.getNameOfTokenToUtilizeForAuthorizationHeader(
                        $config.url
                    );
                    if (name !== '') {
                        var value = platformSessionService.getSessionStorage(name);
                        if (value !== null && value !== undefined) {
                            $config.headers.Authorization = 'Bearer ' + value.access_token;
                        } else if (
                            value.access_token !== null &&
                            value.access_token !== ''
                        ) {
                            console.log(
                                'Error: Attempted to use token ' +
                                name +
                                ' but access_token is empty.'
                            );
                        }
                    }

                    return $config;
                },
            };
        },
    ]);

    app.config([
        '$httpProvider',
        function ($httpProvider) {
            $httpProvider.interceptors.push('httpBearerTokenInterceptor');
        },
    ]);
})();
(function () {
    //This implementation will use the OAuth 2.0 implicit grant flow to do logins and federated
    //logout.  It is designed to work specifically with IdentityServer3 and has the various
    //endpoint URLs baked in.

    'use strict';
    var app = angular.module('PatCoreSecurity'); //Assume module has already been defined elsewhere
    app.factory('mainPatAuthenticationService', mainPatAuthenticationService);
    mainPatAuthenticationService.$inject = [
        '$window',
        '$rootScope',
        'genericOidcService',
        'globalTokenList',
        '$timeout',
        '$http',
        'IdmConfig',
        'platformSessionService',
        'AUTH_TOKEN_NAMES',
        '$injector',
        'FORCE_DUENDE'
    ];
    function mainPatAuthenticationService(
        $window,
        $rootScope,
        genericOidcService,
        globalTokenList,
        $timeout,
        $http,
        IdmConfig,
        platformSessionService,
        AUTH_TOKEN_NAMES,
        $injector,
        FORCE_DUENDE
    ) {
        // clean up some values that should be removed.
        sessionStorage.removeItem('apteryxLogoutUrl'); // if this value exists in session storage remove it ... it will be added back upon sign out if needed.

        var tokenName = 'fuseLogin';
        var tokenState = 'initial-login';
        // !!!Config for the entire setup!!!
        var configureDuende = ""

        const urlParams = new URLSearchParams($window.location.search);
        const duendeParam = urlParams.get('duende')

        var storedTokenName = platformSessionService.getSessionStorage(tokenName);
        if (storedTokenName === null) {
            configureDuende = FORCE_DUENDE
            if (duendeParam !== null) {
                configureDuende = duendeParam === 'true'
            }
        } else {
            configureDuende = storedTokenName.loginUrl && storedTokenName.loginUrl.includes(IdmConfig.duendeRootUrl);
        }

        var sessionConfig = {
            loginUrl: configureDuende ? IdmConfig.duendeRootUrl + '/connect/authorize' : IdmConfig.rootUrl + '/connect/authorize',
            redirectUri: IdmConfig.loginRedirectUrl,
            clientId: IdmConfig.clientId,
            scope: IdmConfig.scope,
            isIdToken: true,
        };

        if (storedTokenName === null) {
            genericOidcService.setConfiguration(tokenName, sessionConfig); // populate the configuration and set session storage values.
        } else {
            sessionConfig.scope = genericOidcService.getValue(tokenName, 'scope');
        }

        if (sessionConfig.scope.indexOf('openid') === -1) {
            sessionConfig.scope = sessionConfig.scope + ' openid';
        }
        if (sessionConfig.scope.indexOf('email') === -1) {
            sessionConfig.scope = sessionConfig.scope + ' email';
        }

        genericOidcService.setConfigValue(tokenName, 'scope', sessionConfig.scope);
        var logoutUrl = configureDuende ? IdmConfig.duendeRootUrl + '/connect/endsession' : IdmConfig.rootUrl + '/connect/endsession';

        var postLogoutRedirectUrl = configureDuende ? IdmConfig.logoutRedirectUrl + "?duende=true" : IdmConfig.logoutRedirectUrl;

        // Global !!!!
        $rootScope.$on('$locationChangeSuccess', function (event, url) {
            //console.log('Location');
            //console.log(window.location.href);
            var isLogin = false;

            ////////////////////////////////////////////////////////////////////
            // Conditions to evaluate which token is appropriate to utilize
            var currentTokenName = '';
            var currentTokenState = '';

            /** @type {URLSearchParams} */
            var fragmentParts = genericOidcService.getFragment();
            const scope = fragmentParts.get('scope');

            if (fragmentParts !== null && scope !== null && scope !== undefined) {
                // need to check how this responds to adding apteryx 2.0 implementation.
                // I will probably have to charge items to get them to work right.
                console.log('Returned Scopes : ' + scope);

                if (scope.indexOf('apteryx-imaging2') > 0) {
                    currentTokenName = 'apteryx-imaging2';
                    currentTokenState = 'apteryx-login';
                } else if (scope.indexOf('apteryx') > 0) {
                    currentTokenName = 'apteryx-imaging';
                    currentTokenState = 'apteryx-login';
                }
            }

            // This is the common fallback and sets up our auth token
            if (currentTokenName === '' && currentTokenState === '') {
                currentTokenName = 'fuseLogin';
                currentTokenState = 'initial-login';
            }
            ////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////
            //var testing = genericOidcService.getAccessToken(currentTokenName);
            //console.log('New Token');
            //console.log(testing);

            isLogin = genericOidcService.setup(currentTokenName, {
                onTokenReceived: function (context) {
                    if (tokenName === 'fuseLogin') {
                        // need to get newly saved item from sessionStorage
                        // then go ahead and save the value to session storage under the new key name
                        var newlyInsertedValue = JSON.parse(
                            sessionStorage.getItem(tokenName)
                        );
                        sessionStorage.setItem(
                            'newFuseLogin',
                            JSON.stringify(newlyInsertedValue)
                        );

                        $rootScope.$broadcast(
                            'authService:tokenRefreshed',
                            context.accessToken
                        );
                    } else {
                        $rootScope.$broadcast(
                            'imagingAuthService:tokenRefreshed',
                            context.accessToken
                        );
                    }
                    console.log('Token received: ' + context.accessToken);
                    addTokenToGlobalList(currentTokenName);
                
                },
                onError: function (error) {
                    var text =
                        'Auth Exception: ' +
                        isLogin +
                        ' Error getting token for : ' +
                        currentTokenName +
                        ' : ' +
                        error;
                    console.error(text);
                    // Need to log the exception to appinsights
                    throw text;
                    $rootScope.$broadcast('authService:error', text);
                },
            });

            if (genericOidcService.getIsLoggedIn(currentTokenName)) {
                var token = genericOidcService.getAccessToken(currentTokenName);

                var useSelectedPracticeId = $injector.get('ENABLE_SET_PracticeId_FROM_TOKEN');
 
                if (currentTokenName == 'fuseLogin' && useSelectedPracticeId  === 'true') {
                    setPracticeIdFromToken(token);
                }

                addTokenToGlobalList(currentTokenName);
                if (
                    isLogin &&
                    genericOidcService.getValue(currentTokenName, 'state') ===
                    currentTokenState
                ) {
                    $rootScope.$broadcast('authService:loginSuccess', token);
                }
            }
        });

        function setPracticeIdFromToken(token) {
            const base64Url = token.split('.')[1];
            
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            }).join(''));

            const decodeTk = JSON.parse(jsonPayload);           

            if (decodeTk['DSS_PracticeId_Selected'] !== null && decodeTk['DSS_PracticeId_Selected'] !== undefined) {
                sessionStorage.setItem(
                    'practiceIdSelected',
                    decodeTk['DSS_PracticeId_Selected']


                );
            }
        }

        // processed globally ...
        function addTokenToGlobalList(token) {
            var url = '';
            // This code is processed separately for each apteryx token ... there is an implementation in each of those services.
            if (token === 'apteryx-imaging') {
                url = IdmConfig.apteryxUrlPart;

                //Add the tokenName and urls to the TokenList so the bearer token will be applied when it needs to be applied.
                globalTokenList.addToTokenList(token, [url]);
            } else if (token === 'apteryx-imaging2') {
                url = IdmConfig.apteryx2UrlPart;

                //Add the tokenName and urls to the TokenList so the bearer token will be applied when it needs to be applied.
                globalTokenList.addToTokenList(token, [url]);
            } else {
                url = IdmConfig.applicationVariableForLoginToken;

                //Add the tokenName and urls to the TokenList so the bearer token will be applied when it needs to be applied.
                globalTokenList.addToTokenList(token, [url]);

                // we are moving code between environments so to support this for the time being we need to setup a new url pattern for fuse to utilize as an alternative.
                var newUrl = IdmConfig.newApplicationVariableForLoginToken;
                globalTokenList.addToTokenList('newFuseLogin', [newUrl]);
            }
        }

        function getApteryxSitename(defaultSiteName) {
            if (IdmConfig.apteryxUsePracticeIdForSiteName.toLowerCase() === 'true') {
                var practice = platformSessionService.getSessionStorage('userPractice');
                if (practice === null) {
                    console.log('Issue finding User Practice record.');
                    return null;
                }

                return practice.id;
            } else {
                return defaultSiteName;
            }
        }

        function getIsLoggedIn() {
            return genericOidcService.getIsLoggedIn(tokenName);
        }

        // Setup refresh for the initial login and if there is a browser refresh
        if (window == window.parent) {
            // Only do this if we are in the root window - not a nested iframe
            // Do this for all tokens as other tokens services may not be loaded yet
            // if there is a browser refresh
            _.forEach(AUTH_TOKEN_NAMES, function (tn) {
                // Ensure the token is in session storage and login actually succeeded
                if (
                    genericOidcService.getAccessToken(tn) !== null &&
                    genericOidcService.getAccessToken(tn) !== ''
                ) {
                    addTokenToGlobalList(tn);
                    genericOidcService.startRefresh(tn);
                }
            });
        }

        function login() {
            genericOidcService.initImplicitFlow(tokenName, tokenState);
        }

        function logout() {
            console.log('Logging out');
            var list = globalTokenList.getList();

            // foreach value in globalTokenList where x is not fuseLogin remove
            _.forEach(list, function (thing, list) {
                if (thing.name === 'apteryx-imaging') {
                    console.log('Apteryx Signout');
                    // sign-out of this one.
                    createSignoutIframe(
                        IdmConfig.apteryxUrlSiteName,
                        IdmConfig.apteryxUrlPart
                    );
                } else if (thing.name === 'apteryx-imaging2') {
                    console.log('Apteryx 2 Signout');
                    // sign-out of this one.
                    createSignoutIframe(
                        IdmConfig.apteryx2UrlSiteName,
                        IdmConfig.apteryx2UrlPart
                    );
                }
            });

            var idToken = genericOidcService.getIdToken(tokenName);
            genericOidcService.logOut();

            // removing locations from session values.
            sessionStorage.removeItem('activeLocations');
            // removing Imaging vendors
            sessionStorage.removeItem('practiceImagingVendors');

            window.location.href =
                logoutUrl +
                '?id_token_hint=' +
                idToken +
                '&post_logout_redirect_uri=' +
                encodeURIComponent(postLogoutRedirectUrl);
        }

        function createSignoutIframe(siteName, urlPart) {
            var url =
                'https://' +
                getApteryxSitename(siteName) +
                '.' +
                urlPart +
                '/account/logoff';
            console.log(url);
            if (url !== null) {
                var iframe = document.createElement('iframe');
                iframe.style.display = 'block';
                iframe.style.height = '1px';
                iframe.style.width = '1px';
                iframe.src = url;
                document.body.appendChild(iframe);
            }
        }

        function getCachedToken() {
            return genericOidcService.getAccessToken(tokenName);
        }

        function refresh() {
            return genericOidcService.refresh(genericOidcService, tokenName);
        }

        var service = {
            tokenName: tokenName,
            tokenState: tokenState,
            login: login,
            logout: logout,
            getIsLoggedIn: getIsLoggedIn,
            getCachedToken: getCachedToken,
            refresh: refresh
        };
        return service;
    }
})();
(function () {
    // Logout the user on all Fuse tabs and windows
    // if they log out on one

    'use strict';
    var app = angular.module('PatCoreSecurity'); //Assume module has already been defined elsewhere

    app.factory('monitorLogoutService', monitorLogoutService);

    monitorLogoutService.$inject = ['$window', '$rootScope'];
    function monitorLogoutService($window, $rootScope) {
        var storage = $window.localStorage;
        var key = 'monitorLogoutService.fuseUserLoggedInToken';
        var callbacks = [];

        if (!storage.getItem(key)) {
            // Key already exists, user is logged in
            storage.setItem(key, key);
        }

        var wrap = function (event) {
            if (event.key === key && !event.newValue) {
                _.forEach(callbacks, function (callback) {
                    callback();
                });
            }
        };

        if ($window.addEventListener)
            $window.addEventListener('storage', wrap, false);
        else $window.attachEvent('onstorage', wrap);

        function notifyOfLogOut() {
            storage.removeItem(key);
        }

        function onExternalLogout(callback) {
            callbacks.push(callback);
        }

        var svc = {
            notifyOfLogOut: notifyOfLogOut,
            onExternalLogout: onExternalLogout,
        };

        return svc;
    }
})();
(function () {
    'use strict';

    var factoryName = 'patSecurityService';
    var dependencies = [
        '$http',
        'ENTERPRISE_URL',
        '$rootScope',
        'patAuthenticationService',
        '$log',
        'versionService',
        'APPLICATION_ABBREVIATION',
        'ROOT_URL',
        'PREVENT_VERSIONED_APP_REDIRECT',
        'APP_VERSION',
        'platformSessionService',
        'monitorLogoutService',
        'platformSessionCachingService',
    ];

    var app = angular.module('PatWebCore');
    app.factory(factoryName, secFactory);
    secFactory.$inject = dependencies;

    function secFactory(
        $http,
        ENTERPRISE_URL,
        $rootScope,
        patAuthenticationService,
        $log,
        versionService,
        APPLICATION_ABBREVIATION,
        ROOT_URL,
        PREVENT_VERSIONED_APP_REDIRECT,
        APP_VERSION,
        platformSessionService,
        monitorLogoutService,
        platformSessionCachingService
    ) {
        function getAccessLevel(levelId) {
            switch (levelId) {
                case 0:
                    return 'Inactive';
                case 1:
                    return 'Enterprise';
                case 2:
                    return 'Practice';
                case 3:
                    return 'Location';
                case 4:
                    return 'RestrictedPractice';
                case 5:
                    return 'RestrictedEnterprise';
            }
            throw Error('unknown access level');
        }

        function setAuthContext(userContext) {
            var json = JSON.parse(angular.toJson(userContext));
            var accessLevel = getAccessLevel(json.Result.User.AccessLevel);

            var authContext = {
                isAuthorized: true,
                accessLevel: accessLevel,
                userInfo: {
                    username: json.Result.User.UserName,
                    firstname: json.Result.User.FirstName,
                    lastname: json.Result.User.LastName,
                    userid: json.Result.User.UserId,
                },
            };
            $rootScope.patAuthContext = authContext;
            platformSessionService.setSessionStorage('patAuthContext', authContext);
        }

        var userAccess = [];
        function loadAccessInformationIfNotLoaded() {
            // exit if userAccess has already been populated.
            if (!_.isEmpty(userAccess)) {
                return;
            }
            var userContext = platformSessionCachingService.userContext.get();
            var allAccess = userContext.Result.Access;

            _.forEach(allAccess, function (a) {
                var access = {
                    AccessLevel: a.AccessLevel,
                    Id: a.Id,
                    Privileges: {},
                };

                _.forEach(a.Privileges, function (p) {
                    access.Privileges[p.Name] = p.Id;
                });

                userAccess.push(access);
            });
        }

        function storeUserContext(data) {
            platformSessionCachingService.userContext.set(data);

            loadAccessInformationIfNotLoaded();
        }

        function launchVersionedApp() {
            var rootUrl = window.location.protocol + '//' + window.location.host;
            window.location.replace(
                rootUrl +
                '/' +
                versionService.getClientVersionUri() +
                '/index.html?v=' +
                APP_VERSION
            );
        }

        function initUserContext() {
            var matrixUrl =
                ENTERPRISE_URL +
                '/api/userauths?applicationabbreviation=' +
                APPLICATION_ABBREVIATION;
            $http
                .get(matrixUrl)
                .then(function (res) {
                    storeUserContext(res.data);
                    setAuthContext(res.data);                    
                    localStorage.removeItem('ultEndTime');
                    localStorage.removeItem('cachedULTVersion');
                    $rootScope.$broadcast('patwebcore:loginSuccess');
                    var preventApplaunch = PREVENT_VERSIONED_APP_REDIRECT === 'true';
                    if (preventApplaunch === false) {
                        launchVersionedApp();
                    }
                })
                .catch(function (res) {
                    toastr.options = { positionClass: 'toast-bottom-right' };
                    toastr.error('Login Failure!<br/> Please contact support');
                    $rootScope.$broadcast('patwebcore:loginFailure');
                    console.log('login failed');
                });
        }

        function login() {
            patAuthenticationService.login();
        }

        $rootScope.$on('authService:loginSuccess', function (ev, user) {
            //console.log('authService:loginSuccess');
            initUserContext();
        });

        var getCurrentLocation = function () {
            return platformSessionService.getSessionStorage('userLocation');
        };

        var getCurrentPractice = function () {
            return platformSessionService.getSessionStorage('userPractice');
        };

        function isEnterpriseUserAmfaAuthorizedByName(amfaName) {
            loadAccessInformationIfNotLoaded();

            return !_.isUndefined(userAccess[0].Privileges[amfaName]);
        }

        // combine with method above at some point.
        function isPracticeUserAmfaAuthorizedByName(amfaName) {
            loadAccessInformationIfNotLoaded();

            return !_.isUndefined(userAccess[0].Privileges[amfaName]);
        }

        function isRestrictedPracticeUserAmfaAuthorizedByName(amfaName) {
            loadAccessInformationIfNotLoaded();

            var currentLocation = getCurrentLocation();
            if (currentLocation === null) {
                return false;
            }
            var access = userAccess.filter(function (l) {
                return l.Id === currentLocation.id;
            });
            if (access === null) {
                return false;
            }
            return !_.isUndefined(access[0].Privileges[amfaName]);
        }

        function isAmfaAuthorizedByNameAtLocation(amfaName, locationId) {
            loadAccessInformationIfNotLoaded();

            if (
                $rootScope.patAuthContext.accessLevel === 'Practice' &&
                !_.isUndefined(userAccess[0].Privileges[amfaName])
            ) {
                return true;
            }

            var access = userAccess.filter(function (l) {
                return l.AccessLevel === 3 && l.Id === locationId;
            });
            if (access === null || access.length === 0) {
                return false;
            }
            return !_.isUndefined(access[0].Privileges[amfaName]);
        }

        function isRestrictedEnterpriseUserAmfaAuthorizedByName(amfaName) {
            loadAccessInformationIfNotLoaded();

            var currentPractice = getCurrentPractice();
            if (currentPractice === null) {
                return false;
            }
            var access = userAccess.filter(function (l) {
                return l.Id === currentPractice.id;
            });
            if (access === null) {
                return false;
            }
            return !_.isUndefined(access[0].Privileges[amfaName]);
        }

        function isAmfaAuthorizedByName(amfaName) {
            switch ($rootScope.patAuthContext.accessLevel) {
                case 'Enterprise':
                    return isEnterpriseUserAmfaAuthorizedByName(amfaName);
                case 'Practice':
                    return isPracticeUserAmfaAuthorizedByName(amfaName);
                case 'Location':
                    return isRestrictedPracticeUserAmfaAuthorizedByName(amfaName);
                case 'RestrictedPractice':
                    return isRestrictedPracticeUserAmfaAuthorizedByName(amfaName);
                case 'RestrictedEnterprise':
                    return isRestrictedEnterpriseUserAmfaAuthorizedByName(amfaName);
                default:
                    return false;
            }
        }

        function deleteUserContext() {
            platformSessionCachingService.userContext.remove();
            sessionStorage.removeItem('userPractice');
            sessionStorage.removeItem('userLocation');
            sessionStorage.removeItem('patAuthContext');
            sessionStorage.removeItem('continueProcessingCall');
        }

        function getUser() {
            var result = platformSessionCachingService.userContext.get();
            if (result !== null) {
                return result.Result.User;
            }
            return null;
        }

        function getLocationId() {
            var result = platformSessionService.getSessionStorage('userLocation');
            if (result !== null) {
                return result.id;
            }
            return null;
        }

        function getIsLoggedIn() {
            return patAuthenticationService.getIsLoggedIn();
        }

        function logout() {
            var locationId = getLocationId();
            var path = '/api/v1/locations/' + locationId + '/j430dclaims';
            monitorLogoutService.notifyOfLogOut();
            patAuthenticationService.logout();
            deleteUserContext();
            // Clear the access_token cookie if one exists.
            // This cookie was created for use in embedding pdfs for claims.
            document.cookie =
                'access_token=; path=' +
                path +
                '; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        }

        var service = {
            login: login,
            logout: logout,
            getUser: getUser,
            getIsLoggedIn: getIsLoggedIn,
            isAmfaAuthorizedByName: isAmfaAuthorizedByName,
            isAmfaAuthorizedByNameAtLocation: isAmfaAuthorizedByNameAtLocation,
            launchVersionedApp: launchVersionedApp,
        };
        return service;
    }
})();

var app = angular.module('PatWebCore');
app.service('uniqueIdentifier', function () {
    this.getId = function () {
        var s4 = function () {
            return Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
        };
        var identifier =
            s4() +
            s4() +
            '-' +
            s4() +
            '-' +
            s4() +
            '-' +
            s4() +
            '-' +
            s4() +
            s4() +
            s4();
        return identifier;
    };
});
(function () {
    'use strict';
    var app = angular.module('PatWebCore');
    app.factory('configSettingsService', [
        'DOMAIN_API_URL',
        '$injector',
        function (DOMAIN_API_URL, $injector) {
            var loadSettings = function () {
                var url = DOMAIN_API_URL + '/configsettings';
                var $http = $injector.get('$http');
                return $http.get(url).then(function (res) {
                    service.apimSubscriptionKey = res.data.Value.ApimSubscriptionKey;
                    service.apimNotiSubscriptionKey = res.data.Value.ApimNotiSubscriptionKey;
                    service.scanningKey = res.data.Value.ScanningKey;
                    service.settingsLoaded = true;

                    Dynamsoft.DWT.ProductKey = service.scanningKey;
                });
            };

            var service = {
                settingsLoaded: false,
                loadSettings: loadSettings,
                apimSubscriptionKey: '',
                apimNotiSubscriptionKey: '',
                scanningKey: ''
            };
            return service;
        },
    ]);
})();
(function () {
    'use strict';
    var app = angular.module('PatWebCore');
    app.factory('uriService', [
        'WEB_API_URL',
        'PLATFORM_USER_SERVICE_URL',
        'versionService',
        function (WEB_API_URL, PLATFORM_USER_SERVICE_URL, versionService) {
            var getWebApiUri = function () {
                return WEB_API_URL.replace(
                    /WEBAPIVERSION/g,
                    versionService.getVersionedApiUri()
                );
            };
            var getPlatformUserServiceApiUri = function () {
                return PLATFORM_USER_SERVICE_URL.replace(
                    /WEBAPIVERSION/g,
                    versionService.getVersionedApiUri()
                );
            };
            var service = {
                getWebApiUri: getWebApiUri,
                getPlatformUserServiceApiUri: getPlatformUserServiceApiUri,
            };
            return service;
        },
    ]);
})();
(function () {
    'use strict';
    var app = angular.module('PatCoreUtility', []);
    app.factory('platformSessionCachingService', [
        'platformSessionService',
        function platformSessionCachingFactory(platformSessionService) {
            var cache = {};

            function getDataFactoryItem(key) {
                return {
                    get: function () {
                        var value = cache[key];
                        if (_.isNil(value)) {
                            value = platformSessionService.getSessionStorage(key);
                            cache[key] = value;
                        }
                        return value;
                    },
                    set: function (value) {
                        if (platformSessionService.setSessionStorage(key, value) === true) {
                            cache[key] = value;
                        }
                    },
                    remove: function () {
                        platformSessionService.removeSessionStorage(key);
                        cache[key] = null;
                    },
                };
            }

            return {
                userContext: getDataFactoryItem('userContext'),
            };
        },
    ]);
})();
(function () {
    'use strict';
    var app = angular.module('PatCoreUtility');
    app.factory('platformSessionService', [
        function platformFactory() {
            return {
                getSessionStorage: getSessionStorage,
                setSessionStorage: setSessionStorage,
                removeSessionStorage: removeSessionStorage,
                getLocalStorage: getLocalStorage,
                setLocalStorage: setLocalStorage,
            };

            function getSessionStorage(key) {
                var value = JSON.parse(sessionStorage.getItem(key));

                if (value === null || value === undefined) {
                    return null;
                } else {
                    return value;
                }
            }

            function setSessionStorage(key, value) {
                if (value === null || value === undefined) {
                    return false;
                }
                try {
                    sessionStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (err) {
                    return false;
                }
            }

            function removeSessionStorage(key) {
                sessionStorage.removeItem(key);
            }

            function getLocalStorage(key) {
                var value = JSON.parse(localStorage.getItem(key));

                if (value === null || value === undefined) {
                    return null;
                } else {
                    return value;
                }
            }

            function setLocalStorage(key, value) {
                if (value === null || value === undefined) {
                    return false;
                }
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (err) {
                    return false;
                }
            }
        },
    ]);
})();

(function () {
    'use strict';
    var app = angular.module('PatWebCore');
    app.factory('versionService', [
        'platformSessionCachingService',
        function verFactory(platformSessionCachingService) {
            var getVersionUri = function () {
                var result = platformSessionCachingService.userContext.get();
                if (
                    result === null ||
                    result.Result === null ||
                    result.Result.Version === null
                ) {
                    return null;
                }
                return result.Result.Version.ClientUri;
            };
            var getEntApiUri = function () {
                var result = platformSessionCachingService.userContext.get();
                if (
                    result === null ||
                    result.Result === null ||
                    result.Result.Version === null
                ) {
                    return null;
                }
                return result.Result.Version.WebApiUri;
            };
            var getClientVersionName = function () {
                var result = platformSessionCachingService.userContext.get();
                if (result === null && result.Result.Version === null) {
                    return null;
                }
                return result.Result.Version.ClientVersion;
            };

            var getVersionedApiName = function () {
                var result = platformSessionCachingService.userContext.get();
                if (
                    result === null ||
                    result.Result === null ||
                    result.Result.Version === null
                ) {
                    return null;
                }
                return result.Result.Version.WebApiVersion;
            };

            var service = {
                getClientVersionUri: getVersionUri,
                getVersionedApiUri: getEntApiUri,
                getClientVersionName: getClientVersionName,
                getVersionedApiName: getVersionedApiName,
            };
            return service;
        },
    ]);
})();
(function () {
    'use strict';
    var app = angular.module('PatWebCore');
    app.factory('tabLauncher', [
        '$window',

        function ($window) {
            var launchNewTab = function (urlToLaunch) {
                let date = Date.now(); // get me time in milliseconds

                localStorage.setItem(
                    date + '|' + 'patAuthContext',
                    sessionStorage.getItem('patAuthContext')
                );
                localStorage.setItem(
                    date + '|' + 'fuseLogin',
                    sessionStorage.getItem('fuseLogin')
                );
                localStorage.setItem(
                    date + '|' + 'newFuseLogin',
                    sessionStorage.getItem('newFuseLogin')
                );
                localStorage.setItem(
                    date + '|' + 'userPractice',
                    sessionStorage.getItem('userPractice')
                );
                localStorage.setItem(
                    date + '|' + 'userLocation',
                    sessionStorage.getItem('userLocation')
                );
                localStorage.setItem(
                    date + '|' + 'userContext',
                    sessionStorage.getItem('userContext')
                );
                localStorage.setItem(
                    date + '|' + 'continueProcessingCall',
                    sessionStorage.getItem('continueProcessingCall')
                );
                localStorage.setItem(
                    date + '|' + 'practiceImagingVendors',
                    sessionStorage.getItem('practiceImagingVendors')
                );
                localStorage.setItem(
                    date + '|' + 'apteryx-imaging2',
                    sessionStorage.getItem('apteryx-imaging2')
                );
                localStorage.setItem(
                    date + '|' + 'userSelectedLocationfromPAAG',
                    sessionStorage.getItem('userSelectedLocationfromPAAG')
                );

                var params = 'newTab=true&newKey=' + date;
                if (urlToLaunch.indexOf('?') > 0) {
                    $window.open(urlToLaunch + '&' + params, '_blank');
                } else {
                    $window.open(urlToLaunch + '?' + params, '_blank');
                }
            };
            var service = {
                launchNewTab: launchNewTab,
            };
            return service;
        },
    ]);
})();
// Extending vendor libraries' functionality
(function () {
    'use strict';

    if (_.escape) {
        let baseFn = _.escape;
        _.escape = str => {
            let result = baseFn(str);
            result = result.replace(/({\s?)*{/g, '{').replace(/(}\s?)*}/g, '}');
            return result;
        };
    }
})();
(function () {
    'use strict';
    var app = angular.module('PatWebCore');
    app.config([
        '$provide',
        function ($provide) {
            $provide.decorator('$window', [
                '$delegate',
                function windowOpenDecorator($delegate) {
                    const originalOpenFunc = $delegate.open;

                    function openTabWithLink(url, name, specs, replace) {
                        if (
                            name &&
                            !window.PattersonWindow.isFirefox &&
                            name === '_blank'
                        ) {
                            var link = document.createElement('A');
                            link.href = url;
                            link.target = name;
                            if (window.PattersonWindow.isChrome) {
                                link.rel = 'noreferrer';
                            }
                            link.click();
                        } else {
                            return originalOpenFunc(url, name, specs, replace);
                        }
                    }

                    $delegate.open = openTabWithLink;

                    return $delegate;
                },
            ]);
        },
    ]);
})(); // Extending the javascript window object
(function () {
    'use strict';
    window.PattersonWindow = {};
    // eslint-disable-next-line no-undef
    window.PattersonWindow.isOpera =
        (!!window.opr && !!opr.addons) ||
        !!window.opera ||
        navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    window.PattersonWindow.isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    window.PattersonWindow.isSafari =
        Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') >
        0;
    // Internet Explorer 6-11
    window.PattersonWindow.isIE = /*@cc_on!@*/ false || !!document.documentMode;
    // Edge 20+
    window.PattersonWindow.isEdge =
        !window.PattersonWindow.isIE && !!window.StyleMedia;
    // Chrome 1+
    window.PattersonWindow.isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
    window.PattersonWindow.isBlink =
        (window.PattersonWindow.isChrome || window.PattersonWindow.isOpera) &&
        !!window.CSS;
})();
