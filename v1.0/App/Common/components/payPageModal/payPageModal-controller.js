(function () {
    'use strict';
  
    angular
      .module('common.controllers')
      .controller('PayPageModalController', payPageModalController);
  
      payPageModalController.$inject = [
      '$scope',
      '$uibModalInstance',
      '$window',
      '$timeout',
      'item',
    ];
  
    function payPageModalController(
      $scope,
      $uibModalInstance,
      $window,
      $timeout,
      item
    ) {
   
    $scope.item = item;
   
        
    var ctrl = this;
    $scope.paypageRedirectEventSubscription = null;
    $scope.showPayPageModal = true;
    ctrl.init = function(){ 
            sessionStorage.setItem('isPaypageModalOpen', 'true');
            $scope.modalLoading =true;
    }

    ctrl.init();

     // Create an Observable-like event callback
    $scope.paypageRedirectEvent = function(callback) {
      const eventListener = (event) => {
        callback(event);
        };
      $window.addEventListener('paypageRedirectCallback', eventListener);

    // Return a subscription object
     return {
        unsubscribe: function() {
            $window.removeEventListener('paypageRedirectCallback', eventListener);
        }
    };
   };
 

    $window.addEventListener('beforeunload', function(event) {
            $scope.preventRefreshPage(event);
     });

    $scope.preventRefreshPage = function(event) {
              event.preventDefault();
        
              // Adding a listener for the 'unload' event
              $window.addEventListener('unload', function() {
                $scope.closePaypageModal();
              });
        
              // Return to prevent the page unload behavior
              return;
    };

    $scope.closePaypage= function () {
            if ($window.confirm('Are you sure you want to close the paypage? All incomplete transactions will be lost.')) {
              $scope.closePaypageModal()
            }
    }

    $scope.closePaypageModal = function () {
             sessionStorage.removeItem('isPaypageModalOpen');
              $uibModalInstance.dismiss();
    };


    $scope.init = function() {
      $scope.paypageRedirectEventSubscription = $scope.paypageRedirectEvent((event) => {
        sessionStorage.removeItem('isPaypageModalOpen');
        $uibModalInstance.close(true)
      });
    };

   $scope.init();

     // Watch for changes in showPayPageModal
  $scope.$watch('showPayPageModal', function(newValue, oldValue) {
    if (newValue) {  // Only do this when the modal is shown
      $timeout(function() {
        const embedElement = document.querySelector('.paypage');
        if (embedElement) {
          embedElement.addEventListener('load', function() {
            $scope.modalLoading = false; // Hide the loader
            $scope.$apply(); // Ensure AngularJS updates the view
          });
        }
      }, 0); // Delay to ensure the DOM has updated
    }
  });

    $scope.$on('$destroy', function() {
        if ($scope.paypageRedirectEventSubscription) {
           $scope.paypageRedirectEventSubscription.unsubscribe();
           $scope.showPayPageModal = false;
         }
   });


    }
  })();