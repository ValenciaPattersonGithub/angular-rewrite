describe('PayPageModalController', function() {
    var $controller, $scope, $uibModalInstance, $window, $timeout, controller;

    beforeEach(module('common.controllers'));

    beforeEach(inject(function(_$controller_, _$rootScope_, _$window_, _$timeout_) {
        $scope = _$rootScope_.$new();
        $controller = _$controller_;
        $window = _$window_;
        $timeout = _$timeout_;
        
        $uibModalInstance = {
            dismiss: jasmine.createSpy('dismiss'),
            close: jasmine.createSpy('close')
        };

        controller = $controller('PayPageModalController', {
            $scope: $scope,
            $uibModalInstance: $uibModalInstance,
            $window: $window,
            $timeout: $timeout,
            item: { payPageUrl: 'https://example.com/pay' }
        });
    }));

    it('should initialize with correct values', function() {
        expect($scope.item.payPageUrl).toBe('https://example.com/pay');
        expect($scope.showPayPageModal).toBe(true);
        expect(sessionStorage.getItem('isPaypageModalOpen')).toBe('true');
    });

    it('should close the modal and remove session storage on closePaypageModal', function() {
        $scope.closePaypageModal();
        expect(sessionStorage.getItem('isPaypageModalOpen')).toBeTruthy();
        expect($uibModalInstance.dismiss).toHaveBeenCalled();
    });

    it('should confirm before closing paypage', function() {
        spyOn($window, 'confirm').and.returnValue(true);
        spyOn($scope, 'closePaypageModal');

        $scope.closePaypage();

        expect($window.confirm).toHaveBeenCalled();
        expect($scope.closePaypageModal).toHaveBeenCalled();
    });


    
  describe('window:beforeunload', function() {
    beforeEach(function () {
      $window = { 
        addEventListener: jasmine.createSpy('addEventListener'), 
        removeEventListener: jasmine.createSpy('removeEventListener') 
      };
      spyOn(localStorage, 'removeItem');
    });
    it('should call preventDefault when showPayPageModal is true', function() {
      // Arrange
      $scope.showPayPageModal = true;
      const event = jasmine.createSpyObj('event', ['preventDefault']);
  
      // Act
      $scope.preventRefreshPage(event);
  
      // Assert
      expect(event.preventDefault).toHaveBeenCalled();
    });


  });


  
  describe('paypageRedirectCallback->' , function(){

    it('should create a paypageRedirectEvent subscription and invoke callback on event', function() {
      const mockEvent = new Event('paypageRedirectCallback'); // Create a proper Event object
      spyOn(mockEvent, 'type').and.returnValue('paypageRedirectCallback');
  
      const callbackSpy = jasmine.createSpy('callback');
      
      const subscription = $scope.paypageRedirectEvent(callbackSpy);
      window.dispatchEvent(new Event('paypageRedirectCallback'));
      
      expect(callbackSpy).toHaveBeenCalledWith(mockEvent);

      subscription.unsubscribe();
      window.dispatchEvent(new Event('paypageRedirectCallback'));

      expect(callbackSpy.calls.count()).toBe(1); // Callback shouldn't be called again after unsubscribe
    });

    it('should initialize paypageRedirectEvent and close modal', function() {
      $scope.showPayPageModal = true; 
      $scope.transactionInformation = {PaymentGatewayTransactionId:4356};
      const mockEvent = new Event('paypageRedirectCallback'); // Create a proper Event object
      spyOn(mockEvent, 'type').and.returnValue('paypageRedirectCallback');
  
  
      $scope.init();
      window.dispatchEvent(new Event('paypageRedirectCallback'));
  
      expect($uibModalInstance.close).toHaveBeenCalled();
      expect($uibModalInstance.close).toHaveBeenCalledWith(true);

     });
     it('should unsubscribe event on $destroy', function() {
        spyOn($scope, 'paypageRedirectEvent').and.callThrough();
        var subscription = $scope.paypageRedirectEvent(() => {});
        spyOn(subscription, 'unsubscribe');

        $scope.paypageRedirectEventSubscription = subscription;
        $scope.$destroy();

        expect(subscription.unsubscribe).toHaveBeenCalled();
    });


  })
});
