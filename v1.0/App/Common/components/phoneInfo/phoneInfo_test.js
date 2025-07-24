describe('phoneInfo-directive -> ', function () {
  var scope;
  var newPhoneMock = {
    ContactId: null,
    PhoneNumber: '',
    Type: null,
    TextOk: false,
    Notes: null,
    ObjectState: 1,
    IsPrimary: false,
  };
  var phoneTypesMock = {
    Value: [{ Name: 'Mobile' }, { Name: 'Home' }, { Name: 'Work' }],
  };
  var saveStatesMock = { Delete: -1, None: 0, Add: 1, Update: 2 };
  var staticDataMock = {
    PhoneTypes: function () {
      return {
        then: function () {
          return phoneTypesMock;
        },
      };
    },
  };

  beforeEach(module('common.directives'));
  beforeEach(module('common.controllers'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    scope.phones = [{ PhoneNumber: null, ContactId: null }];

    $controller('PhoneInfoController', {
      $scope: scope,
      StaticData: staticDataMock,
      SaveStates: saveStatesMock,
    });
  }));

  it('should set scope properties', function () {
    expect(scope.flags.editing).toBe(false);
    scope.init();
    expect(scope.phones.length).toBe(1);
  });

  describe('init function -> ', function () {
    it('should add a phone when phones.length is equal to 0', function () {
      scope.init();

      expect(scope.phones.length).toBe(1);
    });
  });

  describe('addPhone function -> ', function () {
    it('should not call phones.push when a phone number is null', function () {
      spyOn(scope.phones, 'push');
      scope.addPhone();
      expect(scope.phones.push).not.toHaveBeenCalled();
    });

    it('should not call phones.push when a phone number is not length of 10', function () {
      spyOn(scope.phones, 'push');
      scope.phones[0].PhoneNumber = '1234';
      scope.addPhone();

      expect(scope.phones.push).not.toHaveBeenCalled();
    });

    it('should not call phones.push when max limit has been reached', function () {
      spyOn(scope.phones, 'push');
      scope.maxLimit = 1;
      scope.phones[0].PhoneNumber = '1234567890';
      scope.addPhone();

      expect(scope.phones.push).not.toHaveBeenCalled();
    });

    it('should add new phone when a phone number is length of 10 and max limit is not reached', function () {
      scope.maxLimit = 5;
      scope.phones[0].PhoneNumber = '1234567890';
      scope.addPhone();

      expect(scope.phones.length).toBe(1);
    });
  });

  describe('removePhone function -> ', function () {
    it('should remove phone when function is called', function () {
      scope.phones[0].PhoneNumber = '1234567890';
      scope.phones.push(newPhoneMock);
      scope.phones[1].ObjectState = 1;

      scope.removePhone(scope.phones[1]);

      expect(scope.phones.length).toBe(1);
    });

    it('should set State to Delete when phone State is not Add', function () {
      scope.phones[0].ObjectState = saveStatesMock.None;

      scope.removePhone(scope.phones[0]);

      expect(scope.phones.length).toBe(1);
    });
  });

  describe('$watch phone objects hasErrors property', function () {
    it('should set validPhones to false when any hasErrors is true', function () {
      scope.phones[0].hasErrors = true;
      scope.phones[0].ObjectState = 1;
      scope.$apply();

      expect(scope.validPhones).toBe(false);
    });

    it('should set validPhones to true when any hasErrors is true and ObjectState NOT Add or Update', function () {
      scope.phones[0].hasErrors = true;
      scope.phones[0].ObjectState = 3;
      scope.$apply();

      expect(scope.validPhones).toBe(true);
    });
  });

  //describe('$watch phoneType.Name function -> ', function () {

  //    it('should not call updatePhones function when no custom phone types changed', function () {
  //        spyOn(scope, 'updatePhones');
  //        scope.phoneTypes = angular.copy(phoneTypesMock.Value);
  //        scope.phoneTypes.push({ Name: 'Custom' });
  //        scope.$apply();
  //        scope.phoneTypes[3].Name = 'Custom';
  //        scope.$apply();

  //        expect(scope.updatePhones).not.toHaveBeenCalled();
  //    });

  //    it('should call updatePhones function when a custom phone type changes', function () {
  //        spyOn(scope, 'updatePhones');
  //        scope.phoneTypes = angular.copy(phoneTypesMock.Value);
  //        scope.phoneTypes.push({ Name: 'Customs' });
  //        scope.$apply();
  //        scope.phoneTypes[3].Name = 'Custom';
  //        scope.$apply();

  //        expect(scope.updatePhones).toHaveBeenCalled();
  //    });
  //});

  //describe('updatePhones function -> ', function () {

  //    it('should change the phoneType when there is a new value and phoneType matches its old value', function () {
  //        scope.phones.push(newPhoneMock);
  //        scope.phones[0].Type = 'Customs';

  //        scope.updatePhones('Custom', 'Customs');

  //        expect(scope.phones[0].Type).toEqual('Custom');
  //    });
  //});
});
