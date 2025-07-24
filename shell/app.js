'use strict';

// Get/set a unique browser id
const browserIdKey = 'iamBrowserId';
var browserId = localStorage.getItem(browserIdKey);
if (!browserId) {
    browserId = crypto.randomUUID();
    localStorage.setItem(browserIdKey, browserId);
}

// Start LaunchDarkly client
const context = {
    kind: 'browserid',
    key: browserId
};
const options = {};
const ldclient = LDClient.initialize(window.IamLaunchDarklyClientId, context, options);

var app;
if (window === window.parent) {
  app = angular.module('SoarShell', ['patUi', 'PatWebCore']);
} else {
  app = angular.module('SoarShell', ['oauth2', 'PatCoreSecurity']);
}

var finishStartup = function (forceDuendeFlag) {
  app.constant('FORCE_DUENDE', forceDuendeFlag);
  angular.module('patUi').constant('FORCE_DUENDE', forceDuendeFlag);

  if (window === window.parent) {
    app.run([
      '$rootScope',
      '$timeout',
      '$uibModal',
      function ($rootScope, $timeout, $uibModal) {
        var loadingModal;
        var scope = $rootScope.$new();

        $rootScope.$on('patwebcore:loginSuccess', function () {
          scope.message = 'authorization data';
          if (!loadingModal) {
            loadingModal = $uibModal.open({
              template:
                '<div>' +
                '  <i class="fa fa-spinner fa-4x fa-spin"></i><br/>' +
                '  <label style="padding-top: 5px">Loading {{ message }}...</label>' +
                '</div>',
              size: 'sm',
              windowClass: 'modal-loading',
              backdrop: 'static',
              keyboard: false,
              scope: scope,
            });
          }
          localStorage.setItem('isFirstVisit', 'true');
        });

        //$rootScope.$on('patwebcore:loginSuccess', function () {
        //    scope.message = "application";
        //});

        $rootScope.$on('patwebcore:loginFailure', function () {
          if (loadingModal) {
            loadingModal.dismiss();
            loadingModal = null;
          }
        });
      },
    ]);
  } else {
    // Assume we are within the token refresh IFrame
    // Don't load all of Soar aka Fuse
    // Only load what is neccessary to refresh the token
    app.run(['patAuthenticationService', function (patAuthenticationService) { }]);
  }

  // Now bootstrap angular.  
  // This needs to be done manually here and not automatically via ng-app/DomReady, 
  // because we needed to let LaunchDarkly init first.
  angular.element(function () {
    angular.bootstrap(document, ['SoarShell']);
  });
};

// Wait 2 seconds max for LaunchDarkly to get the flag value, else fallback to legacy auth
const maxFlagWaitSeconds = 2;

ldclient.waitForInitialization(maxFlagWaitSeconds).then(function() {
  const forceDuendeFlag = ldclient.variation('release-fuse-duende-authentication', false);
  finishStartup(forceDuendeFlag);
}, function(err) {
  // If LD init error, or timeout, use legacy auth
  console.error('Error initializing LaunchDarkly client:', err);
  finishStartup(false);
});
