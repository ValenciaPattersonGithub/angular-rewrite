describe('cardReaderModal ->', function () {
    var compile,rootScope, scope, controller, mInstance,mockCardReaders;
  
    beforeEach(module('common.controllers'));
  
    beforeEach(inject(function ($rootScope, $controller,$compile) {
      mInstance = {
        close: function () {},
        dismiss: function () {},
      };
      rootScope = $rootScope;
      compile= $compile

      scope = rootScope.$new();
      mockCardReaders =[{DeviceFriendlyName:"citi" ,PartnerDeviceId:"citi"},{DeviceFriendlyName:"US bank" ,PartnerDeviceId:"Us bank"}]
      controller = $controller('CardReaderController', {
        $scope: scope,
        $uibModalInstance: mInstance,
        item: {cardReaders:mockCardReaders},
      });
    }));
  
    describe('Click on OK button of CardReaderModal -> ', function () {
     
        function compileButton() {
            var element = angular.element('<button id="btnCardReaderOk" ng-click="okClick()" ng-disabled="!selectedCardReader" class="btn btn-primary">OK</button>');
            compile(element)(scope);
            scope.$digest();
            return element;
          }

     it('should disable OK button when card reader not selected', function() {
            // Set selectedCardReader to a falsy value (null, undefined, false, etc.)
            scope.selectedCardReader = null;
        
            var button = compileButton();
        
            // Check if the button has the disabled attribute
            expect(button.attr('disabled')).toBeTruthy();
      });


     it('should enable OK button when selectedCardReader is truthy', function() {
    // Set selectedCardReader to a truthy value
      scope.selectedCardReader = 'citi';

      var button = compileButton();

      // Check if the button does not have the disabled attribute
      expect(button.attr('disabled')).toBeFalsy();
     });

    it('should call close modal on click of OK button', function () {
        scope.selectedCardReader ='citi';
        spyOn(mInstance, 'close');
        scope.okClick();
  
        expect(mInstance.close).toHaveBeenCalled();
      });
    });
  
    describe('Click on Cancel button of CardReaderModal -> ', function () {
      it('should call close', function () {
        spyOn(mInstance, 'dismiss');
        scope.cancelClick();
  
        expect(mInstance.dismiss).toHaveBeenCalled();
      });
    });
  });
  