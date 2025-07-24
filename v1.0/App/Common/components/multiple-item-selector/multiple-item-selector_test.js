describe('multiple-item-selector ->', function () {
  var localize, scope, ctrl;

  var locationsMock = [
    {
      LocationId: 1,
      NameLine1: 'First Office',
      AddressLine1: '123 Apple St',
      AddressLine2: 'Suite 10',
      ZipCode: '62401',
      City: 'Effingham',
      State: 'IL',
      PrimaryPhone: '5551234567',
    },
    {
      LocationId: 2,
      NameLine1: 'Second Office',
      AddressLine1: '123 Count Rd',
      AddressLine2: '',
      ZipCode: '62858',
      City: 'Louisville',
      State: 'IL',
      PrimaryPhone: '5559876543',
    },
    {
      LocationId: 3,
      NameLine1: 'Third Office',
      AddressLine1: '123 Adios St',
      AddressLine2: '',
      ZipCode: '60601',
      City: 'Chicago',
      State: 'IL',
      PrimaryPhone: '3124567890',
    },
    {
      LocationId: 4,
      NameLine1: 'Fourth Office',
      AddressLine1: '123 Hello Rd',
      AddressLine2: '',
      ZipCode: '62895',
      City: 'Wayne City',
      State: 'IL',
      PrimaryPhone: '6187894563',
      SecondaryPhone: '6181234567',
    },
  ];

  var userLocationsMock = [
    {
      LocationId: 3,
      NameLine1: 'Third Office',
      AddressLine1: '123 Adios St',
      AddressLine2: '',
      ZipCode: '60601',
      City: 'Chicago',
      State: 'IL',
      PrimaryPhone: '3124567890',
    },
  ];

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('common.directives'));

  beforeEach(
    module('Soar.Common', function ($provide) {
      localize = {
        getLocalizedString: jasmine.createSpy(),
      };
      $provide.value('localize', localize);
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    scope.fullList = angular.copy(locationsMock);
    scope.selectedItems = angular.copy(userLocationsMock);
    scope.key = 'LocationId';
    scope.textProperty = 'NameLine1';
    scope.valueProperty = 'LocationId';
    scope.displayName = 'Location';
    ctrl = $controller('MultipleItemSelectorCtrl', {
      $scope: scope,
    });
  }));

  describe('controller ->', function () {
    it('should initialize the controller', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('init function ->', function () {
    it('should set text values', function () {
      expect(localize.getLocalizedString).toHaveBeenCalledWith('Location');
      expect(localize.getLocalizedString).toHaveBeenCalledWith('Select');
      expect(localize.getLocalizedString).toHaveBeenCalledWith('Add');
    });
  });

  describe('addGenericProperties function ->', function () {
    it('should add properties to each item in the fullList', function () {
      ctrl.addGenericProperties(scope.fullList);
      angular.forEach(scope.fullList, function (item) {
        expect(item.Text).toBe(item[scope.textProperty]);
        expect(item.Value).toBe(item[scope.valueProperty]);
      });
    });

    it('should add properties to each item in the selectedItems list', function () {
      ctrl.addGenericProperties(scope.selectedItems);
      angular.forEach(scope.selectedItems, function (item) {
        expect(item.Text).toBe(item[scope.textProperty]);
        expect(item.Value).toBe(item[scope.valueProperty]);
      });
    });
  });

  describe('addItemToSelectedItemsList function ->', function () {
    it('should add item param to selectItems list and remove it from fullList', function () {
      expect(scope.selectedItems.length).toBe(1);
      expect(scope.fullList.length).toBe(4);
      scope.addItemToSelectedItemsList(2);
      expect(scope.selectedItems.length).toBe(2);
      expect(scope.fullList.length).toBe(3);
      expect(scope.selectedItemValue).toBeNull();
    });
  });

  describe('selectAll function ->', function () {
    it('should call addItemToSelectedItemsList for each item in the fullList', function () {
      spyOn(scope, 'addItemToSelectedItemsList');
      scope.selectAll();
      expect(scope.addItemToSelectedItemsList.calls.count()).toEqual(4);
    });
  });

  describe('removeItemFromSelectedItemsList function ->', function () {
    it('should remove item param from selectItems list and add it back to fullList', function () {
      expect(scope.selectedItems.length).toBe(1);
      expect(scope.fullList.length).toBe(4);
      scope.removeItemFromSelectedItemsList(3);
      expect(scope.selectedItems.length).toBe(0);
      expect(scope.fullList.length).toBe(5);
    });
  });
});
